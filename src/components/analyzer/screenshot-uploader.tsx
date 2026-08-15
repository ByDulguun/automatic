"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  ACCEPTED_SCREENSHOT_TYPES,
  MAX_SCREENSHOTS,
  MAX_SCREENSHOT_BYTES,
  isAcceptedScreenshotType,
} from "@/lib/screenshot-constraints";

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
};

export function ScreenshotUploader({ files, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const incoming = Array.from(fileList);

    const invalidType = incoming.find((file) => !isAcceptedScreenshotType(file.type));
    if (invalidType) {
      setError(`"${invalidType.name}" is not a supported image type. Use PNG, JPG, JPEG, or WEBP.`);
      return;
    }

    const tooLarge = incoming.find((file) => file.size > MAX_SCREENSHOT_BYTES);
    if (tooLarge) {
      setError(
        `"${tooLarge.name}" is larger than ${Math.round(MAX_SCREENSHOT_BYTES / (1024 * 1024))}MB.`
      );
      return;
    }

    const combined = [...files, ...incoming];
    if (combined.length > MAX_SCREENSHOTS) {
      setError(`You can upload up to ${MAX_SCREENSHOTS} screenshots (${combined.length} selected).`);
      return;
    }

    onChange(combined);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, i) => i !== index));
    setError(null);
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_SCREENSHOT_TYPES.join(",")}
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || files.length >= MAX_SCREENSHOTS}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-6 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-40"
      >
        <ImagePlus className="size-4" />
        Upload screenshots ({files.length}/{MAX_SCREENSHOTS})
      </button>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
            >
              {previews[index] && (
                // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimizable remote asset
                <img
                  src={previews[index]}
                  alt={file.name}
                  className="h-full w-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={disabled}
                className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                aria-label={`Remove ${file.name}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
