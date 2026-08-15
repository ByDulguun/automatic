"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Star,
  Copy,
  Check,
  RotateCcw,
  Info,
  Building2,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge } from "@/components/analyzer/priority-badge";
import type { AnalysisResult } from "@/lib/schema";
import { cn } from "@/lib/utils";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-[0.15em] text-zinc-500 uppercase">{children}</p>
  );
}

function DataLimitationsBanner({ result }: { result: AnalysisResult }) {
  const sources: { label: string; available: boolean }[] = [
    { label: "Website", available: result.dataAvailability.website },
    { label: "Facebook", available: result.dataAvailability.facebook },
    { label: "Instagram", available: result.dataAvailability.instagram },
    { label: "Notes", available: result.dataAvailability.notes },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-start">
      <Info className="mt-0.5 size-4 shrink-0 text-zinc-500" />
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {sources.map((s) => (
            <span
              key={s.label}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                s.available
                  ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-500"
              )}
            >
              {s.label} {s.available ? "used" : "unavailable"}
            </span>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-zinc-500">{result.dataLimitationsNote}</p>
      </div>
    </div>
  );
}

function BusinessSnapshot({ result }: { result: AnalysisResult }) {
  const { businessSnapshot } = result;
  return (
    <Card className="border-zinc-800 bg-zinc-900/40 p-6">
      <div className="mb-4 flex items-center gap-2 text-zinc-500">
        <Building2 className="size-4" />
        <SectionLabel>Business Snapshot</SectionLabel>
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
        {businessSnapshot.businessName}
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-zinc-500">Industry</p>
          <p className="text-sm text-zinc-200">{businessSnapshot.industry}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Business Model</p>
          <p className="text-sm text-zinc-200">{businessSnapshot.businessType}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-zinc-500">What They Offer</p>
          <p className="text-sm text-zinc-200">{businessSnapshot.whatTheyOffer}</p>
        </div>
      </div>
      <Separator className="my-4 bg-zinc-800" />
      <div>
        <p className="text-xs text-zinc-500">Current Situation</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-300">{businessSnapshot.summary}</p>
      </div>
    </Card>
  );
}

function TopOpportunity({ result }: { result: AnalysisResult }) {
  const { topOpportunity } = result;
  return (
    <Card className="relative overflow-hidden border-violet-500/25 bg-gradient-to-b from-violet-500/[0.07] to-transparent p-6">
      <div className="mb-4 flex items-center gap-2 text-violet-300">
        <Flame className="size-4" />
        <SectionLabel>Top Opportunity</SectionLabel>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-50">
          {topOpportunity.title}
        </h3>
        <PriorityBadge priority={topOpportunity.priority} />
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-xs text-zinc-500">Why this matters</p>
        <p className="text-sm leading-relaxed text-zinc-300">{topOpportunity.whyItMatters}</p>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs text-zinc-500">Our recommendation</p>
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {topOpportunity.recommendation.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-zinc-200">
              <span className="size-1 shrink-0 rounded-full bg-violet-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <p className="text-xs text-zinc-500">Expected impact</p>
        <p className="text-sm text-zinc-300">{topOpportunity.expectedImpact}</p>
      </div>
    </Card>
  );
}

function OpportunityCard({ opportunity }: { opportunity: AnalysisResult["opportunities"][number] }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold tracking-wide text-zinc-100">{opportunity.title}</h4>
        <PriorityBadge priority={opportunity.priority} />
      </div>
      <p className="mt-3 text-xs text-zinc-500">Possible need</p>
      <p className="text-sm text-zinc-300">{opportunity.possibleNeed}</p>
      <p className="mt-3 text-xs text-zinc-500">Why</p>
      <p className="text-sm leading-relaxed text-zinc-400">{opportunity.why}</p>
      <p className="mt-3 text-xs text-zinc-500">What we can offer</p>
      <ul className="mt-1 space-y-1">
        {opportunity.whatWeOffer.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-zinc-200">
            <span className="size-1 shrink-0 rounded-full bg-zinc-600" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function BestOffer({ result }: { result: AnalysisResult }) {
  const { bestOffer } = result;
  return (
    <Card className="border-amber-500/20 bg-gradient-to-b from-amber-500/[0.06] to-transparent p-6">
      <div className="mb-4 flex items-center gap-2 text-amber-300">
        <Star className="size-4" />
        <SectionLabel>Recommended Offer</SectionLabel>
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-zinc-50">{bestOffer.name}</h3>
      <ul className="mt-4 space-y-1.5">
        {bestOffer.includes.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-zinc-200">
            <Check className="size-3.5 shrink-0 text-amber-400" />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <p className="text-xs text-zinc-500">Reason</p>
        <p className="text-sm text-zinc-300">{bestOffer.reason}</p>
      </div>
      <div className="mt-4">
        <p className="text-xs text-zinc-500">Estimated project complexity</p>
        <p className="text-sm font-medium text-zinc-200">{bestOffer.complexity}</p>
      </div>
    </Card>
  );
}

function ApproachSection({ result }: { result: AnalysisResult }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.approach.openingMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <Card className="border-zinc-800 bg-zinc-900/40 p-6">
      <div className="mb-4 flex items-center gap-2 text-zinc-500">
        <MessageCircle className="size-4" />
        <SectionLabel>How To Approach This Client</SectionLabel>
      </div>

      <p className="text-xs text-zinc-500">What to lead with</p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-300">{result.approach.whatToLeadWith}</p>

      <Separator className="my-4 bg-zinc-800" />

      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">Personalized opening message</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 text-xs text-zinc-400 hover:text-zinc-100"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="mt-2 whitespace-pre-line rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm leading-relaxed text-zinc-200">
        {result.approach.openingMessage}
      </p>
    </Card>
  );
}

export function ResultView({
  result,
  onReset,
}: {
  result: AnalysisResult;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-3xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <SectionLabel>Analysis Result</SectionLabel>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 gap-1.5 text-xs text-zinc-400 hover:text-zinc-100"
        >
          <RotateCcw className="size-3.5" />
          New Analysis
        </Button>
      </div>

      {result.insufficientData && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4 text-sm text-amber-200">
          Insufficient public information was available to produce a confident analysis. The
          result below is a best-effort, low-confidence read based only on what was provided.
        </div>
      )}

      <DataLimitationsBanner result={result} />
      <BusinessSnapshot result={result} />
      <TopOpportunity result={result} />

      <div className="space-y-3">
        <SectionLabel>What They May Need</SectionLabel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {result.opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.title} opportunity={opportunity} />
          ))}
        </div>
      </div>

      <BestOffer result={result} />
      <ApproachSection result={result} />
    </motion.div>
  );
}
