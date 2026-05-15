"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-background selection:bg-primary/20 selection:text-primary">
      {/* ── Left Column (Form) ── */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10">
        <Link href="/" className="absolute top-8 left-8 sm:left-12 flex items-center gap-2.5 group hover:opacity-80 transition-opacity">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300">
            <Sparkles size={16} />
          </div>
          <span className="font-semibold tracking-tight text-foreground">Peblo</span>
        </Link>
        {children}
      </div>

      {/* ── Right Column (Visual) ── */}
      <div className="hidden lg:flex flex-1 relative bg-secondary/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-primary/5 to-transparent z-0" />
        
        {/* Abstract animated shapes */}
        <div className="absolute inset-0 z-0 opacity-40">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute top-[40%] right-[10%] w-[400px] h-[400px] bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl"
          />
        </div>

        {/* Quote/Content */}
        <div className="relative z-10 flex flex-col justify-center items-start px-24 max-w-2xl h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="w-12 h-1 bg-primary mb-8 rounded-full" />
            <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-foreground leading-snug mb-6">
              &quot;The best way to organize your thoughts is to not organize them at all. Let AI do the heavy lifting.&quot;
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20">
                P
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Peblo Team</p>
                <p className="text-xs text-muted-foreground">Building the future of workspaces</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
