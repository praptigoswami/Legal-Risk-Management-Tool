import { AlertTriangle, CheckCircle2, Copy, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClauseRewrite } from '../api';

interface Props {
  clauses: ClauseRewrite[];
}

const RISK_CONFIG = {
  high:   { label: 'HIGH RISK',   text: 'text-red-300',    bg: 'bg-red-500/15',    border: 'border-red-500/25',    dot: 'bg-red-400' },
  medium: { label: 'MEDIUM RISK', text: 'text-amber-300',  bg: 'bg-amber-500/15',  border: 'border-amber-500/25',  dot: 'bg-amber-400' },
  low:    { label: 'LOW RISK',    text: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', dot: 'bg-emerald-400' },
};

export function ClauseRewriteSection({ clauses }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (clauses.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <p className="text-white/40 text-sm">No clause rewrites available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white">Clause Rewrites</h3>
          <p className="text-sm text-white/40 mt-0.5">AI-suggested improvements to protect your interests</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-300 text-xs font-bold">
          {clauses.length} Issues Found
        </div>
      </div>

      <div className="space-y-3">
        {clauses.map((clause, index) => {
          const risk = (clause.risk === 'high' || clause.risk === 'medium' || clause.risk === 'low')
            ? clause.risk : 'medium';
          const config = RISK_CONFIG[risk];
          const isOpen = expanded === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              {/* Clause Header */}
              <button
                className="w-full p-5 flex items-center justify-between gap-4 text-left"
                onClick={() => setExpanded(isOpen ? null : index)}
              >
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
                    <AlertTriangle className={`size-4 ${config.text}`} />
                  </div>
                  <div>
                    <span className="font-semibold text-white text-sm">{clause.title}</span>
                    <div className={`inline-flex items-center gap-1.5 ml-3 px-2 py-0.5 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
                      <div className={`size-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </div>
                  </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ArrowRight className="size-4 text-white/30" />
                </motion.div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                      {/* Original */}
                      <div className="rounded-xl bg-red-950/40 border border-red-500/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-red-400 tracking-wider">ORIGINAL CLAUSE</span>
                          <button
                            onClick={() => handleCopy(clause.original, `${index}-orig`)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            {copiedId === `${index}-orig`
                              ? <CheckCircle2 className="size-3.5 text-emerald-400" />
                              : <Copy className="size-3.5 text-white/30" />}
                          </button>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{clause.original}</p>
                      </div>

                      <div className="flex justify-center">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/20">
                          <ArrowRight className="size-3.5 text-violet-400" />
                          <span className="text-xs text-violet-400 font-medium">AI Rewrite</span>
                        </div>
                      </div>

                      {/* Rewrite */}
                      <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-400 tracking-wider">SUGGESTED REWRITE</span>
                          <button
                            onClick={() => handleCopy(clause.rewritten, `${index}-new`)}
                            className="p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                          >
                            {copiedId === `${index}-new`
                              ? <CheckCircle2 className="size-3.5 text-emerald-400" />
                              : <Copy className="size-3.5 text-white/30" />}
                          </button>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{clause.rewritten}</p>
                      </div>

                      {/* Footer */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="rounded-xl bg-white/3 p-3">
                          <span className="text-xs font-bold text-white/30 uppercase tracking-wider">Why it matters</span>
                          <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{clause.reason}</p>
                        </div>
                        <div className="rounded-xl bg-white/3 p-3">
                          <span className="text-xs font-bold text-white/30 uppercase tracking-wider">Impact</span>
                          <p className="text-xs text-white/55 mt-1.5 leading-relaxed">{clause.impact}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
