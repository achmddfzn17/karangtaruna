"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link2,
  Link2Off,
  Code,
  RemoveFormatting,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Toolbar button ────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={isActive ? "true" : "false"}
      className={cn(
        "inline-flex items-center justify-center h-7 w-7 rounded-md text-sm transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// ─── Toolbar divider ───────────────────────────────────────────────────────

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-0.5 self-center" />;
}

// ─── Toolbar ───────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = React.useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL tautan:", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex items-center gap-0.5 flex-wrap p-2 border-b border-border bg-muted/40 rounded-t-lg">
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Judul 1 (H1)"
      >
        <Heading1 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Judul 2 (H2)"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text marks */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Tebal (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Miring (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Garis bawah (Ctrl+U)"
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Coret"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Daftar poin"
      >
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Daftar bernomor"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Code block */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Blok kode"
      >
        <Code className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Link */}
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive("link")}
        title="Tambah tautan"
      >
        <Link2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      {editor.isActive("link") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Hapus tautan"
        >
          <Link2Off className="h-3.5 w-3.5" />
        </ToolbarButton>
      )}

      <ToolbarDivider />

      {/* Clear formatting */}
      <ToolbarButton
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
        title="Hapus pemformatan"
      >
        <RemoveFormatting className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}

// ─── Rich text editor ──────────────────────────────────────────────────────

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeightClass?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis sesuatu...",
  disabled = false,
  className,
  minHeightClass = "min-h-[200px]",
  label,
  error,
  helperText,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 hover:opacity-80",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    ],
    content: value ?? "",
    editable: !disabled,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none w-full outline-none",
          "px-4 py-3 text-foreground",
          "prose-headings:text-foreground prose-headings:font-semibold",
          "prose-p:text-foreground prose-p:leading-relaxed",
          "prose-strong:text-foreground",
          "prose-code:text-primary prose-code:bg-muted prose-code:rounded prose-code:px-1",
          "prose-pre:bg-muted prose-pre:text-foreground prose-pre:rounded-lg",
          "prose-ul:text-foreground prose-ol:text-foreground",
          "prose-a:text-primary",
          disabled && "opacity-60 cursor-not-allowed",
        ),
      },
    },
  });

  // Sync external value changes (e.g. from react-hook-form reset)
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== undefined && value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <div
        className={cn(
          "rounded-lg border border-input bg-background overflow-hidden transition-colors duration-150 relative",
          "focus-within:ring-2 focus-within:ring-ring focus-within:border-primary",
          error && "border-destructive focus-within:ring-destructive/30",
          disabled && "opacity-60 cursor-not-allowed",
        )}
      >
        {editor && !disabled && <Toolbar editor={editor} />}

        <div className={minHeightClass}>
          {editor ? (
            <EditorContent editor={editor} className={minHeightClass} />
          ) : (
            <div
              className={cn("px-4 py-3 text-sm text-muted-foreground", minHeightClass)}
            >
              {placeholder}
            </div>
          )}
        </div>

        {!editor?.getText()?.trim() && editor && (
          <div
            className="absolute top-0 pointer-events-none px-4 py-3 text-sm text-muted-foreground select-none"
          >
            {placeholder}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
