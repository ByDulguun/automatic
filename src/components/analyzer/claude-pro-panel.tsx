"use client";

import { useState } from "react";
import { Check, Copy, Image as ImageIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  prompt: string;
  screenshotCount: number;
};

export function ClaudeProPanel({ prompt, screenshotCount }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-violet-500/25 bg-violet-500/[0.04] p-4">
      <div className="flex items-center gap-2 text-violet-300">
        <Info className="size-4" />
        <p className="text-xs font-medium tracking-[0.15em] uppercase">How to use this prompt</p>
      </div>

      {screenshotCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-3 text-sm text-amber-200">
          <ImageIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            You have {screenshotCount} screenshot{screenshotCount > 1 ? "s" : ""} ready. Screenshots are{" "}
            <strong>not</strong> included in this prompt — upload them manually into Claude before sending it.
          </span>
        </div>
      )}

      <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-300">
        <li>Copy the prompt below.</li>
        <li>
          Open{" "}
          <a
            href="https://claude.ai/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-300 underline underline-offset-2 hover:text-violet-200"
          >
            Claude Pro
          </a>{" "}
          in a new tab.
        </li>
        <li>
          {screenshotCount > 0
            ? "Upload your screenshots into that conversation first."
            : "No screenshots were added — you can send the prompt as-is."}
        </li>
        <li>Paste the prompt and send it to receive the analysis.</li>
      </ol>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-zinc-500">Generated prompt</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1.5 text-xs text-zinc-400 hover:text-zinc-100"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy Prompt"}
        </Button>
      </div>
      <Textarea
        readOnly
        value={prompt}
        rows={14}
        onFocus={(e) => e.currentTarget.select()}
        className="resize-y border-zinc-800 bg-zinc-950/60 font-mono text-xs text-zinc-300"
      />
    </div>
  );
}
