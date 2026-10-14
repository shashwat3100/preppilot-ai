# PrepPilot AI – Student Placement Preparation & Technical Interview Platform
### Integrated AI Voice & Engineering Coach
> **Tagline:** *"Prepare Smarter. Practice Better. Get Interview Ready."*
> **Academic Project:** B.Tech Major Project

---

## 🌐 Live Localhost Links

- **VS Code Live Server (Go Live):** [http://127.0.0.1:5500/](http://127.0.0.1:5500/)
- **Vite Dev Server (Frontend):** [http://localhost:5173/](http://localhost:5173/)
- **REST API Backend & Coding Engine:** [http://localhost:5000/](http://localhost:5000/)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 1-Click Demo Accounts

Both accounts feature **1-Click Demo Fill** buttons directly on the Login screen:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `Password123` | B.Tech CSE/IT, Target: TCS, Infosys, Amazon (Pre-seeded with XP, streak, performance data) |
| **Admin (Dean)** | `admin@college.edu` | `AdminPass123` | Placement Dean Access (Question Bank CRUD, Student management, Campus weakness analytics) |

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

## 🛠️ Technology Stack & Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Monaco Editor, Recharts, Canvas-Confetti
- **Backend:** Node.js, Express.js, REST API, JWT Authentication, bcryptjs
- **Persistence:** Active persistence is backed by atomic JSON storage (`server/src/database/careerprep_data.json`). Full relational DDL and migration scripts are provided in `server/src/database/schema.sql` for PostgreSQL targets.
- **AI / Voice:** Web Speech API (STT & TTS), Cosine Vector Similarity RAG Engine
- **Code Execution:** Dual-mode runner supporting trusted sandbox gateways (Judge0) with local development fallback.

---

## 🔐 Environment Configuration

Create a `.env` file in the `server` directory (or configure platform environment variables) with the following parameters:

| Variable | Required | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | Server listening port | `5000` |
| `NODE_ENV` | Optional | Application runtime environment (`development` or `production`) | `development` |
| `JWT_SECRET` | **Production** | Secret key used for signing and verifying JWT tokens | Auto-generated dev fallback |
| `ADMIN_INVITE_TOKEN` | Optional | Master bootstrap invitation secret for faculty/Dean onboarding | Auto-generated dev fallback |
| `JUDGE0_API_URL` | **Production** | Endpoint URL for isolated code execution sandbox cluster | None (Local dev runner) |
| `JUDGE0_API_KEY` | Optional | RapidAPI / Judge0 cluster authorization key | None |
| `SMTP_HOST` | Optional | Outbound SMTP server hostname for transactional password reset emails | None (Logs to console in dev) |
| `SMTP_PORT` | Optional | SMTP port (e.g. 587 or 465) | `587` |
| `SMTP_USER` | Optional | Outgoing mailbox username | None |
| `SMTP_PASS` | Optional | Outgoing mailbox password or application token | None |

---

## 🛡️ Security & Sandbox Policy

### 1. Code Execution Policy
- **Development Mode:** Runs via `LOCAL_DEVELOPMENT_RUNNER (NO_OS_ISOLATION)` with bounded resource guards: 10s compile timeout, 5s execution timeout, 512 KB output truncation, bounded concurrency queue (max 10 jobs), and automated temporary workspace cleanup.
- **Production Mode:** Server strictly blocks all local host process execution (`SANDBOX_CONFIG_REQUIRED`). A verified containerized sandbox cluster (`JUDGE0_API_URL`) must be supplied to execute user code in production.

### 2. Privilege Escalation Prevention
- Public registration (`POST /api/auth/register`) enforces `role: 'STUDENT'` unconditionally.
- Dean/Admin registration (`POST /api/auth/register-dean`) requires a cryptographically valid, single-use invitation token issued by an active administrator or matching `ADMIN_INVITE_TOKEN`.
- Legacy static passcodes (`DEAN2026`) and hints have been completely removed.

### 3. Password Reset Flow
- PINs are generated via secure cryptographically strong random numbers and stored as salted bcrypt hashes with a 15-minute expiration.
- Reset codes are never exposed in API responses.
- Brute-force protection invalidates sessions after 5 failed attempts (HTTP 429).

---

## 💻 Running the Project

### Option A: VS Code "Go Live" (Live Server)
The workspace is pre-configured with `.vscode/settings.json` and a root launcher so clicking **"Go Live"** in VS Code / Antigravity works immediately out-of-the-box:
1. Ensure the backend server is active:
   ```bash
   npm run dev:server
   ```
2. Click **"Go Live"** in the VS Code status bar (or open `http://127.0.0.1:5500/`).
3. The application opens instantly with automatic routing to the compiled client bundle and direct connectivity to the Express backend (`http://localhost:5000/api`) with full CORS clearance.

---

### Option B: Vite Development Server
To start both client and server concurrently with hot module replacement (HMR):
```bash
npm run dev
```

Or individually:
```bash
# Backend Server (Port 5000)
npm run dev:server

# Frontend Client (Port 5173)
npm run dev:client
```

---

### Running Automated Test Suite
Run the security and reliability verification suite:
```bash
npm test
# or
npm --prefix server test
```
