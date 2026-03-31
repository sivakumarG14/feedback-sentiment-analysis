#  Student Feedback Sentiment Analysis System

> A full-stack web application that collects student course feedback through a multi-step survey, automatically analyzes the sentiment (Positive / Negative / Neutral) using a **Rule-Based NLP Model**, encrypts feedback for privacy, and presents insights on an **Admin Analytics Dashboard** with charts and word clouds.

---

##  Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Architecture Diagram](#-architecture-diagram)
5. [Project File Structure](#-project-file-structure)
6. [Detailed File Descriptions](#-detailed-file-descriptions)
7. [How the Sentiment Analysis Works](#-how-the-sentiment-analysis-works)
8. [API Endpoints](#-api-endpoints)
9. [User Roles & Authentication Flow](#-user-roles--authentication-flow)
10. [How to Run the Project](#-how-to-run-the-project)
11. [Sample Data](#-sample-data)
12. [Screenshots / Pages Overview](#-screenshots--pages-overview)

---

##  Project Overview

| Aspect | Details |
|--------|---------|
| **Project Title** | Student Feedback Sentiment Analysis Using NLP |
| **Domain** | Natural Language Processing (NLP) / Education |
| **Purpose** | Collect student feedback on courses and automatically classify it as Positive, Negative, or Neutral |
| **Approach** | Rule-Based Sentiment Analysis (no ML training required at runtime) |
| **Security** | Feedback is encrypted using Fernet (AES-128-CBC) before storage |
| **Users** | Students (submit feedback) and Admins (view analytics) |

---

##  Key Features

### For Students
-  **User Registration & Login** — Students create an account and log in securely
-  **10-Question Multi-Step Survey** — Covers overall experience, teaching quality, course content, difficulty, materials, engagement, likes, improvements, and suggestions
-  **Progress Bar** — Visual indicator showing survey completion progress
-  **Conditional Questions** — Extra explanation box appears for certain selections (e.g., "Good" or "Poor" experience)
-  **One Submission Per Student** — Prevents duplicate submissions

### For Admins
-  **Analytics Dashboard** — View overall sentiment statistics at a glance
-  **Pie Chart** — Sentiment distribution (Positive vs Negative vs Neutral)
-  **Bar Chart** — Sentiment comparison
-  **Word Cloud** — Visual representation of frequently mentioned topics
-  **Top Negative Feedback** — List of the most critical student complaints
-  **Keyword Extraction** — Top positive and negative keywords from feedback
-  **Sentiment Trend Over Time** — Line chart showing sentiment changes
-  **Auto-Refresh** — Dashboard refreshes every 10 seconds

### Security
-  **Password Hashing** — SHA-256 hashing for stored passwords
-  **Feedback Encryption** — Fernet symmetric encryption for all stored feedback text
-  **CORS Enabled** — Allows frontend-backend communication across origins

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Python 3, Flask |
| **Sentiment Engine** | Rule-Based NLP (custom `rule_model.json`) |
| **Data Storage** | JSON files (`submissions.json`, `users.json`) |
| **Encryption** | `cryptography` library (Fernet) |
| **Password Security** | `hashlib` (SHA-256) |
| **Charts** | [Chart.js](https://www.chartjs.org/) |
| **Word Cloud** | [wordcloud2.js](https://github.com/timdream/wordcloud2.js) |
| **API Communication** | RESTful JSON APIs with `fetch()` |
| **Cross-Origin** | `flask-cors` |

---

##  Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND (Browser)                  │
│                                                          │
│  login.html ──► student-login.html ──► index.html        │
│       │                                  (Survey Form)   │
│       └──► admin-login.html ──► admin.html               │
│                                  (Analytics Dashboard)   │
│                                                          │
│  Uses: style.css, script.js, admin.js                    │
│  Libs: Chart.js, wordcloud2.js                           │
└──────────────────┬───────────────────────────────────────┘
                   │  HTTP REST API (JSON)
                   │  (fetch calls to http://127.0.0.1:5000)
                   ▼
┌──────────────────────────────────────────────────────────┐
│                BACKEND (Flask Server — app.py)            │
│                                                          │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ /register   │  │ /predict         │  │ /login      │ │
│  │ /login      │  │ (Sentiment Fn)   │  │             │ │
│  └─────────────┘  └──────────────────┘  └─────────────┘ │
│                                                          │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │/admin/stats │  │/admin/top-negative│ │/admin/       │ │
│  │             │  │                  │  │common-topics │ │
│  └─────────────┘  └──────────────────┘  └─────────────┘ │
│                                                          │
│  Sentiment Engine: rule_model.json                       │
│  Encryption: Fernet (secret.key)                         │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│                   DATA STORAGE (JSON Files)               │
│                                                          │
│  submissions.json — Encrypted feedback + sentiment       │
│  users.json       — Registered user credentials          │
│  rule_model.json  — Sentiment lexicon & rules            │
│  secret.key       — Fernet encryption key                │
└──────────────────────────────────────────────────────────┘
```

---

##  Project File Structure

```
feedbackanalysissystem/
│
├── index.html                  # Student feedback survey form (main page)
├── login.html                  # Login portal (choose Student or Admin)
├── student-login.html          # Student login page
├── admin-login.html            # Admin login page
├── register.html               # Student registration page
├── style.css                   # Global dark-themed stylesheet
├── script.js                   # Survey form logic (steps, validation, submission)
├── admin.html                  # Admin analytics dashboard
├── admin.js                    # Dashboard logic (charts, stats, word cloud)
├── requirements.txt            # Python dependencies
│
├── backend/
│   ├── app.py                  # Flask server (API endpoints + sentiment engine)
│   ├── rule_model.json         # NLP sentiment lexicon and phrase rules
│   ├── generate_key.py         # One-time script to generate encryption key
│   ├── secret.key              # Fernet encryption key (auto-generated)
│   ├── submissions.json        # Stored feedback data (encrypted)
│   ├── users.json              # Registered user accounts
│   ├── Rule-Based-Sentiment Analysis.ipynb  # Jupyter notebook (model development)
│   └── tsv_to_csv.ipynb        # Jupyter notebook (data format conversion)
│
└── data/
    ├── Education_Feedback.csv                          # Raw feedback dataset (~175 MB)
    ├── ReadyToTrain_data_2col_with_subjectivity_final.tsv  # Training data (~173 MB)
    ├── Student Feedback Sentiment Analysis Using NLP.docx  # Project documentation
    └── project_plan_up.docx                            # Project plan document
```

---

##  Detailed File Descriptions

### Frontend Files

| File | Purpose |
|------|---------|
| `login.html` | **Entry point** — Portal page with two buttons: "Student Login" and "Admin Login". Routes users to the appropriate login page. |
| `student-login.html` | Student authentication page. Sends credentials to `/login` API. On success, stores `studentName` in `localStorage` and redirects to `index.html`. |
| `admin-login.html` | Admin authentication page. Sends credentials to `/login` API. Checks if role is `admin`. On success, stores `adminUser` in `localStorage` and redirects to `admin.html`. |
| `register.html` | New student registration form. Sends username & password to `/register` API. On success, redirects to login page after 1.5 seconds. |
| `index.html` | **Main survey page** — 10-step feedback form with progress bar. Validates each step before advancing. Collects all answers and sends combined feedback text to `/predict` API. Shows sentiment result. |
| `style.css` | Global CSS — Dark theme (`#0f0f0f` background), glass-card containers, Netflix-red accent (`#e50914`), responsive layout, focus animations, progress bar styling. |
| `script.js` | Survey step navigation (next/previous), progress bar updates, input validation, conditional question logic, and async feedback submission via `fetch`. |
| `admin.html` | **Admin Dashboard** — Displays stats cards (Total, Positive, Negative, Neutral), Pie Chart, Bar Chart, Word Cloud, Top Negative Feedback list, Keyword lists (positive & negative), and Sentiment Trend line chart. Uses Chart.js and wordcloud2.js. Has its own inline styles (light theme with Poppins font). |
| `admin.js` | Fetches data from all admin API endpoints, renders Chart.js charts (pie, bar, line), generates word cloud, populates keyword lists. Auto-refreshes every 10 seconds. |

### Backend Files

| File | Purpose |
|------|---------|
| `app.py` | **Flask server** — Contains all API routes, sentiment analysis engine, encryption/decryption logic, user management, and file I/O helpers. Runs on port `10000` by default. |
| `rule_model.json` | **Sentiment lexicon** — JSON dictionary containing: positive words, negative words, negation terms, intensifiers, diminishers, contrast words, strong positive/negative words, domain-specific terms, sarcasm phrases, and phrase-level rules. |
| `generate_key.py` | One-time utility script to generate a Fernet encryption key and save it to `secret.key`. |
| `secret.key` | Binary file containing the 32-byte Fernet encryption key. |
| `submissions.json` | JSON array of all submitted feedback entries. Each entry contains: `name`, `feedback` (encrypted), `sentiment`, and `score`. |
| `users.json` | JSON array of registered users with `username` and `password` (SHA-256 hashed). |

### Data Files

| File | Purpose |
|------|---------|
| `Education_Feedback.csv` | Large raw educational feedback dataset used for model research/development. |
| `ReadyToTrain_data_2col_with_subjectivity_final.tsv` | Preprocessed training data with subjectivity labels (used in notebook). |
| `*.docx` files | Project documentation and plan documents. |

---

##  How the Sentiment Analysis Works

The system uses a **Rule-Based Sentiment Analysis** approach (no machine learning model at runtime). Here is the scoring pipeline:

### Step-by-Step Process

```
Input Text
    │
    ▼
1. Convert to Lowercase
    │
    ▼
2. Check Phrase Rules (exact phrase match)
   ├── Match found → Return sentiment immediately
   │   e.g., "not good" → negative, "well explained" → positive
   │
    ▼
3. Check Sarcasm Phrases
   ├── Match found → Return "negative" with score -2
   │   e.g., "yeah right", "as if", "just great"
   │
    ▼
4. Tokenize into Words
    │
    ▼
5. Handle Contrast Words ("but", "however", "although")
   └── Discard everything BEFORE the contrast word
       Only the part AFTER "but" determines sentiment
    │
    ▼
6. Score Each Word using a sliding window of 3 previous words:
   │
   ├── Strong Positive (excellent, amazing, outstanding) → +3
   ├── Strong Negative (worst, terrible, useless)        → -3
   ├── Domain Positive (easy, clear, interactive)        → +1.5
   ├── Domain Negative (confusing, complex, unclear)     → -1.5
   ├── Regular Positive (good, helpful, great)           → +1
   ├── Regular Negative (bad, poor, boring)              → -1
   │
   Modified by context:
   ├── Negation (not, no, never) → Flips the sign
   ├── Intensifier (very, extremely, really) → Weight × 2
   └── Diminisher (slightly, somewhat, barely) → Weight × 0.5
    │
    ▼
7. Final Classification:
   ├── Score > 0.5   → POSITIVE
   ├── Score < -0.5  → NEGATIVE
   └── Otherwise     → NEUTRAL
```

### Example

| Feedback | Process | Score | Result |
|----------|---------|-------|--------|
| "The teacher is very good" | "very" (intensifier ×2) + "good" (+1) = +2 | +2 | ✅ Positive |
| "Not helpful at all" | "not" (negation) + "helpful" (flip) = -1 | -1 | ❌ Negative |
| "It was boring but the labs were excellent" | Contrast → only "labs were excellent" | +3 | ✅ Positive |
| "The course was okay" | No sentiment words matched | 0 | ⚪ Neutral |

---

## 🔌 API Endpoints

All endpoints are served by the Flask backend at `http://127.0.0.1:5000` (default port: 10000).

### Authentication

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `POST` | `/register` | `{ "username": "...", "password": "..." }` | `{ "message": "Registration successful" }` | Register a new student account |
| `POST` | `/login` | `{ "username": "...", "password": "..." }` | `{ "role": "student", "message": "Login successful" }` | Authenticate a user |

### Feedback

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| `POST` | `/predict` | `{ "name": "...", "feedback": "..." }` | `{ "sentiment": "positive", "score": 2.5 }` | Submit feedback, get sentiment result. Feedback is encrypted before storage. |

### Admin Analytics

| Method | Endpoint | Response | Description |
|--------|----------|----------|-------------|
| `GET` | `/admin/stats` | `{ "total": 20, "positive": 7, "negative": 3, "neutral": 10 }` | Overall feedback statistics |
| `GET` | `/admin/top-negative` | `[{ "name": "...", "feedback": "..." }, ...]` | Top 10 negative feedback entries (decrypted) |
| `GET` | `/admin/common-topics` | `{ "positive_topics": [...], "negative_topics": [...] }` | Top 10 frequently mentioned words in positive and negative feedback |

---

##  User Roles & Authentication Flow

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────────┐
│  login.html │──►     │ student-login    │──►     │   index.html    │
│  (Portal)   │        │ POST /login      │        │  (Survey Form)  │
│             │        │ role = "student" │        │  Submit → /predict│
│             │        └──────────────────┘        └─────────────────┘
│             │
│             │        ┌──────────────────┐        ┌─────────────────┐
│             │──►     │ admin-login      │──►     │   admin.html    │
│             │        │ POST /login      │        │  (Dashboard)    │
│             │        │ role = "admin"   │        │  Charts + Stats │
└─────────────┘        └──────────────────┘        └─────────────────┘
                              │
                              │  New users
                              ▼
                       ┌──────────────────┐
                       │  register.html   │
                       │  POST /register  │
                       └──────────────────┘
```

- **Session Management**: Uses `localStorage` to store `studentName` or `adminUser`
- **Logout**: Clears `localStorage` and redirects to `login.html`

---

##  How to Run the Project

### Prerequisites

- **Python 3.8+** installed
- **pip** (Python package manager)
- A modern web browser (Chrome, Firefox, Edge)

### Step 1: Install Python Dependencies

```bash
cd backend
pip install -r ../requirements.txt
```

The required packages are:
- `Flask` — Web server framework
- `flask-cors` — Cross-origin resource sharing
- `cryptography` — Fernet encryption for feedback data

### Step 2: Generate Encryption Key (First Time Only)

```bash
cd backend
python generate_key.py
```

This creates `secret.key` in the `backend/` folder. **Do this only once**. If the file already exists, skip this step.

### Step 3: Start the Flask Backend

```bash
cd backend
python app.py
```

The server starts at: **`http://127.0.0.1:10000`**

>  The port can be changed via the `PORT` environment variable.

### Step 4: Open the Frontend

Open `login.html` in your browser:

```
file:///path/to/feedbackanalysissystem/login.html
```

Or use a simple HTTP server:

```bash
# From the project root directory
python -m http.server 8080
```

Then open: **`http://localhost:8080/login.html`**

### Step 5: Usage

1. **Register** a student account via "Student Login" → "Create New Account"
2. **Login** as a student
3. **Fill out** the 10-question survey
4. **Submit** — You'll see the detected sentiment
5. **Switch to Admin**: Go back to login.html → "Admin Login"
6. **View Dashboard** — See charts, word cloud, and analytics

>  **Important**: The frontend `fetch` calls point to `http://127.0.0.1:5000`. If your Flask server runs on a different port (default is `10000`), update the URLs in the HTML/JS files accordingly, or set `PORT=5000` when starting the server:
> ```bash
> set PORT=5000   # Windows
> python app.py
> ```

---

##  Sample Data

The `submissions.json` file comes pre-loaded with **21 sample feedback entries** from students:

| Student | Sentiment | Score |
|---------|-----------|-------|
| Rahul | Positive | +4 |
| Priya | Neutral | 0 |
| Amit | Negative | -1 |
| Sneha | Neutral | 0 |
| Divya | Positive | +1 |
| Vikram | Negative | -1 |
| Neha | Positive | +1 |
| Pooja | Negative | -1 |
| Keerthi | Positive | +1 |
| ... and 12 more | | |

**Distribution**: ~7 Positive, ~3 Negative, ~11 Neutral

---

## 🖥 Screenshots / Pages Overview

| Page | Description |
|------|-------------|
| **Login Portal** (`login.html`) | Dark-themed entry page with "Student Login" and "Admin Login" buttons |
| **Student Login** (`student-login.html`) | Username/password form with link to registration |
| **Registration** (`register.html`) | New account creation form |
| **Survey Form** (`index.html`) | 10-step multi-question survey with progress bar, dark theme, red accents |
| **Admin Dashboard** (`admin.html`) | Light-themed analytics page with stat cards, pie chart, bar chart, word cloud, keyword lists, negative feedback list, and trend chart |

---

##  Notes for Supervisor

1. **No external ML model needed** — The sentiment engine is entirely rule-based using a JSON lexicon, making it lightweight and easy to understand.
2. **Encryption at rest** — All feedback text is encrypted with AES (Fernet) before being saved to `submissions.json`. Decryption happens only when admins view the data.
3. **No database required** — The project uses flat JSON files for simplicity. For production, this can be migrated to SQLite or PostgreSQL.
4. **The `data/` folder** contains the original large datasets (~175 MB each) used for research and model development in the Jupyter notebooks. These are **not required** for running the application.
5. **The Jupyter notebooks** (`Rule-Based-Sentiment Analysis.ipynb` and `tsv_to_csv.ipynb`) document the research process and data preprocessing. They are for reference only and are **not used at runtime**.

---

