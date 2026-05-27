# ContractCompass — Legal Risk Management Tool

AI-powered contract analyzer using React + FastAPI + Google Gemini.

---

## First-Time Setup

### Frontend
```bash
cd Frontend
npm install
```

### Backend
```bash
cd Backend
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# OR: venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

---

## Running the App

Open **two terminal tabs** in VS Code (`Ctrl+`` then the + button).

**Terminal 1 — Frontend**
```bash
cd Frontend
npm run dev
# → http://localhost:5173
```

**Terminal 2 — Backend**
```bash
cd Backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
# → http://localhost:8000/api/health
```

Then open **http://localhost:5173** in your browser.

---

## Environment

The `Backend/.env` file is already configured with your Gemini API key.
Never commit `.env` to git — it is listed in `Backend/.gitignore`.

---

## Supported File Types

Upload contracts as **PDF**, **DOCX**, or **TXT**.
