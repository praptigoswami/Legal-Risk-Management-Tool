import { Clock, AlertTriangle, Calendar, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TimelineEvent } from '../api';

interface Props {
  events: TimelineEvent[];
}

const SEV = {
  high:   { dot: 'bg-red-500',    text: 'text-red-300',    bg: 'bg-red-500/15',    border: 'border-red-500/25',    line: '#ef4444', label: 'HIGH' },
  medium: { dot: 'bg-amber-500',  text: 'text-amber-300',  bg: 'bg-amber-500/15',  border: 'border-amber-500/25',  line: '#f59e0b', label: 'MEDIUM' },
  low:    { dot: 'bg-emerald-500', text: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/25', line: '#34d399', label: 'LOW' },
};

export function RedFlagTimeline({ events }: Props) {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lineRef.current) {
      gsap.fromTo(lineRef.current, { scaleY: 0, transformOrigin: 'top' }, { scaleY: 1, duration: 1.2, ease: 'power3.out' });
    }
  }, []);

  if (events.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <p className="text-white/40 text-sm">No timeline events available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-amber-500/20">
        <div className="size-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
          <Clock className="size-5 text-amber-400" />
        </div>
        <div>
          <h4 className="font-bold text-white mb-0.5">Predictive Timeline</h4>
          <p className="text-sm text-white/45">
            This timeline shows when you may face issues based on specific contract clauses. Plan ahead and set reminders.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div
          ref={lineRef}
          className="absolute left-[19px] top-0 bottom-0 w-0.5"
          style={{ background: 'linear-gradient(180deg, rgba(139,92,246,0.6) 0%, rgba(59,130,246,0.2) 100%)' }}
        />

        <div className="space-y-5">
          {events.map((event, i) => {
            const sevKey = (event.severity === 'high' || event.severity === 'medium' || event.severity === 'low')
              ? event.severity : 'medium';
            const s = SEV[sevKey];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative pl-10"
              >
                {/* Dot */}
                <div
                  className={`absolute left-[-2px] top-4 size-5 rounded-full ${s.dot} border-2 border-slate-950 z-10`}
                  style={{ boxShadow: `0 0 10px ${s.line}88` }}
                />

                {/* Timeframe */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
                    <Calendar className="size-3" />
                    {event.timeframe}
                  </div>
                  <span className={`text-xs font-bold ${s.text}`}>{s.label} SEVERITY</span>
                </div>

                {/* Card */}
                <div className={`glass-card rounded-2xl p-4 border ${s.border}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className={`size-4 ${s.text} flex-shrink-0 mt-0.5`} />
                    <div>
                      <h4 className="font-bold text-white text-sm">{event.title}</h4>
                      <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/6 pt-3 space-y-2">
                    <div>
                      <span className="text-xs font-bold text-white/25 uppercase tracking-wider">Related Clause</span>
                      <p className="text-xs text-white/50 mt-0.5">{event.clause}</p>
                    </div>
                    <div className={`${s.bg} rounded-xl p-3`}>
                      <span className="text-xs font-bold text-white/30 uppercase tracking-wider">Recommended Action</span>
                      <p className="text-xs text-white/65 mt-1 leading-relaxed">{event.action}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pro tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-violet-500/20"
      >
        <Lightbulb className="size-5 text-violet-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white mb-0.5">Pro Tip</h4>
          <p className="text-sm text-white/45">
            Set calendar reminders for high-severity events. Missing key deadlines (like cancellation windows)
            could lock you in for another contract term automatically.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
