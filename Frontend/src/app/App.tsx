import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Scale, CheckCircle2, Clock, Sparkles, Shield, Zap,
  ArrowRight, FileText, BarChart2, ChevronRight, Star,
} from 'lucide-react';
import { UploadSection } from './components/UploadSection';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { ContractComparison } from './components/ContractComparison';
import { AnalysisResult, ComparisonResult } from './api';

gsap.registerPlugin(ScrollTrigger);

/* ── Mouse-tracking cursor glow ── */
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (ref.current) {
        gsap.to(ref.current, { x: e.clientX, y: e.clientY, duration: 0.6, ease: 'power2.out' });
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return <div ref={ref} className="cursor-glow" />;
}

/* ── Ambient floating orb ── */
function FloatingOrb({ x, y, size, color, blur, delay }: { x: string; y: string; size: string; color: string; blur: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color, filter: `blur(${blur})` }}
      animate={{ y: [0, -20, 0], x: [0, 8, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/* ── Typewriter text ── */
function Typewriter({ words }: { words: string[] }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIdx, words]);

  return (
    <span className="gradient-text">
      {displayed}<span className="cursor text-violet-400">|</span>
    </span>
  );
}

/* ── Animated stat ticker ── */
function StatTicker() {
  const stats = [
    { val: '94%', label: 'Risk Detection Rate' },
    { val: '2.4s', label: 'Avg Analysis Time' },
    { val: '50K+', label: 'Contracts Analyzed' },
    { val: '99.1%', label: 'Compliance Accuracy' },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-8 py-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.1 }}
          className="text-center"
        >
          <div className="text-2xl font-black gradient-text">{s.val}</div>
          <div className="text-xs text-white/35 mt-0.5 font-medium">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Feature card with tilt effect ── */
function FeatureCard({ feature, index }: {
  feature: { icon: React.ElementType; title: string; description: string; color: string; glow: string; badge?: string };
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(el, {
      rotateX: -y * 8, rotateY: x * 8,
      transformPerspective: 800,
      duration: 0.3, ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (cardRef.current) gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power3.out' });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 + index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="glass-card rounded-2xl p-6 space-y-4 cursor-default relative overflow-hidden tilt-card"
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={{ borderColor: 'rgba(139,92,246,0.4)', boxShadow: `0 0 40px ${feature.glow}` }}
    >
      {/* Shimmer sweep on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)' }}
        whileHover={{ opacity: 1, backgroundPosition: ['200% 0', '-100% 0'] }}
        transition={{ duration: 0.6 }}
      />

      {feature.badge && (
        <div className="absolute top-4 right-4 tag-pill bg-violet-500/20 text-violet-300 border border-violet-500/25">
          {feature.badge}
        </div>
      )}

      <div
        className={`size-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}
        style={{ boxShadow: `0 0 24px ${feature.glow}` }}
      >
        <feature.icon className="size-6 text-white" />
      </div>

      <div>
        <h3 className="font-bold text-white text-base mb-1">{feature.title}</h3>
        <p className="text-sm text-white/45 leading-relaxed">{feature.description}</p>
      </div>

      <motion.div
        className="flex items-center gap-1.5 text-xs text-violet-400 font-semibold"
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        Explore feature <ChevronRight className="size-3" />
      </motion.div>
    </motion.div>
  );
}

const FEATURES = [
  { icon: FileText,    title: 'AI Clause Rewrite',    description: 'Get instant AI-powered rewrites for every risky clause, with plain-English explanations.', color: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.4)', badge: 'Popular' },
  { icon: Scale,       title: 'Contract Comparison',  description: 'Upload two contracts and get a side-by-side winner analysis across 20+ dimensions.', color: 'from-blue-500 to-cyan-600', glow: 'rgba(59,130,246,0.4)' },
  { icon: Clock,       title: 'Red Flag Timeline',    description: 'Visualize exactly when each risk materializes — so you can plan and set reminders.', color: 'from-amber-500 to-orange-600', glow: 'rgba(245,158,11,0.4)' },
  { icon: CheckCircle2,title: 'Compliance Check',     description: 'Automated GDPR, CCPA, labor law, and consumer protection checks in seconds.', color: 'from-emerald-500 to-green-600', glow: 'rgba(52,211,153,0.4)', badge: 'New' },
];

const TRUST_BADGES = [
  { icon: Shield,  label: 'SOC 2 Compliant' },
  { icon: Zap,     label: 'Zero Data Storage' },
  { icon: Star,    label: '4.9/5 Rating' },
  { icon: BarChart2, label: 'AI-Powered' },
];

export default function App() {
  const [analysisMode, setAnalysisMode] = useState<'single' | 'comparison'>('single');
  const [uploadedContracts, setUploadedContracts] = useState<File[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | ComparisonResult | null>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const blurValue = useTransform(scrollY, [0, 80], ['blur(8px)', 'blur(24px)']);
  const bgAlpha  = useTransform(scrollY, [0, 80], ['rgba(5,5,16,0.6)', 'rgba(5,5,16,0.9)']);
  const headerBlur = useTransform(scrollY, [0, 80], [0, 1]);

  // GSAP logo entrance
  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(logoRef.current,
        { scale: 0, rotation: -25, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.9, ease: 'back.out(2)' }
      );
    }
  }, []);

  // GSAP scroll-triggered reveals (only decorative elements, NOT upload)
  useEffect(() => {
    if (!showAnalysis) {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.gsap-scroll-reveal').forEach((el) => {
          gsap.fromTo(el,
            { opacity: 0, y: 20 },
            {
              opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' },
            }
          );
        });
      }, mainRef);
      return () => ctx.revert();
    }
  }, [showAnalysis]);

  const handleFileUpload = (files: File[], result: AnalysisResult | ComparisonResult) => {
    setUploadedContracts(files);
    setAnalysisResult(result);
    setShowAnalysis(true);
  };

  const handleReset = () => {
    setUploadedContracts([]);
    setAnalysisResult(null);
    setShowAnalysis(false);
  };

  return (
    <div ref={mainRef} className="size-full gradient-bg overflow-auto relative">
      <CursorGlow />

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingOrb x="-5%" y="-15%" size="700px" color="rgba(139,92,246,0.07)" blur="120px" delay={0} />
        <FloatingOrb x="70%"  y="60%"  size="500px" color="rgba(59,130,246,0.07)"  blur="100px" delay={3} />
        <FloatingOrb x="30%"  y="80%"  size="350px" color="rgba(52,211,153,0.05)"  blur="80px"  delay={5} />

        {/* Floating dots */}
        {Array.from({ length: 22 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 41 + 13) % 100}%`,
              top: `${(i * 57 + 9) % 100}%`,
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              background: i % 3 === 0 ? 'rgba(139,92,246,0.5)' : i % 3 === 1 ? 'rgba(59,130,246,0.4)' : 'rgba(52,211,153,0.4)',
            }}
            animate={{ y: [0, -(15 + (i % 20)), 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.4, 1] }}
            transition={{ duration: 5 + (i % 4), repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── Header ── */}
      <motion.header
        className="border-b border-white/8 sticky top-0 z-50"
        style={{ backdropFilter: blurValue, background: bgAlpha }}
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div ref={logoRef}>
                <motion.div
                  className="size-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center glow-purple relative"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Scale className="size-5 text-white" />
                </motion.div>
              </div>
              <div>
                <h1 className="font-black text-white tracking-tight text-lg leading-none">
                  Contract<span className="gradient-text">Compass</span>
                </h1>
                <p className="text-[10px] text-white/35 font-medium tracking-widest uppercase">AI Legal Analysis</p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Mode toggle */}
              <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-white/4 border border-white/8">
                {(['single', 'comparison'] as const).map((mode) => (
                  <motion.button
                    key={mode}
                    onClick={() => setAnalysisMode(mode)}
                    className="relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    style={{ color: analysisMode === mode ? '#fff' : 'rgba(255,255,255,0.4)' }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {analysisMode === mode && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600"
                        style={{ boxShadow: '0 0 16px rgba(139,92,246,0.5)' }}
                        transition={{ type: 'spring', bounce: 0.28, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">
                      {mode === 'single' ? 'Single Analysis' : 'Compare'}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* CTA */}
              {!showAnalysis && (
                <motion.div
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-semibold cursor-pointer"
                  whileHover={{ scale: 1.04, background: 'rgba(139,92,246,0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >
                  <Sparkles className="size-3.5" />
                  <span>Try Free</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <AnimatePresence mode="wait">
          {!showAnalysis ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-16"
            >
              {/* ── Hero ── */}
              <div className="text-center space-y-6 pt-16 pb-4">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-violet-500/30 text-violet-300 text-sm font-medium"
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="size-4 text-violet-400" />
                  </motion.div>
                  AI-Powered Contract Intelligence
                  <span className="px-1.5 py-0.5 rounded-md bg-violet-500/25 text-violet-200 text-xs font-bold">v2.0</span>
                </motion.div>

                {/* Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-2"
                >
                  <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
                    Analyze Contracts
                  </h2>
                  <h2 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
                    <Typewriter words={['with Confidence', 'in Seconds', 'Like a Lawyer', 'Risk-Free']} />
                  </h2>
                </motion.div>

                {/* Sub */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-white/45 max-w-2xl mx-auto leading-relaxed"
                >
                  Upload your legal contracts and get instant AI-powered analysis — clause rewrites,
                  risk detection, compliance checks, and simplified explanations in under 3 seconds.
                </motion.p>

                {/* Trust pills */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="flex flex-wrap items-center justify-center gap-3"
                >
                  {TRUST_BADGES.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border border-white/10 text-xs text-white/50">
                      <Icon className="size-3 text-violet-400" />
                      {label}
                    </div>
                  ))}
                </motion.div>

                {/* Stats ticker */}
                <StatTicker />

                {/* CTA scroll button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="flex justify-center pt-2"
                >
                  <motion.button
                    onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    className="btn-gradient inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-black text-base relative overflow-hidden"
                    style={{ boxShadow: '0 0 40px rgba(139,92,246,0.5)' }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(139,92,246,0.7)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {/* Shimmer sweep */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.15) 50%, transparent 75%)' }}
                      animate={{ x: ['-120%', '220%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <Zap className="size-5 relative z-10" />
                    <span className="relative z-10">Upload & Analyze Contract</span>
                    <ArrowRight className="size-5 relative z-10" />
                  </motion.button>
                </motion.div>

              </div>{/* end hero text-center */}

              {/* ── Features ── */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="step-line" />
                  <span className="text-xs text-white/30 font-bold uppercase tracking-widest whitespace-nowrap">Everything You Need</span>
                  <div className="step-line" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
                </div>
              </motion.div>

              {/* ── Upload Section ── */}
              <motion.div
                id="upload-section"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="step-line" />
                  <span className="text-xs text-white/30 font-bold uppercase tracking-widest whitespace-nowrap">Upload &amp; Analyze</span>
                  <div className="step-line" />
                </div>
                <UploadSection mode={analysisMode} onUpload={handleFileUpload} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="pt-8"
            >
              {analysisMode === 'single' ? (
                <AnalysisDashboard
                  contract={uploadedContracts[0]}
                  onReset={handleReset}
                  analysisResult={analysisResult as AnalysisResult | null}
                />
              ) : (
                <ContractComparison
                  contracts={uploadedContracts}
                  onReset={handleReset}
                  comparisonResult={analysisResult as ComparisonResult | null}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Bottom glow footer line ── */}
      {!showAnalysis && (
        <div className="fixed bottom-0 left-0 right-0 h-px pointer-events-none">
          <motion.div
            className="h-full animated-border opacity-30"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      )}
    </div>
  );
}