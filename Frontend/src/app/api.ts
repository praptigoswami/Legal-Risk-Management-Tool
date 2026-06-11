/**
 * ContractCompass — typed API client
 * All calls go to the FastAPI backend at https://vercel.com/prapttii/legal-risk-management-tool-eifu/9QeWNPMtU8yQbY2nz7rY1PrFxow70
 */

const BASE_URL = 'https://legal-risk-management-tool.onrender.com';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface RiskBreakdownItem {
  label: string;
  risk: number;
}

export interface ClauseRewrite {
  title: string;
  risk: 'high' | 'medium' | 'low';
  original: string;
  rewritten: string;
  reason: string;
  impact: string;
}

export interface SimplifiedClause {
  section: string;
  legalText: string;
  simplified: string;
  realWorldExample: string;
}

export interface TimelineEvent {
  title: string;
  description: string;
  timeframe: string;
  severity: 'high' | 'medium' | 'low';
  clause: string;
  action: string;
}

export interface ComplianceCheck {
  regulation: string;
  category: 'GDPR' | 'Privacy' | 'Labor' | 'Consumer';
  status: 'pass' | 'fail' | 'warning';
  requirement: string;
  finding: string;
  recommendation?: string;
  reference?: string;
}

export interface AnalysisResult {
  riskScore: number;
  totalClauses: number;
  riskyClauseCount: number;
  complianceIssues: number;
  estimatedReadTime: number;
  summary: string;
  riskBreakdown: RiskBreakdownItem[];
  topIssues: string[];
  strongPoints: string[];
  aiVerdict: string[];
  clauses: ClauseRewrite[];
  simplifiedClauses: SimplifiedClause[];
  timeline: TimelineEvent[];
  complianceChecks: ComplianceCheck[];
}

// ── Comparison types ──────────────────────────────────────────────────────────

export interface ComparisonMetric {
  label: string;
  a: string | number;
  b: string | number;
  winner: 'A' | 'B' | 'tie';
  unit?: string;
  aNumeric?: number | null;
  bNumeric?: number | null;
}

export interface ComparisonPoint {
  category: string;
  aspect: string;
  contractA: string;
  contractB: string;
  advantage: 'A' | 'B' | 'tie';
  impact: 'high' | 'medium' | 'low';
}

export interface ComparisonResult {
  winner: 'A' | 'B' | 'tie';
  summary: string;
  metrics: ComparisonMetric[];
  points: ComparisonPoint[];
  hiddenTradeoffs: string[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function analyzeContract(file: File): Promise<AnalysisResult> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Analysis failed (${res.status})`);
  }

  return res.json();
}

export async function compareContracts(
  fileA: File,
  fileB: File,
): Promise<ComparisonResult> {
  const form = new FormData();
  form.append('file_a', fileA);
  form.append('file_b', fileB);

  const res = await fetch(`${BASE_URL}/api/compare`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Comparison failed (${res.status})`);
  }

  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
