import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  ArrowLeft, FileText, AlertCircle, CheckCircle2, Clock,
  TrendingUp, Shield, BarChart3, Sparkles, Download,
} from 'lucide-react';
import { ClauseRewriteSection } from './ClauseRewriteSection';
import { SimplifiedExplanation } from './SimplifiedExplanation';
import { RedFlagTimeline } from './RedFlagTimeline';
import { ComplianceChecker } from './ComplianceChecker';
import { AnalysisResult } from '../api';

interface Props {
  contract: File;
  onReset: () => void;
  analysisResult: AnalysisResult | null;
}

const TABS = [
  { id: 'overview',    label: 'Overview',       icon: TrendingUp,   color: '#8b5cf6' },
  { id: 'rewrites',   label: 'Clause Rewrites', icon: FileText,     color: '#3b82f6' },
  { id: 'simplified', label: 'Simplified',      icon: CheckCircle2, color: '#34d399' },
  { id: 'timeline',   label: 'Timeline',        icon: Clock,        color: '#f59e0b' },
  { id: 'compliance', label: 'Compliance',      icon: AlertCircle,  color: '#ef4444' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ── Animated number counter ── */
function AnimatedNumber({ target, suffix = '', duration = 1200 }: { target: number; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <span className="count-pop">{display}{suffix}</span>;
}

/* ── SVG Risk Gauge ── */
function RiskGauge({ score }: { score: number }) {
  const radius = 60;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#34d399';
  const label = score >= 70 ? 'High Risk' : score >= 40 ? 'Medium Risk' : 'Low Risk';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 160, height: 90 }}>
        <svg width="160" height="90" viewBox="0 0 160 90">
          <path
            d={`M 10 80 A ${radius} ${radius} 0 0 1 150 80`}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <motion.path
            d={`M 10 80 A ${radius} ${radius} 0 0 1 150 80`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <div className="text-3xl font-black text-white">
            <AnimatedNumber target={score} suffix="%" />
          </div>
        </div>
      </div>
      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color, background: `${color}22`, border: `1px solid ${color}44` }}>
        {label}
      </span>
    </div>
  );
}

/* ── Mini bar chart ── */
function MiniBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-16">
      {data.map((d, i) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md overflow-hidden" style={{ height: 48 }}>
            <motion.div
              className="w-full rounded-t-md bar-grow"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: d.color,
                animationDelay: `${i * 0.12}s`,
                boxShadow: `0 0 8px ${d.color}66`,
              }}
            />
          </div>
          <span className="text-[9px] text-white/30 font-bold text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const BAR_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#34d399'];

