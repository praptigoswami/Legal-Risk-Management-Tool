# ContractCompass — Backend API

A FastAPI backend that uses Google Gemini AI to analyze legal contracts in real-time.

## Setup

### 1. Install Python dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Configure your Gemini API key

```bash
# Copy the example env file
copy .env.example .env

# Edit .env and paste your Gemini API key
# Get a free key at: https://aistudio.google.com/
```

Your `.env` file should look like:
```
GROQ_API_KEY=AIza...your_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### 3. Start the backend

```bash
# From the Backend directory:
uvicorn main:app --reload --port 8000

# Or from the project root:
python -m uvicorn Backend.main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`

Interactive API docs: `http://localhost:8000/docs`

---

## API Endpoints

### `GET /api/health`
Health check — returns `{ "status": "ok" }`.

### `POST /api/analyze`
Analyze a single contract file.

**Request:** `multipart/form-data` with field `file` (PDF, DOCX, or TXT).

**Response:** Full analysis JSON including risk score, clause rewrites, compliance checks, timeline, and simplified explanations.

### `POST /api/compare`
Compare two contract files side by side.

**Request:** `multipart/form-data` with fields `file_a` and `file_b`.

**Response:** Comparison JSON including metrics, detailed point-by-point comparison, winner determination, and hidden tradeoffs.

---

## Running Both Servers

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd "Legal Risk Management Tool\Backend"
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd "Legal Risk Management Tool"
npm run dev
```

Then open `http://localhost:5173` in your browser.
