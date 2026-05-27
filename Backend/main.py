"""
ContractCompass — FastAPI Backend
Analyzes legal contracts using Google Gemini AI.
"""

import io
import json
import os
import re
import tempfile
from pathlib import Path
from typing import Any, Dict, Optional, List, Literal

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ── Load environment ──────────────────────────────────────────────────────────
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not set. "
        "Copy Backend/.env.example to Backend/.env and add your key."
    )

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(GEMINI_MODEL)

# ── Pydantic Schemas for Structured Output ────────────────────────────────────

class RiskBreakdownItem(BaseModel):
    label: str = Field(description="Name of the risk area, e.g., 'Termination Rights', 'Liability Exposure'")
    risk: int = Field(description="Risk score for this specific area, 0-100")


class ClauseAnalysis(BaseModel):
    title: str = Field(description="Name or title of the clause")
    risk: Literal["high", "medium", "low"] = Field(description="Risk classification")
    original: str = Field(description="A concise or paraphrased excerpt of the problematic original clause text from the contract")
    rewritten: str = Field(description="A professionally rewritten, legal-grade replacement clause protecting the user")
    reason: str = Field(description="Brief explanation of why this original clause is risky")
    impact: str = Field(description="How the rewritten clause protects the user or reduces risk")


class SimplifiedClause(BaseModel):
    section: str = Field(description="Legal section name or heading from the contract")
    legalText: str = Field(description="Concise excerpt of the legal language from the contract")
    simplified: str = Field(description="Plain English, one-sentence explanation of what this means in simple terms")
    realWorldExample: str = Field(description="A short, concrete real-world scenario showing the practical effect of this clause")


class TimelineItem(BaseModel):
    title: str = Field(description="Milestone or risk event title")
    description: str = Field(description="What happens at this point or what the clause dictates")
    timeframe: str = Field(description="Concise timeframe description, e.g., 'Day 1', 'Month 3', 'Upon Termination'")
    severity: Literal["high", "medium", "low"] = Field(description="Severity of this event/milestone")
    clause: str = Field(description="Concise description or quote of the clause triggering this milestone")
    action: str = Field(description="Recommended action for the user")


class ComplianceCheck(BaseModel):
    regulation: str = Field(description="Regulation name, e.g., GDPR Article 28, HIPAA, or labor standards")
    category: Literal["GDPR", "Privacy", "Labor", "Consumer"] = Field(description="Category of the check")
    status: Literal["pass", "fail", "warning"] = Field(description="Compliance status")
    requirement: str = Field(description="What the regulation requires")
    finding: str = Field(description="What the contract currently says, doesn't say, or is missing in relation to this requirement")
    recommendation: Optional[str] = Field(None, description="What to fix, add, or negotiate (can be empty if status is pass)")
    reference: Optional[str] = Field(None, description="URL or reference to the regulation if known")


class ContractAnalysisResult(BaseModel):
    riskScore: int = Field(description="Overall contract risk score, 0-100, where higher is riskier")
    totalClauses: int = Field(description="Estimated number of distinct clauses in the contract")
    riskyClauseCount: int = Field(description="Number of clauses classified as risky or unfavorable")
    complianceIssues: int = Field(description="Number of non-compliant items or warnings found")
    estimatedReadTime: int = Field(description="Estimated minutes to read and fully review the contract")
    summary: str = Field(description="A concise 2-3 sentence executive summary of the contract's primary legal risks and overall posture")
    riskBreakdown: List[RiskBreakdownItem] = Field(description="Breakdown of risks across predefined dimensions")
    topIssues: List[str] = Field(description="Top 3 key issues or major risks found in the contract")
    strongPoints: List[str] = Field(description="Top 3 positive clauses, favorable terms, or strong protections for the user")
    aiVerdict: List[str] = Field(description="AI Verdict: first element is a headline recommendation (e.g. 'Negotiate Before Signing'), followed by 2 specific recommendations")
    clauses: List[ClauseAnalysis] = Field(description="Detailed analysis of 2 to 4 of the riskiest clauses")
    simplifiedClauses: List[SimplifiedClause] = Field(description="Simplified explanation of 2 to 4 key legal concepts in the contract")
    timeline: List[TimelineItem] = Field(description="Chronological timeline of 3 to 5 key milestones or risk events")
    complianceChecks: List[ComplianceCheck] = Field(description="Compliance assessment of 3 to 5 key regulations")


