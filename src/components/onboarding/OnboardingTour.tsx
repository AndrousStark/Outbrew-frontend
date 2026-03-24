"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Mail, Flame, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Welcome to Outbrew",
    description: "Let's take a quick tour of the key features to get you started.",
    icon: LayoutDashboard,
    color: "from-orange-500 to-orange-500",
  },
  {
    title: "Campaigns",
    description: "Create and manage cold email campaigns. Upload recipients, personalize emails with AI, and schedule sends.",
    icon: Mail,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Email Warmup",
    description: "New email accounts need warmup before sending campaigns. Our AI peer-to-peer network builds your sender reputation automatically.",
    icon: Flame,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Marketplace",
    description: "Access templates, company intelligence, and other utilities to find and reach your target audience.",
    icon: Sparkles,
    color: "from-cyan-500 to-teal-500",
  },
  {
    title: "Insights",
    description: "Track campaign performance, open rates, reply rates, and optimize your outreach strategy with data.",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-500",
  },
];

const STORAGE_KEY = "onboarding_completed";

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Short delay so the dashboard loads first
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!visible) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-md mx-4 bg-[#080808] border border-orange-500/15 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon area */}
          <div className="flex justify-center pt-8 pb-4">
            <motion.div
              key={step}
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Icon className="w-10 h-10 text-white" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-8 pb-4 text-center">
            <motion.h2
              key={`title-${step}`}
              className="text-xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {current.title}
            </motion.h2>
            <motion.p
              key={`desc-${step}`}
              className="text-sm text-neutral-400 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {current.description}
            </motion.p>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 py-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? "bg-orange-500 w-6" : "bg-slate-600"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-8 pb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="gap-1 text-neutral-400"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <span className="text-xs text-neutral-500">
              {step + 1} of {STEPS.length}
            </span>

            {isLast ? (
              <Button
                size="sm"
                onClick={handleComplete}
                className="gap-1 bg-gradient-to-r from-orange-500 to-amber-500"
              >
                Get Started
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                className="gap-1 bg-orange-500/20 hover:bg-amber-600"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
