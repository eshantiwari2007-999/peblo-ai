"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, FileText, Zap, Share2, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FileText,
    title: "Write without friction",
    desc: "Distraction-free editor with real-time autosave. Your thoughts, preserved instantly.",
  },
  {
    icon: BrainCircuit,
    title: "AI that actually helps",
    desc: "Generate summaries, extract action items, and suggest titles — powered by Gemini.",
  },
  {
    icon: Share2,
    title: "Share with a link",
    desc: "Make any note public with a cryptographically secure share link. Revoke anytime.",
  },
  {
    icon: Zap,
    title: "Keyboard-first",
    desc: "⌘N for new note, ⌘H for dashboard, ⌘K for command palette. Built for speed.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* ── Nav ── */}
      <nav className="border-b border-border/40 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full relative z-10 backdrop-blur-md bg-background/80">
        <div className="flex items-center gap-2.5 group cursor-default">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <Sparkles size={18} />
          </div>
          <span className="font-semibold tracking-tight text-lg">Peblo</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-foreground text-background px-4 py-2 rounded-full font-medium hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col justify-center px-6 py-12 lg:py-0 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center h-full min-h-[70vh]">
          {/* Left Column - Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-start text-left pt-10 lg:pt-0"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground bg-secondary/50 border border-border/50 rounded-full px-3 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Powered by Google Gemini 1.5 Flash
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-[5rem] font-bold tracking-[-0.03em] text-foreground mb-6 leading-[1.05]">
              Your knowledge, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-violet-500 via-primary to-indigo-500">
                intelligently <br className="hidden sm:block" /> organized.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed font-medium">
              Peblo is a crafted notes workspace. Capture ideas at the speed of thought and let AI extract summaries, tasks, and structure.
            </motion.p>

            <motion.div variants={itemVariants} className="flex items-center gap-4 flex-wrap">
              <Link
                href="/register"
                className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                Start building
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-transparent text-foreground rounded-full font-semibold hover:bg-secondary transition-colors border border-border"
              >
                Open workspace
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-16 flex items-center gap-6 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider flex-wrap">
              {[
                { dot: "bg-emerald-500", label: "Real-time autosave" },
                { dot: "bg-violet-500", label: "Gemini AI" },
                { dot: "bg-amber-500", label: "Keyboard-first" },
              ].map(({ dot, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Abstract Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-primary/20 blur-3xl -z-10 rounded-full transform translate-x-10 translate-y-10" />
            <div className="border border-border/50 bg-card/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-4 w-24 bg-secondary rounded-full" />
              </div>
              <div className="space-y-4">
                <div className="h-6 w-3/4 bg-secondary rounded-lg" />
                <div className="h-4 w-full bg-secondary/60 rounded-lg" />
                <div className="h-4 w-5/6 bg-secondary/60 rounded-lg" />
                <div className="h-4 w-4/6 bg-secondary/60 rounded-lg" />
              </div>
              <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-violet-500" />
                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">AI Summary</span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-violet-500/10 rounded" />
                  <div className="h-3 w-4/5 bg-violet-500/10 rounded" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ── Features ── */}
      <section className="border-t border-border/50 bg-secondary/30 relative z-10">
        <div className="max-w-7xl mx-auto w-full px-6 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f) => (
              <motion.div
                variants={itemVariants}
                key={f.title}
                className="group p-8 rounded-3xl border border-border/60 bg-card hover:bg-background transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-150" />
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 text-foreground group-hover:text-primary transition-colors">
                  <f.icon size={20} />
                </div>
                <h3 className="font-bold text-base text-foreground mb-2.5 tracking-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-background py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles size={14} />
            <span className="text-xs font-semibold tracking-wider uppercase">Peblo</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">
            Designed for clarity. Powered by Next.js & Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
