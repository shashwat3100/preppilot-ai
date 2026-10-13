# CareerPrep AI – B.Tech Placement Interview & Quiz Recommendation Engine
### Integrated AI Voice Assistant: **PrepPilot**
> **Tagline:** *"Prepare Smarter. Practice Better. Get Interview Ready."*
> **Academic Project:** B.Tech Final-Year Major Project

---

## 🌐 Live Localhost Links

- **Web Application (Frontend):** [http://localhost:5173/](http://localhost:5173/)
- **REST API Backend & RAG Engine:** [http://localhost:5000/](http://localhost:5000/)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 1-Click Demo Accounts

Both accounts feature a **1-Click Demo Fill** button directly on the Login screen:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@careerprep.ai` | `password123` | B.Tech IT, 4th Year, Target: TCS, Infosys, Amazon (Pre-seeded with XP, streak, performance data) |
| **Admin (Dean)** | `admin@careerprep.ai` | `admin123` | Placement Dean Access (Question Bank CRUD, Student management, Campus weakness analytics) |

---

## 🚀 Key Features

### 1. 🎙️ PrepPilot Voice Assistant & RAG Engine
- **Voice Input:** Real-time Speech-to-Text via Web Speech Recognition.
- **RAG Architecture:** Embeddings & Cosine Similarity vector retrieval from verified curriculum documents.
- **Natural Voice Synthesis:** Text-to-Speech vocalization of responses.
- **Domain Guardrails:** Strictly constrained to engineering concepts, technical viva, coding rounds, and company recruitment patterns.

### 2. 🧠 Multi-Factor Recommendation Engine
Calculates dynamic question recommendation scores using a transparent breakdown:
$$\text{Score} = \text{Topic Weakness (35\%)} + \text{Company Match (25\%)} + \text{Branch (15\%)} + \text{Difficulty (10\%)} + \text{Unattempted (10\%)} + \text{Recency (5\%) }$$

### 3. ⚡ Two Quiz Modes
1. **Adaptive Daily Quiz:** Analyzes past attempts, targets weak topics (e.g. Normalization, Deadlocks), mixes company pattern questions, and calibrates difficulty automatically.
2. **Custom Practice Quiz Builder:** Full multi-select filters across Branch, Company, Role, Subjects, Topics, Difficulty, and Question count.

### 4. 🏢 Company-Wise Preparation Tracks
Reconstructed pattern questions and hiring round blueprints for:
- **TCS** (TCS NQT Ninja/Digital/Prime)
- **Infosys** (InfyTQ / HackWithInfy)
- **Wipro** (Elite NTH)
- **Accenture** (Cognitive & Technical Assessment)
- **Capgemini**, **Cognizant**, **Deloitte**, **Amazon**, **Microsoft**, **Google**

### 5. 📊 In-Depth Performance Analytics
- Accuracy broken down by core subject, topic, company, and difficulty level.
- Weekly 7-day progress trend line charts (Recharts).
- Velocity / average speed tracking.

### 6. 🏆 Gamification
- XP accumulation with fast-answer speed bonuses.
- Daily study streak counters with active flame badges.
- Levels from Novice to Placement Ready.
- Unlockable achievement badges.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Canvas-Confetti
- **Backend:** Node.js, Express.js, REST API, JWT Authentication, bcryptjs
- **Database:** PostgreSQL production DDL (`server/src/database/schema.sql`) with dual persistent JSON store (`server/src/database/careerprep_data.json`)
- **AI / Voice:** Web Speech API (STT & TTS), Cosine Vector Similarity RAG Engine

---

## 💻 Running the Project

To start both the client and server concurrently:
```bash
npm run dev
```

Or individually:
```bash
# Server (Port 5000)
npm run dev:server

# Client (Port 5173)
npm run dev:client
```
