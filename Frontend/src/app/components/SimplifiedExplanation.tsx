import { Lightbulb, BookOpen, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { SimplifiedClause } from '../api';

interface Props {
  clauses: SimplifiedClause[];
}

export function SimplifiedExplanation({ clauses }: Props) {
  if (clauses.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <p className="text-white/40 text-sm">No simplified explanations available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-card rounded-2xl p-4 flex items-start gap-3 border border-blue-500/20">
        <div className="size-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="size-5 text-blue-400" />
        </div>
        <div>
          <h4 className="font-bold text-white mb-0.5">Explain Like I'm 18</h4>
          <p className="text-sm text-white/45">
            Legal jargon translated into plain English, plus real-world examples to understand the actual impact.
          </p>
        </div>
      </div>

      {/* Clauses */}
      <div className="space-y-4">
        {clauses.map((clause, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl overflow-hidden border border-white/6"
          >
            {/* Section Header */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/6">
              <div className="size-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <BookOpen className="size-3.5 text-violet-400" />
              </div>
              <h4 className="font-bold text-white text-sm">{clause.section}</h4>
            </div>

            <div className="p-5 space-y-3">
              {/* Legal text */}
              <div className="rounded-xl bg-white/3 border border-white/6 p-4">
                <span className="text-xs font-bold text-white/25 uppercase tracking-wider block mb-2">Legal Text</span>
                <p className="text-xs text-white/40 italic leading-relaxed">{clause.legalText}</p>
              </div>

              {/* What it means */}
              <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block mb-2">What it actually means</span>
                <p className="text-sm text-white font-semibold leading-relaxed">{clause.simplified}</p>
              </div>

              {/* Real-world example */}
              <div className="rounded-xl bg-blue-500/8 border border-blue-500/15 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="size-3 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Real-World Example</span>
                </div>
                <p className="text-xs text-white/55 leading-relaxed">{clause.realWorldExample}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
