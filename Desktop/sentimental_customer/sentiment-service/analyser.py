import re
import emoji
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from datetime import datetime, timezone
from transformers import pipeline

_vader = SentimentIntensityAnalyzer()

sentiment_model = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment"
)

emotion_model = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=1
)

try:
    sarcasm_model = pipeline(
        "text-classification",
        model="lxyuan/distilbert-base-sarcasm"
    )
    def detect_sarcasm(text):
        result = sarcasm_model(text)[0]
        return result["label"].lower() == "sarcasm" and result["score"] > 0.7
except Exception as e:
    print("Sarcasm model failed to load, falling back to keyword detection:", e)
    def detect_sarcasm(text):
        sarcasm_phrases = ["oh great", "just amazing", "fantastic", "wonderful job"]
        return any(phrase in text.lower() for phrase in sarcasm_phrases)

COLOR_MAP = {
    "positive": "#059669",
    "neutral":  "#d97706",
    "negative": "#dc2626",
}

EMOTION_MAP = {
    "joy":      "Excited / Happy",
    "anger":    "Angry",
    "sadness":  "Sad",
    "fear":     "Anxious",
    "surprise": "Surprised",
    "disgust":  "Disgusted",
    "neutral":  "Neutral"
}

DISPLAY_EMOTION_MAP = {
    "excited": {
        "key":   "excited",
        "label": "Excited",
        "emoji": "🤩",
        "color": "#7c3aed",
        "bg":    "#ede9fe",
        "border":"rgba(124, 58, 237, 0.2)",
    },
    "happy": {
        "key":   "happy",
        "label": "Happy",
        "emoji": "😊",
        "color": "#059669",
        "bg":    "#d1fae5",
        "border":"rgba(5, 150, 105, 0.2)",
    },
    "neutral": {
        "key":   "neutral",
        "label": "Neutral",
        "emoji": "😐",
        "color": "#d97706",
        "bg":    "#fef3c7",
        "border":"rgba(217, 119, 6, 0.2)",
    },
    "unhappy": {
        "key":   "unhappy",
        "label": "Unhappy",
        "emoji": "😢",
        "color": "#2563eb",
        "bg":    "#dbeafe",
        "border":"rgba(37, 99, 235, 0.2)",
    },
    "frustrated": {
        "key":   "frustrated",
        "label": "Frustrated",
        "emoji": "😤",
        "color": "#dc2626",
        "bg":    "#fee2e2",
        "border":"rgba(220, 38, 38, 0.2)",
    },
}

def get_display_emotion(emotion: str, label: str, score: float) -> dict:
    """
    Maps internal emotion + sentiment label to one of 5 display emotions.
    Stricter thresholds so Excited is rare, Happy and Neutral get fair coverage.
    """
    if emotion in ("Sarcastic", "Frustrated", "Warning"):
        return DISPLAY_EMOTION_MAP["frustrated"]

    if label == "positive":
        if abs(score) >= 0.75 and emotion in ("Excited / Happy",):
            return DISPLAY_EMOTION_MAP["excited"]

        if abs(score) >= 0.85 and emotion == "Surprised":
            return DISPLAY_EMOTION_MAP["excited"]

        return DISPLAY_EMOTION_MAP["happy"]

    if label == "negative":
        if emotion in ("Angry", "Disgusted"):
            return DISPLAY_EMOTION_MAP["frustrated"]
        return DISPLAY_EMOTION_MAP["unhappy"]

    return DISPLAY_EMOTION_MAP["neutral"]

def preprocess_text(text):
    text = emoji.demojize(text, delimiters=(" ", " "))
    text = text.replace("_", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text

def detect_issue(text):
    issue_phrases = [
        "can't access", "cannot access", "cant access", "not working",
        "doesn't work", "doesnt work", "nothing happens", "unable to", "issue",
        "bug", "error", "failed", "fail", "crash", "crashes", "stuck",
        "won't load", "wont load", "not loading", "can't login", "cant login",
        "unable to login", "poor review", "bad decision", "terrible choice",
        "not acceptable", "unbelievable", "ridiculous"
    ]
    return any(phrase in text.lower() for phrase in issue_phrases)

def detect_warning(text):
    warning_phrases = [
        "be careful", "buyer beware", "warning", "alert", "caution",
        "do not buy", "avoid", "stay away"
    ]
    return any(phrase in text.lower() for phrase in warning_phrases)

def analyse(text: str, user_id: str = None, timestamp: str = None) -> dict:
    cleaned_text = preprocess_text(text)

    final_compound = None
    emotion_text = cleaned_text

    if " but " in cleaned_text.lower():
        parts = re.split(r"\bbut\b", cleaned_text, flags=re.IGNORECASE)
        if len(parts) >= 2:
            first_part  = parts[0].strip()
            second_part = parts[1].strip()

            first_score  = _vader.polarity_scores(first_part)["compound"]
            second_score = _vader.polarity_scores(second_part)["compound"]

            final_compound = (first_score * 0.3) + (second_score * 0.7)

            if second_score < -0.2:
                label = "negative"
                final_compound = second_score
            elif second_score > 0.2:
                label = "positive"
                final_compound = second_score
            else:
                label = "neutral"
                final_compound = 0.0

            emotion_text = second_part

    vader_raw = _vader.polarity_scores(cleaned_text)
    compound  = vader_raw["compound"] if final_compound is None else round(final_compound, 4)

    blob = TextBlob(cleaned_text)

    # HuggingFace sentiment
    hf_sentiment  = sentiment_model(cleaned_text)[0]
    label_mapping = {"LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"}
    label         = label_mapping.get(hf_sentiment["label"], "neutral")

    # Override for "but" sentences below
    if final_compound is not None:
        if compound >= 0.05:
            label = "positive"
        elif compound <= -0.05:
            label = "negative"
        else:
            label = "neutral"

    # BUT Logic
    if abs(compound) < 0.3 and " but " in cleaned_text.lower():
        label    = "neutral"
        compound = 0.0

    hf_emotion = emotion_model(emotion_text)[0][0]
    emotion    = EMOTION_MAP.get(hf_emotion["label"].lower(), "Neutral")

    if detect_sarcasm(cleaned_text):
        emotion  = "Sarcastic"
        label    = "negative"
        compound = -0.4

    elif detect_issue(cleaned_text):
        emotion  = "Frustrated"
        label    = "negative"
        compound = -0.5

    elif detect_warning(cleaned_text):
        emotion  = "Warning"
        label    = "negative"
        compound = -0.4

    if label == "neutral":
        blended_score = 0.0
    else:
        hf_score = hf_sentiment["score"]
        if label == "negative":
            hf_score = -hf_score
        blended_score = round((compound * 0.5) + (hf_score * 0.5), 4)

    # Map to one of 5 display emotions
    display_emotion = get_display_emotion(emotion, label, blended_score)

    return {
        "text":            text,
        "sentiment":       label,
        "emotion":         emotion,
        "display_emotion": display_emotion,
        "color":           COLOR_MAP[label],
        "score":           blended_score,
        "textblob": {
            "polarity":     round(blob.sentiment.polarity, 4),
            "subjectivity": round(blob.sentiment.subjectivity, 4),
        },
        "vader": {
            "positive": round(vader_raw["pos"], 4),
            "neutral":  round(vader_raw["neu"], 4),
            "negative": round(vader_raw["neg"], 4),
            "compound": round(compound, 4),
        },
        "confidence": round(hf_sentiment["score"], 4),
        "timestamp":  timestamp or datetime.now(timezone.utc).isoformat(),
        "user_id":    user_id,
    }