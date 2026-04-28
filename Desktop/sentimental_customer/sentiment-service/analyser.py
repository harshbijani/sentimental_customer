from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from datetime import datetime, timezone

_vader = SentimentIntensityAnalyzer()

COLOR_MAP = {
    "positive": "#059669",
    "neutral":  "#d97706",
    "negative": "#dc2626",
}

def analyse(text: str, user_id: str = None, timestamp: str = None) -> dict:
    # VADER
    vader_raw = _vader.polarity_scores(text)
    compound  = vader_raw["compound"]

    # TextBlob
    blob = TextBlob(text)

    # Label
    if compound >= 0.05:
        label = "positive"
    elif compound <= -0.05:
        label = "negative"
    else:
        label = "neutral"

    # Confidence: average of VADER and TextBlob absolute scores
    confidence = round((abs(compound) + abs(blob.sentiment.polarity)) / 2, 4)

    return {
        "text":       text,
        "sentiment":  label,
        "color":      COLOR_MAP[label],
        "score":      round(compound, 4),
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
        "confidence": confidence,
        "timestamp":  timestamp or datetime.now(timezone.utc).isoformat(),
        "user_id":    user_id,
    }