"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Globe, NotebookPen, Sparkles, ChevronDown, Tag, ShoppingBag, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScreenshotUploader } from "@/components/analyzer/screenshot-uploader";
import type { AnalyzeInput } from "@/lib/schema";

type Props = {
  onSubmit: (input: AnalyzeInput, screenshots: File[]) => void;
  disabled?: boolean;
};

export function OpportunityForm({ onSubmit, disabled }: Props) {
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [showMore, setShowMore] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [whatTheySell, setWhatTheySell] = useState("");
  const [whatYouNotice, setWhatYouNotice] = useState("");
  const [screenshots, setScreenshots] = useState<File[]>([]);

  const canSubmit = Boolean(
    facebookUrl.trim() ||
      instagramUrl.trim() ||
      websiteUrl.trim() ||
      notes.trim() ||
      businessName.trim() ||
      whatTheySell.trim() ||
      whatYouNotice.trim() ||
      screenshots.length > 0
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || disabled) return;
    onSubmit(
      { facebookUrl, instagramUrl, websiteUrl, notes, businessName, whatTheySell, whatYouNotice },
      screenshots
    );
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

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          disabled={disabled}
          className="flex w-full items-center justify-between px-4 py-3 text-sm text-zinc-300 disabled:pointer-events-none"
        >
          <span>
            Add More Context <span className="text-zinc-600">(Optional)</span>
          </span>
          <ChevronDown
            className={`size-4 text-zinc-500 transition-transform ${showMore ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {showMore && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-5 border-t border-zinc-800 px-4 py-5">
                <p className="text-xs leading-relaxed text-zinc-500">
                  Since Facebook and Instagram can&apos;t be scraped automatically, anything you
                  saw while manually visiting their page makes the analysis sharper.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="businessName" className="flex items-center gap-2 text-sm text-zinc-400">
                    <Tag className="size-3.5" />
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    placeholder="Aringoo Jewelry"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    disabled={disabled}
                    className="h-11 bg-zinc-900/60 border-zinc-800 focus-visible:ring-violet-500/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatTheySell" className="flex items-center gap-2 text-sm text-zinc-400">
                    <ShoppingBag className="size-3.5" />
                    What does this business sell or offer?
                  </Label>
                  <Textarea
                    id="whatTheySell"
                    placeholder="Jewelry, rings, necklaces and accessories."
                    value={whatTheySell}
                    onChange={(e) => setWhatTheySell(e.target.value)}
                    disabled={disabled}
                    rows={2}
                    className="bg-zinc-900/60 border-zinc-800 focus-visible:ring-violet-500/40 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatYouNotice" className="flex items-center gap-2 text-sm text-zinc-400">
                    <Eye className="size-3.5" />
                    What do you notice about their current page?
                  </Label>
                  <Textarea
                    id="whatYouNotice"
                    placeholder="Mostly product photos. Visual style is inconsistent. No clear website or ordering system. Bio doesn't explain how to order."
                    value={whatYouNotice}
                    onChange={(e) => setWhatYouNotice(e.target.value)}
                    disabled={disabled}
                    rows={3}
                    className="bg-zinc-900/60 border-zinc-800 focus-visible:ring-violet-500/40 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-zinc-400">
                    Screenshots <span className="text-zinc-600">(Facebook, Instagram, posts, reels, website)</span>
                  </Label>
                  <ScreenshotUploader files={screenshots} onChange={setScreenshots} disabled={disabled} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
          Enter at least one link, some context, or a screenshot to continue.
        </p>
      )}
    </motion.form>
  );
}
