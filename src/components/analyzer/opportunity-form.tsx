"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Globe, NotebookPen, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { AnalyzeInput } from "@/lib/schema";

type Props = {
  onSubmit: (input: AnalyzeInput) => void;
  disabled?: boolean;
};

export function OpportunityForm({ onSubmit, disabled }: Props) {
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [notes, setNotes] = useState("");

  const canSubmit = Boolean(
    facebookUrl.trim() || instagramUrl.trim() || websiteUrl.trim() || notes.trim()
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || disabled) return;
    onSubmit({ facebookUrl, instagramUrl, websiteUrl, notes });
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="w-full max-w-xl space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="facebookUrl" className="flex items-center gap-2 text-sm text-zinc-400">
          <Link2 className="size-3.5" />
          Facebook Page URL
        </Label>
        <Input
          id="facebookUrl"
          placeholder="https://facebook.com/businessname"
          value={facebookUrl}
          onChange={(e) => setFacebookUrl(e.target.value)}
          disabled={disabled}
          className="h-11 bg-zinc-900/60 border-zinc-800 focus-visible:ring-violet-500/40"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagramUrl" className="flex items-center gap-2 text-sm text-zinc-400">
          <Link2 className="size-3.5" />
          Instagram URL
        </Label>
        <Input
          id="instagramUrl"
          placeholder="https://instagram.com/businessname"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          disabled={disabled}
          className="h-11 bg-zinc-900/60 border-zinc-800 focus-visible:ring-violet-500/40"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="websiteUrl" className="flex items-center gap-2 text-sm text-zinc-400">
          <Globe className="size-3.5" />
          Website URL
        </Label>
        <Input
          id="websiteUrl"
          placeholder="https://businessname.com"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          disabled={disabled}
          className="h-11 bg-zinc-900/60 border-zinc-800 focus-visible:ring-violet-500/40"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2 text-sm text-zinc-400">
          <NotebookPen className="size-3.5" />
          Business Notes <span className="text-zinc-600">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          placeholder="Anything you already know — products, location, what they mentioned, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={disabled}
          rows={3}
          className="bg-zinc-900/60 border-zinc-800 focus-visible:ring-violet-500/40 resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={!canSubmit || disabled}
        size="lg"
        className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white font-medium tracking-wide disabled:opacity-40"
      >
        <Sparkles className="size-4" />
        ANALYZE OPPORTUNITY
      </Button>

      {!canSubmit && (
        <p className="text-center text-xs text-zinc-600">
          Enter at least one link or a business note to continue.
        </p>
      )}
    </motion.form>
  );
}
