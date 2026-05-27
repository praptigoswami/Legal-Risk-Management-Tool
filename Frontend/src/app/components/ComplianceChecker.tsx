import { Shield, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ComplianceCheck } from '../api';

interface Props {
  checks: ComplianceCheck[];
}

const STATUS = {
  pass:    { icon: CheckCircle2, text: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', label: 'COMPLIANT',     dot: 'bg-emerald-400' },
  fail:    { icon: XCircle,      text: 'text-red-300',     bg: 'bg-red-500/15',     border: 'border-red-500/25',     label: 'NON-COMPLIANT', dot: 'bg-red-400' },
  warning: { icon: AlertCircle,  text: 'text-amber-300',   bg: 'bg-amber-500/15',   border: 'border-amber-500/25',   label: 'NEEDS REVIEW',  dot: 'bg-amber-400' },
};

const CAT_COLOR: Record<string, string> = {
  GDPR:     'bg-violet-500/20 text-violet-300 border-violet-500/25',
  Privacy:  'bg-blue-500/20 text-blue-300 border-blue-500/25',
  Labor:    'bg-cyan-500/20 text-cyan-300 border-cyan-500/25',
  Consumer: 'bg-teal-500/20 text-teal-300 border-teal-500/25',
};

export function ComplianceChecker({ checks }: Props) {
  const pass    = checks.filter(c => c.status === 'pass').length;
  const fail    = checks.filter(c => c.status === 'fail').length;
  const warning = checks.filter(c => c.status === 'warning').length;
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.children,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.4)' }
      );
    }
  }, []);

  if (checks.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <p className="text-white/40 text-sm">No compliance checks available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-violet-500/20">
        <div className="size-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
          <Shield className="size-5 text-violet-400" />
        </div>
        <div>
          <h4 className="font-bold text-white mb-0.5">Compliance Analysis</h4>
          <p className="text-sm text-white/45">
            Automated checks against GDPR, data privacy laws, labor regulations, and consumer protection standards.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Checks', val: checks.length, cls: 'border-white/10', txt: 'text-white' },
          { label: 'Compliant',    val: pass,           cls: 'border-emerald-500/25 bg-emerald-500/10', txt: 'text-emerald-300' },
          { label: 'Warnings',     val: warning,        cls: 'border-amber-500/25 bg-amber-500/10',     txt: 'text-amber-300' },
          { label: 'Failures',     val: fail,           cls: 'border-red-500/25 bg-red-500/10',         txt: 'text-red-300' },
        ].map(({ label, val, cls, txt }) => (
          <div key={label} className={`glass-card rounded-2xl p-4 border ${cls}`}>
            <div className={`text-3xl font-black ${txt} mb-1`}>{val}</div>
            <div className="text-xs text-white/35">{label}</div>
          </div>
        ))}
      </div>

      {/* Checks */}
      <div className="space-y-3">
        {checks.map((check, i) => {
          const statusKey = (check.status === 'pass' || check.status === 'fail' || check.status === 'warning')
            ? check.status : 'warning';
          const s = STATUS[statusKey];
          const Icon = s.icon;
          const catCls = CAT_COLOR[check.category] ?? 'bg-white/10 text-white/50 border-white/15';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`glass-card rounded-2xl p-5 border ${s.border}`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className={`size-8 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`size-4 ${s.text}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h4 className="font-bold text-white text-sm">{check.regulation}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${catCls}`}>
                        {check.category}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{check.requirement}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${s.bg} ${s.text}`}>
                  <div className={`size-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </div>
              </div>

              <div className="border-t border-white/6 pt-3 space-y-2.5">
                <div>
                  <span className="text-xs font-bold text-white/25 uppercase tracking-wider">Finding</span>
                  <p className="text-xs text-white/55 mt-1 leading-relaxed">{check.finding}</p>
                </div>
                {check.recommendation && (
                  <div className={`${s.bg} rounded-xl p-3`}>
                    <span className="text-xs font-bold text-white/25 uppercase tracking-wider">Recommendation</span>
                    <p className="text-xs text-white/60 mt-1 leading-relaxed">{check.recommendation}</p>
                  </div>
                )}
                {check.reference && (
                  <a
                    href={check.reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text} hover:underline`}
                  >
                    <ExternalLink className="size-3" />
                    Learn more about this regulation
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-2xl p-4 border border-amber-500/15"
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="size-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/40 leading-relaxed">
            This automated analysis is for informational purposes only and does not constitute legal advice.
            Please consult with a qualified attorney to ensure full compliance with applicable laws.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
