# CareerPrep AI: Technical Project Documentation
**Final Year B.Tech Major Project**

## 1. System Architecture
```
                         +-----------------------------------+
                         |         Browser / Client          |
                         |   (React 19 + TypeScript + Vite)  |
                         +-----------------+-----------------+
                                           | HTTP / REST + JWT
                                           v
                         +-----------------+-----------------+
                         |      Express Backend API Server   |
                         |           (Node.js Port 5000)     |
                         +--------+-----------------+--------+
                                  |                 |
                   +--------------+                 +---------------+
                   v                                                v
      +------------+-------------+                    +-------------+------------+
      |  Recommendation Engine   |                    |   PrepPilot Voice RAG    |
      |  - Topic Weakness Score  |                    |   - Web Speech STT / TTS |
      |  - Company Relevance     |                    |   - Cosine Similarity    |
      |  - Branch Alignment      |                    |   - Grounded LLM Context |
      +------------+-------------+                    +-------------+------------+
                   |                                                |
                   +----------------------+-------------------------+
                                          v
                         +----------------+-----------------+
                         |        Database Layer            |
                         |  - PostgreSQL Schema DDL         |
                         |  - 16 Core Relational Entities   |
                         |  - Persistent Atomic Storage     |
                         +----------------------------------+
```

---

## 2. Multi-Dimensional Recommendation Algorithm

The recommendation engine calculates a normalized relevance score ($S \in [0, 100]$) for each candidate question in the question bank:

$$S = \text{Score}_{\text{weakness}} + \text{Score}_{\text{company}} + \text{Score}_{\text{branch}} + \text{Score}_{\text{difficulty}} + \text{Score}_{\text{unattempted}} + \text{Score}_{\text{recency}}$$

1. **Topic Weakness Weight ($0 - 35$ pts):**
   $$W_{\text{topic}} = 1.0 - \left(\frac{\text{Correct Attempts}}{\text{Total Attempts}}\right)$$
   $$\text{Score}_{\text{weakness}} = W_{\text{topic}} \times 35$$
2. **Company Relevance ($0 - 25$ pts):**
   - $25$ pts if question company is in student's target companies list (`target_companies`).
   - $15$ pts if universal core question.
   - $5$ pts if other company.
3. **Branch Alignment ($0 - 15$ pts):**
   - $15$ pts if matching student's engineering branch.
   - $10$ pts for general CS/Engineering core.
4. **Difficulty Match ($0 - 10$ pts):**
   - Calibrated dynamically against student skill tier (Beginner $\rightarrow$ Easy, Intermediate $\rightarrow$ Medium, Advanced $\rightarrow$ Hard).
5. **Unattempted / Revision Priority ($0 - 15$ pts):**
   - $15$ pts for unattempted questions to expand coverage.
   - $12$ pts for previously failed questions ready for spaced retention.
6. **Spaced Repetition ($0 - 5$ pts):**
   - Boosts questions unattempted for $> 72$ hours.

---

## 3. PrepPilot Voice Assistant & RAG Pipeline

```
 [Student Voice Input via Mic]
               |
               v
 [Web Speech API (webkitSpeechRecognition)]
               |
               v (Transcribed Text)
 [Domain Guardrails Validation] ---> (Off-topic? Polite rejection response)
               |
               v (Query Vector Tokenization)
 [Vector Cosine Similarity Matching over KnowledgeDocuments]
               |
               v (Top-K Grounded Contexts with Branch/Company Boost)
 [Structured Technical Briefing Synthesis]
   - Theoretical Concept
   - Architectural Trade-offs
   - Recruiter Pro-Tip
   - Suggested Viva Follow-up
               |
               v
 [Web Speech Synthesis (TTS) & Interactive Audio Waveform]
               |
               v
 [Student Hears Audio Response + Reads UI Bubble with RAG Sources]
```

---

## 4. Database Schema Entities (16 Core Tables)

1. `users`: Student and Admin profiles, credentials, target companies, branch, streak, XP, level.
2. `branches`: 9 Engineering disciplines (CSE, IT, ECE, EE, ME, CE, CHE, AIDS, AIML).
3. `companies`: 10 Tier-1 and IT services recruitment tracks with hiring rounds.
4. `job_roles`: Role definitions and required skills (SDE, Systems Engineer, Embedded, GET, Data Engineer).
5. `subjects`: Data Structures, DBMS, OS, Networks, OOP, Aptitude, Digital Electronics, Thermodynamics, etc.
6. `topics`: Normalization, Transactions, Paging, Deadlocks, TCP Handshake, Trees, etc.
7. `questions`: Questions with type, difficulty, expected time, XP, tags, branch, and company links.
8. `question_options`: Multiple-choice options (A, B, C, D) with keys and correctness indicators.
9. `quiz_sessions`: Adaptive Daily, Custom Practice, or Company Pattern sessions.
10. `quiz_questions`: Join table recording sequence order and student answers per session.
11. `attempts`: Audit trail of every individual question answer, time taken, correctness, and XP gained.
12. `student_performance`: Rolling weakness scores and accuracies per topic for each user.
13. `xp_history`: Transactional ledger of XP gained (speed bonuses, perfect rounds, streaks).
14. `streaks`: Daily study continuity tracking with longest streak records.
15. `achievements` & `user_achievements`: Milestone badges unlocked by students.
16. `knowledge_documents`: Verified curriculum content, summaries, and keywords for PrepPilot RAG.

---

## 5. REST API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new B.Tech student profile |
| `POST` | `/api/auth/login` | Authenticate student or administrator |
| `GET` | `/api/auth/me` | Fetch authenticated session profile |
| `GET` | `/api/dashboard/stats` | Compute readiness score, streak, XP, weak/strong topics |
| `POST` | `/api/quiz/adaptive-daily` | Generate personalized adaptive quiz |
| `POST` | `/api/quiz/custom` | Generate custom quiz with multi-select filters |
| `POST` | `/api/quiz/:id/submit` | Grade quiz, award XP with speed bonuses, recalibrate weak topics |
| `GET` | `/api/quiz/recommendations`| Retrieve scored question recommendations |
| `GET` | `/api/analytics` | Fetch subject, topic, company, and 7-day progress analytics |
| `GET` | `/api/companies` | List companies with hiring rounds & pattern counts |
| `GET` | `/api/companies/:id` | Detailed company track with pattern questions |
| `POST` | `/api/preppilot/chat` | RAG retrieval & technical answer generation |
| `GET` | `/api/preppilot/knowledge`| Inspect approved RAG knowledge documents |
| `GET` | `/api/admin/overview` | Platform-wide analytics for placement dean |
| `POST` | `/api/admin/questions` | Author and commit new question to question bank |