class MetricComparison(BaseModel):
    label: str = Field(description="Name of the compared metric, e.g., liability cap, notice period, payment terms")
    a: str = Field(description="Value for Contract A")
    b: str = Field(description="Value for Contract B")
    winner: Literal["A", "B", "tie"] = Field(description="Which contract has the more favorable value")
    unit: Optional[str] = Field(None, description="Optional unit, e.g. '%', 'days', '$'")
    aNumeric: Optional[float] = Field(None, description="Numeric value for A if applicable, else null")
    bNumeric: Optional[float] = Field(None, description="Numeric value for B if applicable, else null")


class PointComparison(BaseModel):
    category: str = Field(description="Comparison category, e.g., 'Termination', 'Liability'")
    aspect: str = Field(description="Specific aspect compared")
    contractA: str = Field(description="What Contract A specifies")
    contractB: str = Field(description="What Contract B specifies")
    advantage: Literal["A", "B", "tie"] = Field(description="Which contract has the advantage")
    impact: Literal["high", "medium", "low"] = Field(description="Impact of this difference")


class ContractComparisonResult(BaseModel):
    winner: Literal["A", "B", "tie"] = Field(description="Overall winner of the comparison")
    summary: str = Field(description="Concise 2-3 sentence summary explaining why one contract is better or if it is a tie")
    metrics: List[MetricComparison] = Field(description="Measurable metrics side-by-side comparison (5-8 items)")
    points: List[PointComparison] = Field(description="Key qualitative comparison points (5-8 items)")
    hiddenTradeoffs: List[str] = Field(description="3-5 non-obvious tradeoffs or observations")

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="ContractCompass API",
    description="AI-powered legal contract analysis using Google Gemini",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Text extraction ───────────────────────────────────────────────────────────

def extract_text_from_pdf(content: bytes) -> str:
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        return "\n\n".join(
            page.extract_text() or "" for page in reader.pages
        ).strip()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {e}")


def extract_text_from_docx(content: bytes) -> str:
    try:
        import docx
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        doc = docx.Document(tmp_path)
        os.unlink(tmp_path)
        return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse DOCX: {e}")


def extract_text(file: UploadFile, content: bytes) -> str:
    name = (file.filename or "").lower()
    if name.endswith(".pdf"):
        return extract_text_from_pdf(content)
    if name.endswith(".docx") or name.endswith(".doc"):
        return extract_text_from_docx(content)
    # Plain text / .txt
    try:
        return content.decode("utf-8", errors="replace").strip()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read file: {e}")


# ── Gemini helpers ────────────────────────────────────────────────────────────

def _strip_json_fence(raw: str) -> str:
    """Remove markdown code fences from Gemini's response."""
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def call_gemini(prompt: str, schema: Optional[Any] = None) -> Dict[str, Any]:
    """Call Gemini and parse the JSON response, optionally forcing a Pydantic schema."""
    try:
        generation_config = genai.GenerationConfig(
            temperature=0.2,
            max_output_tokens=8192,
            response_mime_type="application/json",
        )
        if schema is not None:
            generation_config.response_schema = schema

        response = model.generate_content(
            prompt,
            generation_config=generation_config,
        )
        raw = response.text
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = _strip_json_fence(cleaned)
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"JSONDecodeError: {e}\nRaw response:\n{raw}")
        raise HTTPException(
            status_code=502,
            detail=f"Gemini returned invalid JSON: {e}. Please try again."
        )
    except Exception as e:
        print(f"Gemini API Exception: {e}")
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")


# ── Prompts ───────────────────────────────────────────────────────────────────

