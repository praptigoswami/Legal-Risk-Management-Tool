import { ArrowLeft, Scale, TrendingUp, TrendingDown, CheckCircle2, XCircle, AlertTriangle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ComparisonResult } from '../api';

interface ContractComparisonProps {
  contracts: File[];
  onReset: () => void;
  comparisonResult: ComparisonResult | null;
}

const IMPACT = {
  high:   { text: 'text-red-300',    bg: 'bg-red-500/15',    border: 'border-red-500/25' },
  medium: { text: 'text-amber-300',  bg: 'bg-amber-500/15',  border: 'border-amber-500/25' },
  low:    { text: 'text-emerald-300',bg: 'bg-emerald-500/15',border: 'border-emerald-500/25' },
};

export function ContractComparison({ contracts, onReset, comparisonResult }: ContractComparisonProps) {
  const contractA = contracts[0];
  const contractB = contracts[1] || contracts[0];
  const metricsRef = useRef<HTMLDivElement>(null);

  const metrics     = comparisonResult?.metrics         ?? [];
  const points      = comparisonResult?.points          ?? [];
  const tradeoffs   = comparisonResult?.hiddenTradeoffs ?? [];
  const winner      = comparisonResult?.winner          ?? 'tie';
  const summary     = comparisonResult?.summary         ?? '';

  const aWins = metrics.filter(m => m.winner === 'A').length;
  const bWins = metrics.filter(m => m.winner === 'B').length;

  useEffect(() => {
    if (metricsRef.current) {
      gsap.fromTo(
        metricsRef.current.children,
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-white/50 hover:text-white transition-colors text-sm"
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.96 }}
        >
          <ArrowLeft className="size-4" />
          Back to Upload
        </motion.button>
        <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2">
          <Scale className="size-4 text-violet-400" />
          <span className="font-bold text-white text-sm">Contract Comparison</span>
        </div>
      </div>

      {/* Recommendation banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 border border-violet-500/25"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.08) 100%)' }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="size-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <Trophy className="size-5 text-violet-300" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">AI Recommendation</h3>
            <p className="text-sm text-white/55 leading-relaxed">
              {summary || (
                winner === 'tie'
                  ? 'Both contracts are roughly equal in terms of risk and protection.'
                  : <>Based on our analysis, <strong className="text-violet-300">Contract {winner}</strong> is significantly
                    safer and more favorable — offering better protection, lower risk, and more reasonable terms.</>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
            <span className="text-xs text-white/45">Contract B: <strong className="text-white">{bWins} advantages</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-red-400" style={{ boxShadow: '0 0 6px rgba(239,68,68,0.8)' }} />
            <span className="text-xs text-white/45">Contract A: <strong className="text-white">{aWins} advantages</strong></span>
          </div>
        </div>
      </motion.div>

      {/* Contract headers */}
      <div className="grid grid-cols-2 gap-4">
        {([['A', contractA?.name || 'Contract A'] as const, ['B', contractB?.name || 'Contract B'] as const]).map(([id, name]) => {
          const isWinner = winner === id;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: id === 'A' ? 0.1 : 0.2 }}
              className={`glass-card rounded-2xl p-5 border-2 ${
                isWinner ? 'border-emerald-500/50 bg-emerald-500/8' : 'border-red-500/30 bg-red-500/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`size-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    isWinner ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {id}
                  </div>
                  <span className="font-bold text-white">Contract {id}</span>
                </div>
                {isWinner
                  ? <TrendingUp className="size-5 text-emerald-400" />
                  : <TrendingDown className="size-5 text-red-400" />}
              </div>
              <p className="text-xs text-white/35 truncate">{name}</p>
              {isWinner && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="size-3" />
                  Recommended
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Key Metrics */}
      {metrics.length > 0 && (
        <div>
          <h4 className="font-bold text-white mb-4 flex items-center gap-2">
            <Scale className="size-4 text-violet-400" /> Key Metrics
          </h4>
          <div ref={metricsRef} className="space-y-2.5">
            {metrics.map((m, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                {(['A', 'B'] as const).map((id) => {
                  const isWin = m.winner === id;
                  return (
                    <div
                      key={id}
                      className={`glass-card rounded-xl p-3.5 border flex items-center justify-between ${
                        isWin ? 'border-emerald-500/25 bg-emerald-500/8' : 'border-white/6'
                      }`}
                    >
                      <div>
                        <div className="text-xs text-white/35 mb-0.5">{m.label}</div>
                        <div className="font-bold text-white text-sm">
                          {id === 'A' ? m.a : m.b}{m.unit}
                        </div>
                      </div>
                      {isWin
                        ? <CheckCircle2 className="size-4 text-emerald-400 flex-shrink-0" />
                        : <XCircle className="size-4 text-red-400/50 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed comparison */}
      {points.length > 0 && (
        <div>
          <h4 className="font-bold text-white mb-4">Detailed Comparison</h4>
          <div className="space-y-3">
            {points.map((p, i) => {
              const impKey = (p.impact === 'high' || p.impact === 'medium' || p.impact === 'low')
                ? p.impact : 'medium';
              const imp = IMPACT[impKey];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-2xl p-5 border border-white/6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-bold text-white text-sm">{p.category}</h5>
                      <span className="text-xs text-white/35">{p.aspect}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${imp.bg} ${imp.text} border ${imp.border}`}>
                      {p.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {(['A', 'B'] as const).map((id) => {
                      const isWin = p.advantage === id;
                      return (
                        <div key={id} className={`rounded-xl p-3 border ${isWin ? 'bg-emerald-500/8 border-emerald-500/25' : 'bg-white/3 border-white/8'}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-white/30">CONTRACT {id}</span>
                            {isWin
                              ? <CheckCircle2 className="size-3.5 text-emerald-400" />
                              : <XCircle className="size-3.5 text-red-400/50" />}
                          </div>
                          <p className="text-xs text-white/55 leading-relaxed">{id === 'A' ? p.contractA : p.contractB}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hidden tradeoffs */}
      {tradeoffs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-2xl p-5 border border-amber-500/20"
        >
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="size-4 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Hidden Tradeoffs</h4>
              <ul className="space-y-2">
                {tradeoffs.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                    <div className="size-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
