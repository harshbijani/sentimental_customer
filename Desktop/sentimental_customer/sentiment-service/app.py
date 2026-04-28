from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel, ValidationError
from typing import Optional
from analyser import analyse
import os

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def index():
    return jsonify({"service": "sentiment-analysis", "status": "running"}), 200

class SentimentRequest(BaseModel):
    text:      str
    user_id:   Optional[str] = None
    timestamp: Optional[str] = None

class SentimentResponse(BaseModel):
    text:       str
    sentiment:  str
    color:      str
    score:      float
    textblob:   dict
    vader:      dict
    confidence: float
    timestamp:  str

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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"🐍 Python sentiment service running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)