export function AnalysisDashboard({ contract, onReset, analysisResult }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current.children,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
      );
    }
    if (statsRef.current) {
      gsap.fromTo(statsRef.current.children,
        { opacity: 0, y: 35, scale: 0.93 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.4)', delay: 0.2 }
      );
    }
  }, []);

  // Derive display data from real result or use safe defaults
  const riskScore        = analysisResult?.riskScore         ?? 50;
  const totalClauses     = analysisResult?.totalClauses       ?? 0;
  const riskyClauseCount = analysisResult?.riskyClauseCount   ?? 0;
  const complianceIssues = analysisResult?.complianceIssues   ?? 0;
  const estimatedReadTime = analysisResult?.estimatedReadTime ?? 5;

  const riskBreakdown = (analysisResult?.riskBreakdown ?? [
    { label: 'Termination Rights', risk: 50 },
    { label: 'Liability Exposure', risk: 50 },
    { label: 'Data Privacy',       risk: 50 },
    { label: 'Compliance Gaps',    risk: 50 },
    { label: 'Payment Terms',      risk: 50 },
  ]).slice(0, 5);

  const statCards = [
    {
      label: 'Risky Clauses',
      value: riskyClauseCount,
      suffix: '',
      sub: `of ${totalClauses} total clauses`,
      icon: AlertCircle,
      gradient: 'from-amber-500 to-orange-500',
      glow: 'rgba(245,158,11,0.35)',
      barColor: '#f59e0b',
      barPct: totalClauses > 0 ? (riskyClauseCount / totalClauses) * 100 : 0,
    },
    {
      label: 'Compliance Issues',
      value: complianceIssues,
      suffix: '',
      sub: 'Requires attention',
      icon: Shield,
      gradient: 'from-red-500 to-rose-500',
      glow: 'rgba(239,68,68,0.35)',
      barColor: '#ef4444',
      barPct: Math.min(complianceIssues * 12, 100),
    },
    {
      label: 'Read Time',
      value: estimatedReadTime,
      suffix: 'min',
      sub: 'Estimated review time',
      icon: Clock,
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'rgba(59,130,246,0.35)',
      barColor: '#3b82f6',
      barPct: Math.min(estimatedReadTime * 5, 100),
    },
  ];

  const miniBarData = riskBreakdown.map((item, i) => ({
    label: item.label.split(' ')[0].slice(0, 4),
    value: item.risk,
    color: BAR_COLORS[i % BAR_COLORS.length],
  }));

  return (
    <div className="space-y-7">
      {/* ── Header ── */}
      <div ref={headerRef} className="flex items-center justify-between flex-wrap gap-3">
        <motion.button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-white/45 hover:text-white hover:border-white/15 transition-all text-sm font-medium"
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="size-4" />
          New Analysis
        </motion.button>

        {/* File badge */}
        <div className="flex items-center gap-3 glass-card rounded-2xl px-4 py-2.5">
          <motion.div
            className="size-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center"
            animate={{ boxShadow: ['0 0 0 0 rgba(139,92,246,0.4)', '0 0 0 6px rgba(139,92,246,0)', '0 0 0 0 rgba(139,92,246,0)'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <FileText className="size-4 text-violet-400" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-white leading-none truncate max-w-[200px]">{contract.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <motion.div
                className="size-1.5 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }}
              />
              <p className="text-xs text-emerald-400 font-medium">Analysis complete</p>
            </div>
          </div>
        </div>

        {/* Download btn */}
        <motion.button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-white/45 hover:text-white text-sm font-medium border border-white/6 hover:border-violet-500/30 transition-all"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            if (!analysisResult) return;
            const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${contract.name.replace(/\.[^.]+$/, '')}_analysis.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="size-4" />
          Export Report
        </motion.button>
      </div>

      {/* ── Risk gauge + stat cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Gauge card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'back.out(1.4)' }}
          className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-4 border border-red-500/15 relative overflow-hidden"
        >
          <div className="absolute top-3 right-3">
            <Sparkles className="size-4 text-white/20" />
          </div>
          <div className="text-xs text-white/35 font-bold uppercase tracking-widest">Risk Score</div>
          <RiskGauge score={riskScore} />
          <div className="w-full pt-2 border-t border-white/6">
            <MiniBarChart data={miniBarData} />
          </div>
        </motion.div>

        {/* Stat cards */}
        <div ref={statsRef} className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <motion.div
              key={card.label}
              className="glass-card glass-card-hover rounded-2xl p-5 space-y-3 cursor-default"
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/35 uppercase tracking-widest font-bold">{card.label}</span>
                <div
                  className={`size-8 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
                  style={{ boxShadow: `0 0 16px ${card.glow}` }}
                >
                  <card.icon className="size-4 text-white" />
                </div>
              </div>
              <div>
                <div className="text-4xl font-black text-white">
                  <AnimatedNumber target={card.value} suffix={card.suffix} duration={900} />
                </div>
                <div className="text-xs text-white/35 mt-0.5">{card.sub}</div>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${card.barColor}, ${card.barColor}88)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${card.barPct}%` }}
                    transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="text-right text-[10px] text-white/25">{Math.round(card.barPct)}%</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap flex-1 justify-center"
              style={{ color: active ? '#fff' : 'rgba(255,255,255,0.35)' }}
              whileHover={{ color: 'rgba(255,255,255,0.75)' }}
              whileTap={{ scale: 0.96 }}
            >
              {active && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${tab.color}55, ${tab.color}33)`,
                    border: `1px solid ${tab.color}44`,
                    boxShadow: `0 0 20px ${tab.color}33`,
                  }}
                  transition={{ type: 'spring', bounce: 0.22, duration: 0.5 }}
                />
              )}
              <tab.icon className="size-4 relative z-10" style={{ color: active ? tab.color : undefined }} />
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className="min-h-[420px]"
        >
          {activeTab === 'overview'    && <OverviewTab analysisResult={analysisResult} />}
          {activeTab === 'rewrites'    && <ClauseRewriteSection clauses={analysisResult?.clauses ?? []} />}
          {activeTab === 'simplified'  && <SimplifiedExplanation clauses={analysisResult?.simplifiedClauses ?? []} />}
          {activeTab === 'timeline'    && <RedFlagTimeline events={analysisResult?.timeline ?? []} />}
          {activeTab === 'compliance'  && <ComplianceChecker checks={analysisResult?.complianceChecks ?? []} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Overview Tab ── */
function OverviewTab({ analysisResult }: { analysisResult: AnalysisResult | null }) {
  const riskBreakdown = analysisResult?.riskBreakdown ?? [];
  const topIssues     = analysisResult?.topIssues     ?? [];
  const strongPoints  = analysisResult?.strongPoints  ?? [];
  const aiVerdict     = analysisResult?.aiVerdict     ?? [];
  const summary       = analysisResult?.summary       ?? '';
  const riskyClauseCount = analysisResult?.riskyClauseCount ?? 0;
  const complianceIssues = analysisResult?.complianceIssues ?? 0;

  const RISK_COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#34d399'];

  const verdictEmojis = ['⚠️', '✍️', '🔒', '📋', '🛡️'];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Summary */}
        <div className="md:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-violet-400" />
            <h3 className="font-bold text-white">Contract Summary</h3>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            {summary || (
              <>
                This contract contains{' '}
                <strong className="text-amber-400">{riskyClauseCount} potentially risky clauses</strong>{' '}
                that may put you at a disadvantage. We've identified{' '}
                <strong className="text-red-400">{complianceIssues} compliance issues</strong>{' '}
                related to regulatory requirements.
              </>
            )}
          </p>
          <p className="text-white/50 text-sm leading-relaxed">
            Review the <strong className="text-white">Clause Rewrites</strong> tab for actionable improvements,
            and the <strong className="text-white">Compliance</strong> tab for regulatory concerns.
          </p>
          {/* Risk breakdown bars */}
          <div className="space-y-3 pt-2">
            {riskBreakdown.map((item, i) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/45">{item.label}</span>
                  <span className="font-bold" style={{ color: RISK_COLORS[i % RISK_COLORS.length] }}>{item.risk}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${RISK_COLORS[i % RISK_COLORS.length]}, ${RISK_COLORS[i % RISK_COLORS.length]}66)`,
                      boxShadow: `0 0 6px ${RISK_COLORS[i % RISK_COLORS.length]}66`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.risk}%` }}
                    transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI verdict */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-5 flex flex-col gap-4 border border-violet-500/20"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.05) 100%)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-400" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-wider">AI Verdict</span>
          </div>
          <div className="space-y-3 flex-1">
            {aiVerdict.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-base">{verdictEmojis[i % verdictEmojis.length]}</span>
                <span className={i === 0 ? 'text-amber-400' : 'text-white/60'}>{v}</span>
              </motion.div>
            ))}
          </div>
          <div className="pt-3 border-t border-white/6">
            <div className="text-xs text-white/25 leading-relaxed">
              AI analysis powered by Gemini. Not legal advice.
            </div>
          </div>
        </motion.div>
      </div>

      {/* Issues / Strong points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-5 border border-amber-500/18"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-xl bg-amber-500/18 border border-amber-500/25 flex items-center justify-center">
              <AlertCircle className="size-4 text-amber-400" />
            </div>
            <h4 className="font-bold text-white">Top Priority Issues</h4>
          </div>
          <ul className="space-y-3">
            {topIssues.map((issue, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-2.5 text-sm text-white/50"
              >
                <div className="size-4 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="size-1.5 rounded-full bg-amber-400" />
                </div>
                {issue}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5 border border-emerald-500/18"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-xl bg-emerald-500/18 border border-emerald-500/25 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-emerald-400" />
            </div>
            <h4 className="font-bold text-white">Strong Points</h4>
          </div>
          <ul className="space-y-3">
            {strongPoints.map((point, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-2.5 text-sm text-white/50"
              >
                <div className="size-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="size-1.5 rounded-full bg-emerald-400" />
                </div>
                {point}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
