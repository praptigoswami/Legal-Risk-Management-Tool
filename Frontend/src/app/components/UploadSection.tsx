import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  Upload, FileText, X, CheckCircle2, Zap,
  CloudUpload, FileScan, Brain, Shield, AlertTriangle,
} from 'lucide-react';
import { analyzeContract, compareContracts, AnalysisResult, ComparisonResult } from '../api';

interface UploadSectionProps {
  mode: 'single' | 'comparison';
  onUpload: (files: File[], result: AnalysisResult | ComparisonResult) => void;
}

const ANALYSIS_STEPS = [
  { icon: FileScan,      label: 'Parsing document structure…',  ms: 800  },
  { icon: Brain,         label: 'Running clause detection…',    ms: 1000 },
  { icon: Shield,        label: 'Checking compliance rules…',   ms: 800  },
  { icon: CheckCircle2,  label: 'Generating risk report…',      ms: 600  },
];

/* ── AI Loading Screen ── */
function AILoadingScreen({
  onDone,
  onError,
}: {
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const [step, setStep]         = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const total = ANALYSIS_STEPS.reduce((a, s) => a + s.ms, 0);
    let elapsed = 0;
    let stepIdx = 0;
    let raf: number;

    const runStep = () => {
      if (stepIdx >= ANALYSIS_STEPS.length) {
        setProgress(100);
        setTimeout(onDone, 400);
        return;
      }
      setStep(stepIdx);
      const dur = ANALYSIS_STEPS[stepIdx].ms;
      const start = Date.now();

      const tick = () => {
        const t = Math.min((Date.now() - start) / dur, 1);
        const globalPct = ((elapsed + t * dur) / total) * 100;
        setProgress(globalPct);
        if (t < 1) {
          raf = requestAnimationFrame(tick);
        } else {
          elapsed += dur;
          stepIdx++;
          runStep();
        }
      };
      raf = requestAnimationFrame(tick);
    };
    runStep();
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const StepIcon = ANALYSIS_STEPS[step]?.icon ?? CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.35 }}
      className="glass-card rounded-3xl p-10 text-center space-y-7 relative overflow-hidden"
    >
      {/* Scanning line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="scan-line" />
      </div>

      {/* Dual spinning rings */}
      <div className="relative mx-auto" style={{ width: 104, height: 104 }}>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(139,92,246,0.25)', borderTopColor: '#8b5cf6' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-3 rounded-full"
          style={{ border: '2px solid rgba(59,130,246,0.2)', borderBottomColor: '#3b82f6' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 20 }}
              transition={{ duration: 0.3, ease: 'back.out(1.7)' }}
              className="size-11 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}
            >
              <StepIcon className="size-5 text-white" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Step label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-1"
        >
          <p className="text-white font-bold text-base">{ANALYSIS_STEPS[step]?.label ?? 'Finalizing…'}</p>
          <p className="text-white/35 text-xs">AI is analyzing your contract…</p>
        </motion.div>
      </AnimatePresence>

      {/* Pulsing dots */}
      <div className="flex justify-center gap-2">
        <div className="size-2 rounded-full bg-violet-400 ai-dot" />
        <div className="size-2 rounded-full bg-blue-400 ai-dot" />
        <div className="size-2 rounded-full bg-emerald-400 ai-dot" />
      </div>

      {/* Global progress bar */}
      <div className="space-y-1.5">
        <div className="h-2 bg-white/6 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #34d399)',
              boxShadow: '0 0 10px rgba(139,92,246,0.6)',
              transition: 'width 0.1s linear',
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/25">
          <span>Analyzing…</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Step checklist */}
      <div className="space-y-2.5 text-left">
        {ANALYSIS_STEPS.map((s, i) => (
          <motion.div
            key={i}
            animate={{ opacity: i <= step ? 1 : 0.3 }}
            className="flex items-center gap-3 text-sm"
          >
            <div className={`size-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              i < step  ? 'bg-emerald-500/20 border border-emerald-500/35' :
              i === step ? 'bg-violet-500/20 border border-violet-500/35' :
              'bg-white/5 border border-white/10'
            }`}>
              {i < step
                ? <CheckCircle2 className="size-3 text-emerald-400" />
                : <s.icon className={`size-3 ${i === step ? 'text-violet-400' : 'text-white/25'}`} />
              }
            </div>
            <span className={i <= step ? 'text-white/65' : 'text-white/22'}>{s.label}</span>
            {i === step && (
              <motion.div
                className="ml-auto flex gap-1"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {[0, 1, 2].map(d => (
                  <div key={d} className="size-1 rounded-full bg-violet-400" />
                ))}
              </motion.div>
            )}
            {i < step && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="ml-auto"
              >
                <CheckCircle2 className="size-3.5 text-emerald-400" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Main Upload Section ── */
export function UploadSection({ mode, onUpload }: UploadSectionProps) {
  const [dragActive, setDragActive]       = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing]         = useState(false);
  const [apiError, setApiError]           = useState<string | null>(null);
  const [animDone, setAnimDone]           = useState(false);
  const apiResultRef = useRef<AnalysisResult | ComparisonResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef  = useRef<HTMLDivElement>(null);
  const btnRef       = useRef<HTMLButtonElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).slice(0, mode === 'comparison' ? 2 : 1);
    setSelectedFiles(files);
    if (dropZoneRef.current) {
      gsap.timeline()
        .to(dropZoneRef.current, { scale: 1.025, duration: 0.12, ease: 'power2.out' })
        .to(dropZoneRef.current, { scale: 1, duration: 0.55, ease: 'elastic.out(1, 0.4)' });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, mode === 'comparison' ? 2 : 1);
      setSelectedFiles(files);
    }
  };

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAnalyze = () => {
    if (!selectedFiles.length) return;
    if (btnRef.current) {
      gsap.fromTo(btnRef.current, { scale: 0.94 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
    }
    setApiError(null);
    setAnimDone(false);
    apiResultRef.current = null;
    setAnalyzing(true);

    // Fire the real API call in parallel with the animation
    const apiCall = mode === 'single'
      ? analyzeContract(selectedFiles[0])
      : compareContracts(selectedFiles[0], selectedFiles[1] ?? selectedFiles[0]);

    apiCall.then(result => {
      apiResultRef.current = result;
      // If animation already finished, proceed immediately
      if (animDone) {
        onUpload(selectedFiles, result);
        setAnalyzing(false);
      }
    }).catch(err => {
      setApiError(err.message || 'Analysis failed. Please check if the backend is running.');
      setAnalyzing(false);
    });
  };

  // Called when the loading animation finishes
  const handleAnimDone = () => {
    setAnimDone(true);
    if (apiResultRef.current) {
      // API already returned — transition now
      onUpload(selectedFiles, apiResultRef.current);
      setAnalyzing(false);
    }
    // Otherwise keep showing the loader until API responds
  };

  const formatBytes = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const getEmoji = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    return ext === 'pdf' ? '📄' : ext === 'docx' || ext === 'doc' ? '📝' : '📃';
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {analyzing ? (
          <AILoadingScreen
            key="loading"
            onDone={handleAnimDone}
            onError={msg => { setApiError(msg); setAnalyzing(false); }}
          />
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="space-y-5"
          >
            {/* ─ API Error Banner ─ */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-4 border border-red-500/35 flex items-start gap-3"
              >
                <AlertTriangle className="size-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-300 mb-0.5">Analysis Failed</p>
                  <p className="text-xs text-white/50">{apiError}</p>
                  <p className="text-xs text-white/35 mt-1">
                    Make sure the backend is running: <code className="text-violet-400">uvicorn main:app --reload --port 8000</code>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ─ Drop Zone ─ */}
            <div
              ref={dropZoneRef}
              className="relative rounded-3xl cursor-pointer"
              style={{ padding: '1.5px', background: dragActive ? 'linear-gradient(135deg, #8b5cf6, #3b82f6, #34d399)' : 'linear-gradient(135deg, rgba(139,92,246,0.28), rgba(59,130,246,0.28))' }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <motion.div
                className="rounded-[22px] p-14 text-center relative overflow-hidden"
                style={{ background: dragActive ? 'rgba(20,10,40,0.9)' : 'rgba(5,5,16,0.92)' }}
                animate={dragActive ? { scale: 1.008 } : { scale: 1 }}
              >
                {dragActive && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none rounded-[22px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
                  />
                )}

                {/* Icon cluster */}
                <div className="relative mx-auto mb-7" style={{ width: 100, height: 100 }}>
                  {dragActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border border-violet-500/60"
                      animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    style={{ border: '1.5px solid rgba(139,92,246,0.2)' }}
                    animate={dragActive ? { borderColor: ['rgba(139,92,246,0.4)', 'rgba(59,130,246,0.7)', 'rgba(139,92,246,0.4)'] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div className="absolute inset-2 rounded-xl bg-gradient-to-br from-violet-500/15 to-blue-500/10 border border-white/5 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {dragActive
                        ? <motion.div key="cloud" initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400 }}>
                            <CloudUpload className="size-10 text-violet-300" />
                          </motion.div>
                        : <motion.div key="up" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Upload className="size-10 text-white/25" />
                          </motion.div>
                      }
                    </AnimatePresence>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {mode === 'comparison' ? 'Drop 2 Contracts to Compare' : 'Drop Your Contract Here'}
                </h3>
                <p className="text-white/30 text-sm mb-7">
                  or <span className="text-violet-400 underline underline-offset-2 decoration-dotted">browse files</span>
                </p>

                <motion.button
                  type="button"
                  onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="btn-gradient inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white font-bold text-sm"
                  style={{ boxShadow: '0 0 28px rgba(139,92,246,0.45)' }}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(139,92,246,0.65)' }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Upload className="size-4" />
                  Choose {mode === 'comparison' ? 'Files' : 'File'}
                </motion.button>

                <div className="flex items-center justify-center gap-3 mt-6">
                  {['pdf', 'docx', 'txt'].map(f => (
                    <span key={f} className="font-mono text-[10px] text-white/18 px-2 py-0.5 rounded-md bg-white/4 border border-white/6">.{f}</span>
                  ))}
                  <span className="text-white/18 text-xs">· Max {mode === 'comparison' ? '2 files' : '1 file'}</span>
                </div>
              </motion.div>
            </div>

            <input ref={fileInputRef} type="file" multiple={mode === 'comparison'} accept=".pdf,.docx,.txt" onChange={handleFileSelect} className="hidden" />

            {/* ─ File list ─ */}
            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="step-line" />
                    <span className="text-[10px] text-white/28 font-black uppercase tracking-widest whitespace-nowrap">
                      {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''} Ready
                    </span>
                    <div className="step-line" />
                  </div>

                  <div className="space-y-2.5">
                    {selectedFiles.map((file, i) => (
                      <motion.div
                        key={`${file.name}-${i}`}
                        initial={{ opacity: 0, x: -20, scale: 0.97 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.09, type: 'spring', stiffness: 280, damping: 22 }}
                        className="glass-card rounded-2xl p-4 flex items-center justify-between"
                        whileHover={{ x: 4, borderColor: 'rgba(139,92,246,0.3)' }}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="size-11 rounded-xl bg-violet-500/10 border border-violet-500/18 flex items-center justify-center text-xl flex-shrink-0">
                            {getEmoji(file.name)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm truncate max-w-[240px]">{file.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-white/28">{formatBytes(file.size)}</p>
                              <div className="size-1 rounded-full bg-white/15" />
                              <p className="text-[10px] text-emerald-400 font-semibold tracking-wide uppercase">Ready</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 450, delay: 0.18 + i * 0.09 }}>
                            <CheckCircle2 className="size-5 text-emerald-400" style={{ filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.7))' }} />
                          </motion.div>
                          <motion.button
                            onClick={() => handleRemoveFile(i)}
                            className="size-8 rounded-xl flex items-center justify-center text-white/22 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.85 }}
                          >
                            <X className="size-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Analyze CTA */}
                  <motion.button
                    ref={btnRef}
                    onClick={handleAnalyze}
                    className="w-full py-4 rounded-2xl btn-gradient text-white font-black text-base flex items-center justify-center gap-3 relative overflow-hidden"
                    style={{ boxShadow: '0 0 35px rgba(139,92,246,0.45)' }}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 55px rgba(139,92,246,0.65)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Shimmer sweep */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.14) 50%, transparent 75%)' }}
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.8 }}
                    />
                    <Zap className="size-5 relative z-10" />
                    <span className="relative z-10">
                      Analyze {mode === 'comparison' ? 'Both Contracts' : 'Contract'} with AI
                    </span>
                  </motion.button>

                  <p className="text-center text-[10px] text-white/18 font-medium">
                    Results powered by Gemini AI · Zero data storage · End-to-end encrypted
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