ANALYZE_PROMPT = """
You are an expert legal AI assistant. Analyze the following contract and return a valid JSON object matching the requested schema.

CONTRACT TEXT:
---
{contract_text}
---

Your response MUST match the schema.
Important rules:
- Keep all original and rewritten text snippets, legal text extracts, and clause references concise (under 2-3 sentences max).
- The "clauses" array must have 2 to 4 items covering the most critical risky clauses.
- The "simplifiedClauses" array must have 2 to 4 items covering key legal concepts.
- The "timeline" array must have 3 to 5 key milestones or risk events.
- The "complianceChecks" array must have 3 to 5 essential regulatory items (GDPR, Privacy, Labor, Consumer).
- Base ALL analysis strictly on the actual contract text provided. Do not invent details.
"""

COMPARE_PROMPT = """
You are an expert legal AI assistant. Compare these two contracts and return a valid JSON object matching the requested schema.

CONTRACT A — "{name_a}":
---
{text_a}
---

CONTRACT B — "{name_b}":
---
{text_b}
---

Your response MUST match the schema.
Important rules:
- Keep all compared descriptions and aspect statements concise.
- "metrics" should compare 5 to 7 key measurable terms.
- "points" should compare 5 to 7 qualitative aspects (termination, liability, data, pricing, compliance, SLA, etc.).
- "hiddenTradeoffs" should contain 3 to 5 non-obvious tradeoffs or observations.
- Base ALL analysis on the actual contract texts provided. Do not invent details.
"""


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "model": GEMINI_MODEL}


@app.post("/api/analyze")
async def analyze_contract(file: UploadFile = File(...)):
    """
    Analyze a single contract file (PDF, DOCX, or TXT).
    Returns full structured analysis.
    """
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    contract_text = extract_text(file, content)

    if len(contract_text) < 50:
        raise HTTPException(
            status_code=422,
            detail="Contract text is too short to analyze. Please upload a real contract document."
        )

    # Truncate very long contracts to avoid token limits (Gemini 1.5 flash = 1M tokens)
    # ~4 chars per token, so 800k chars ≈ 200k tokens — well within limit
    contract_text = contract_text[:800_000]

    prompt = ANALYZE_PROMPT.format(contract_text=contract_text)
    result = call_gemini(prompt, schema=ContractAnalysisResult)

    # Ensure numeric types are correct
    result.setdefault("riskScore", 50)
    result.setdefault("totalClauses", 0)
    result.setdefault("riskyClauseCount", 0)
    result.setdefault("complianceIssues", 0)
    result.setdefault("estimatedReadTime", 5)
    result.setdefault("summary", "")
    result.setdefault("riskBreakdown", [])
    result.setdefault("topIssues", [])
    result.setdefault("strongPoints", [])
    result.setdefault("aiVerdict", [])
    result.setdefault("clauses", [])
    result.setdefault("simplifiedClauses", [])
    result.setdefault("timeline", [])
    result.setdefault("complianceChecks", [])

    return result


@app.post("/api/compare")
async def compare_contracts(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
):
    """
    Compare two contract files side by side.
    Returns structured comparison with winner determination.
    """
    content_a = await file_a.read()
    content_b = await file_b.read()

    if not content_a or not content_b:
        raise HTTPException(status_code=400, detail="Both contract files must be non-empty.")

    text_a = extract_text(file_a, content_a)
    text_b = extract_text(file_b, content_b)

    # Truncate each to ~400k chars so both fit in context
    text_a = text_a[:400_000]
    text_b = text_b[:400_000]

    prompt = COMPARE_PROMPT.format(
        name_a=file_a.filename or "Contract A",
        text_a=text_a,
        name_b=file_b.filename or "Contract B",
        text_b=text_b,
    )
    result = call_gemini(prompt, schema=ContractComparisonResult)

    result.setdefault("winner", "tie")
    result.setdefault("summary", "")
    result.setdefault("metrics", [])
    result.setdefault("points", [])
    result.setdefault("hiddenTradeoffs", [])

    return result
