"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OpportunityForm } from "@/components/analyzer/opportunity-form";
import { LoadingSequence } from "@/components/analyzer/loading-sequence";
import { ResultView } from "@/components/analyzer/result-view";
import type { AnalysisResult, AnalyzeInput } from "@/lib/schema";

type Status = "idle" | "loading" | "result" | "error";

const MIN_LOADING_MS = 5200;

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: AnalyzeInput, screenshots: File[]) {
    setStatus("loading");
    setError(null);

    const start = Date.now();

    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(input)) {
        formData.set(key, value);
      }
      for (const file of screenshots) {
        formData.append("screenshots", file);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const body = await res.json();

      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS - elapsed));
      }

      if (!res.ok) {
        setError(body.error ?? "Something went wrong.");
        setStatus("error");
        return;
      }

      setResult(body.data);
      setStatus("result");
    } catch {
      const elapsed = Date.now() - start;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS - elapsed));
      }
      setError("Could not reach the analysis service. Check your connection and try again.");
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  return (
    <main className="relative flex min-h-screen flex-1 flex-col items-center bg-zinc-950 px-4 py-16 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-105 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(139,92,246,0.12),transparent)]"
      />

      <div className="relative flex w-full flex-col items-center">
        <AnimatePresence mode="wait">
          {status !== "result" && (
            <motion.div
              key="header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-10 flex flex-col items-center text-center"
            >
              <span className="mb-4 text-[11px] font-medium tracking-[0.25em] text-violet-400">
                INTERNAL AGENCY TOOL
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
                CLIENT OPPORTUNITY ANALYZER
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
                Paste a business link and discover what they may need and what services we can
                offer.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div key="form" exit={{ opacity: 0, y: -8 }} className="flex justify-center">
              <OpportunityForm onSubmit={handleSubmit} />
            </motion.div>
          )}

          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-60 items-center justify-center"
            >
              <LoadingSequence />
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex w-full max-w-md flex-col items-center gap-4 text-center"
            >
              <AlertCircle className="size-8 text-rose-400" />
              <p className="text-sm leading-relaxed text-zinc-400">{error}</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="gap-1.5 border-zinc-800 text-zinc-300 hover:text-zinc-100"
              >
                <RotateCcw className="size-3.5" />
                Try Again
              </Button>
            </motion.div>
          )}

          {status === "result" && result && (
            <motion.div key="result" className="flex w-full justify-center">
              <ResultView result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
