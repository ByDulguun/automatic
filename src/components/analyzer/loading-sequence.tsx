"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  "Understanding the business",
  "Reviewing available digital presence",
  "Identifying potential weaknesses",
  "Finding business opportunities",
  "Matching agency services",
  "Preparing recommendations",
];

const STEP_DURATION_MS = 900;

export function LoadingSequence() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= STEPS.length - 1) return;
    const timer = setTimeout(() => setActiveIndex((i) => i + 1), STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-md space-y-4"
    >
      {STEPS.map((step, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        const isPending = index > activeIndex;

        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: isPending ? 0.35 : 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <span className="flex size-5 shrink-0 items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                {isDone ? (
                  <motion.span
                    key="done"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex size-5 items-center justify-center rounded-full bg-violet-500/20 text-violet-300"
                  >
                    <Check className="size-3" />
                  </motion.span>
                ) : isActive ? (
                  <motion.span key="active">
                    <Loader2 className="size-4 animate-spin text-violet-400" />
                  </motion.span>
                ) : (
                  <motion.span key="pending" className="size-1.5 rounded-full bg-zinc-700" />
                )}
              </AnimatePresence>
            </span>
            <span
              className={
                isActive
                  ? "text-sm text-zinc-100"
                  : isDone
                    ? "text-sm text-zinc-500"
                    : "text-sm text-zinc-600"
              }
            >
              {step}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
