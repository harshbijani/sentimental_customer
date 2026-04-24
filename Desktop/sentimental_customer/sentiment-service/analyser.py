from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

_analyser = SentimentIntensityAnalyzer()

POSITIVE_THRESHOLD =  0.05
NEGATIVE_THRESHOLD = -0.05


def analyse(text: str) -> dict:
    """
    Returns a dict with:
      label    : "positive" | "neutral" | "negative"
      compound : float in [-1, 1]
      scores   : { positive, neutral, negative }
    """
    raw = _analyser.polarity_scores(text)
    compound = raw["compound"]

    if compound >= POSITIVE_THRESHOLD:
        label = "positive"
    elif compound <= NEGATIVE_THRESHOLD:
        label = "negative"
    else:
        label = "neutral"

    return {
        "label": label,
        "compound": round(compound, 4),
        "scores": {
            "positive": round(raw["pos"], 4),
            "neutral":  round(raw["neu"], 4),
            "negative": round(raw["neg"], 4),
        },
    }