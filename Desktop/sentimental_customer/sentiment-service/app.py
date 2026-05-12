from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel, ValidationError
from typing import Optional
from analyser import analyse
from file_parser import parse_file, split_into_chunks
import os
import tempfile

app = Flask(__name__)
CORS(app)

MAX_FILE_SIZE_MB = 10

# ── Pydantic Models ──────────────────────────────────────

class SentimentRequest(BaseModel):
    text:      str
    user_id:   Optional[str] = None
    timestamp: Optional[str] = None

class SentimentResponse(BaseModel):
    text:            str
    sentiment:       str
    emotion:         str
    display_emotion: dict
    color:           str
    score:           float
    textblob:        dict
    vader:           dict
    confidence:      float
    timestamp:       str

# ── Routes ───────────────────────────────────────────────

@app.route("/", methods=["GET"])
def index():
    return jsonify({"service": "sentiment-analysis", "status": "running"}), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    body = request.get_json(force=True, silent=True) or {}

    try:
        req = SentimentRequest(**body)
    except ValidationError as e:
        return jsonify({"error": "Invalid request", "details": e.errors()}), 400

    if not req.text.strip():
        return jsonify({"error": "text must not be empty"}), 400

    result = analyse(
        text=req.text.strip(),
        user_id=req.user_id,
        timestamp=req.timestamp,
    )

    try:
        validated = SentimentResponse(**result)
    except ValidationError as e:
        return jsonify({"error": "Response validation failed", "details": e.errors()}), 500

    return jsonify(validated.model_dump()), 200


@app.route("/analyze-file", methods=["POST"])
def analyze_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    # Check file size
    file.seek(0, 2)
    size_mb = file.tell() / (1024 * 1024)
    file.seek(0)

    if size_mb > MAX_FILE_SIZE_MB:
        return jsonify({"error": f"File too large. Max size is {MAX_FILE_SIZE_MB}MB"}), 413

    # Save to temp file
    suffix = os.path.splitext(file.filename)[1].lower()
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        # Parse file into text
        text = parse_file(tmp_path)

        if not text.strip():
            return jsonify({"error": "Could not extract text from file"}), 422

        # Split into chunks and analyse each
        chunks  = split_into_chunks(text, max_chars=500)
        results = [analyse(chunk) for chunk in chunks]

        # Aggregate overall sentiment
        scores     = [r["score"] for r in results]
        avg_score  = round(sum(scores) / len(scores), 4)
        sentiments = [r["sentiment"] for r in results]
        emotions   = [r["display_emotion"]["key"] for r in results]

        # Most common sentiment and emotion
        overall_sentiment = max(set(sentiments), key=sentiments.count)
        overall_emotion   = max(set(emotions),   key=emotions.count)

        # Emotion counts across all chunks
        emotion_counts = {
            "excited":    emotions.count("excited"),
            "happy":      emotions.count("happy"),
            "neutral":    emotions.count("neutral"),
            "unhappy":    emotions.count("unhappy"),
            "frustrated": emotions.count("frustrated"),
        }

        # Dominant display_emotion object
        dominant_display = next(
            r["display_emotion"] for r in results
            if r["display_emotion"]["key"] == overall_emotion
        )

        return jsonify({
            "filename":         file.filename,
            "total_chunks":     len(chunks),
            "overall_sentiment": overall_sentiment,
            "overall_score":    avg_score,
            "overall_emotion":  dominant_display,
            "emotion_counts":   emotion_counts,
            "color":            results[0]["color"] if results else "#d97706",
            "chunks": [
                {
                    "index":           i,
                    "text":            r["text"],
                    "sentiment":       r["sentiment"],
                    "score":           r["score"],
                    "display_emotion": r["display_emotion"],
                    "confidence":      r["confidence"],
                }
                for i, r in enumerate(results)
            ],
        }), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 415
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"🐍 Python sentiment service running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)