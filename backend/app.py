from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import re
from collections import Counter
from cryptography.fernet import Fernet
import hashlib

app = Flask(__name__)
CORS(app)

# BASE DIRECTORY 
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# FILE PATHS
MODEL_FILE = os.path.join(BASE_DIR, "rule_model.json")
SUBMISSION_FILE = os.path.join(BASE_DIR, "submissions.json")
USER_FILE = os.path.join(BASE_DIR, "users.json")
KEY_FILE = os.path.join(BASE_DIR, "secret.key")

# LOAD MODEL FROM JSON
try:
    with open(MODEL_FILE, "r", encoding="utf-8") as f:
        model = json.load(f)

    positive_words = model.get("positive_words", [])
    negative_words = model.get("negative_words", [])
    negations = model.get("negations", [])
    intensifiers = model.get("intensifiers", [])
    diminishers = model.get("diminishers", [])
    contrast_words = model.get("contrast_words", [])
    strong_positive = model.get("strong_positive", [])
    strong_negative = model.get("strong_negative", [])
    domain_positive = model.get("domain_positive", [])
    domain_negative = model.get("domain_negative", [])
    sarcasm_phrases = model.get("sarcasm_phrases", [])
    phrase_rules = model.get("phrase_rules", {})

except Exception as e:
    print("Model loading error:", e)

# FILE STORAGE INIT
if not os.path.exists(SUBMISSION_FILE):
    with open(SUBMISSION_FILE, "w") as f:
        json.dump([], f)

if not os.path.exists(USER_FILE):
    with open(USER_FILE, "w") as f:
        json.dump([], f)

# ENCRYPTION
try:
    with open(KEY_FILE, "rb") as f:
        key = f.read()
    cipher = Fernet(key)
except:
    cipher = None

# HELPERS
def load_submissions():
    with open(SUBMISSION_FILE, "r") as f:
        return json.load(f)

def save_submissions(data):
    with open(SUBMISSION_FILE, "w") as f:
        json.dump(data, f, indent=4)

def load_users():
    with open(USER_FILE, "r") as f:
        return json.load(f)

def save_users(data):
    with open(USER_FILE, "w") as f:
        json.dump(data, f, indent=4)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# SENTIMENT FUNCTION
def check_phrases(text):
    for phrase, sentiment in phrase_rules.items():
        if phrase in text:
            return sentiment
    return None

def predict_sentiment(text):

    text = text.lower()

    result = check_phrases(text)
    if result:
        return result, 2

    for phrase in sarcasm_phrases:
        if phrase in text:
            return "negative", -2

    words = re.findall(r'\b\w+\b', text)

    for cw in contrast_words:
        if cw in words:
            idx = words.index(cw)
            words = words[idx+1:]
            break

    score = 0

    for i, word in enumerate(words):

        window = words[max(0, i-3):i]

        negated = any(w in negations for w in window)
        intensified = any(w in intensifiers for w in window)
        diminished = any(w in diminishers for w in window)

        weight = 1
        if intensified:
            weight = 2
        elif diminished:
            weight = 0.5

        if word in strong_positive:
            score += 3
            continue

        if word in strong_negative:
            score -= 3
            continue

        if word in domain_positive:
            score += 1.5
            continue

        if word in domain_negative:
            score -= 1.5
            continue

        if word in positive_words:
            score += -weight if negated else weight

        elif word in negative_words:
            score += weight if negated else -weight

    if score > 0.5:
        return "positive", score
    elif score < -0.5:
        return "negative", score
    else:
        return "neutral", score

# REGISTER
@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing fields"}), 400

    users = load_users()

    for u in users:
        if u["username"] == username:
            return jsonify({"error": "User already exists"}), 409

    users.append({
        "username": username,
        "password": hash_password(password)
    })

    save_users(users)

    return jsonify({"message": "Registration successful"})

# LOGIN
@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    users = load_users()

    for user in users:
        if user["username"].lower() == username.lower() and user["password"] == hash_password(password):
            role = user.get("role", "student")
            return jsonify({"role": role, "message": "Login successful"})

    return jsonify({"error": "Invalid credentials"}), 401

# PREDICT
@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()
    name = data.get("name")
    feedback = data.get("feedback")

    if not name or not feedback:
        return jsonify({"error": "Missing fields"}), 400

    submissions = load_submissions()

    for s in submissions:
        if s["name"].lower() == name.lower():
            return jsonify({"error": "Already submitted"}), 409

    sentiment, score = predict_sentiment(feedback)

    if cipher:
        feedback_enc = cipher.encrypt(feedback.encode()).decode()
    else:
        feedback_enc = feedback

    submissions.append({
        "name": name,
        "feedback": feedback_enc,
        "sentiment": sentiment,
        "score": score
    })

    save_submissions(submissions)

    return jsonify({
        "message": "Submitted",
        "sentiment": sentiment,
        "score": score
    })

# ADMIN STATS
@app.route("/admin/stats", methods=["GET"])
def stats():

    submissions = load_submissions()

    return jsonify({
        "total_feedbacks": len(submissions),
        "positive": sum(1 for s in submissions if s["sentiment"] == "positive"),
        "negative": sum(1 for s in submissions if s["sentiment"] == "negative"),
        "neutral": sum(1 for s in submissions if s["sentiment"] == "neutral")
    })

# TOP NEGATIVE
@app.route("/admin/top-negative", methods=["GET"])
def top_negative():

    submissions = load_submissions()
    negatives = [s for s in submissions if s["sentiment"] == "negative"]

    result = []

    for s in negatives[:10]:
        try:
            text = cipher.decrypt(s["feedback"].encode()).decode()
        except:
            text = s["feedback"]

        result.append({
            "name": s["name"],
            "feedback": text
        })

    return jsonify(result)

# COMMON TOPICS
@app.route("/admin/common-topics", methods=["GET"])
def topics():

    submissions = load_submissions()

    stop_words = {"the","and","is","in","to","of","a","for","it","was"}

    pos_words, neg_words = [], []

    for s in submissions:

        try:
            text = cipher.decrypt(s["feedback"].encode()).decode().lower()
        except:
            text = s["feedback"].lower()

        words = [w for w in re.findall(r'\b\w+\b', text)
                 if w not in stop_words and len(w) > 2]

        if s["sentiment"] == "positive":
            pos_words.extend(words)
        elif s["sentiment"] == "negative":
            neg_words.extend(words)

    return jsonify({
        "top_positive_topics": [w for w, _ in Counter(pos_words).most_common(10)],
        "top_negative_topics": [w for w, _ in Counter(neg_words).most_common(10)]
    })

# SENTIMENT TREND
@app.route("/admin/sentiment-trend", methods=["GET"])
def sentiment_trend():

    submissions = load_submissions()

    dates = []
    pos_counts = []
    neg_counts = []
    neu_counts = []

    pos = 0
    neg = 0
    neu = 0

    for i, s in enumerate(submissions):
        if s["sentiment"] == "positive":
            pos += 1
        elif s["sentiment"] == "negative":
            neg += 1
        else:
            neu += 1

        dates.append(f"Entry {i+1}")
        pos_counts.append(pos)
        neg_counts.append(neg)
        neu_counts.append(neu)

    return jsonify({
        "dates": dates,
        "positive": pos_counts,
        "negative": neg_counts,
        "neutral": neu_counts
    })

# RUN SERVER 
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
