"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Tag } from "lucide-react";

interface TagsInputProps {
  name?: string;
  defaultTags?: string[];
  placeholder?: string;
}

export default function TagsInput({
  name = "tags",
  defaultTags = [],
  placeholder = "Ketik tag lalu tekan Enter...",
}: TagsInputProps) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (value: string) => {
    const trimmed = value.trim().toLowerCase().replace(/\s+/g, "-");
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags((prev) => [...prev, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
        <Tag className="w-3.5 h-3.5 text-slate-400" />
        Tags (Opsional)
      </label>

      {/* Hidden input untuk form submission */}
      <input type="hidden" name={name} value={JSON.stringify(tags)} />

      <div
        onClick={() => inputRef.current?.focus()}
        className="min-h-[48px] w-full px-3 py-2 rounded-xl border border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all cursor-text flex flex-wrap gap-2 items-center bg-white"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-[12px] font-bold rounded-lg"
          >
            #{tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              className="text-blue-400 hover:text-blue-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addTag(input)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none text-sm text-slate-800 bg-transparent placeholder:text-slate-400"
        />
      </div>
      <p className="text-[11px] text-slate-400">
        Tekan <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Enter</kbd> atau{" "}
        <kbd className="px-1 py-0.5 bg-slate-100 rounded text-[10px] font-mono">,</kbd> untuk menambah tag.
        Maks 10 tag.
      </p>
    </div>
  );
}
