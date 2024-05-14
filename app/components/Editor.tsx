"use client";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  BoldIcon,
  HighlighterIcon,
  Link2Icon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { ItalicIcon } from "lucide-react";
import Placeholder from "@tiptap/extension-placeholder";
import React from "react";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { useCallback } from "react";

function MenuBar() {
  const { editor } = useCurrentEditor();

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex gap-2 mb-4">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "flex gap-2  border items-center justify-center rounded-lg px-2 py-1",
          editor.isActive("bold") ? "bg-border" : ""
        )}
      >
        <BoldIcon />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "flex gap-2  border items-center justify-center rounded-lg px-2 py-1",
          editor.isActive("italic") ? "bg-border" : ""
        )}
      >
        <ItalicIcon />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "flex gap-2  border items-center justify-center rounded-lg px-2 py-1",
          editor.isActive("underline") ? "bg-border" : ""
        )}
      >
        <UnderlineIcon />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={cn(
          "flex gap-2  border items-center justify-center rounded-lg px-2 py-1",
          editor.isActive("highlight") ? "bg-border" : ""
        )}
      >
        <HighlighterIcon />
      </button>
      <button
        type="button"
        onClick={setLink}
        className={cn(
          "flex gap-2  border items-center justify-center rounded-lg px-2 py-1",
          editor.isActive("link") ? "bg-border" : ""
        )}
      >
        <Link2Icon />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          "flex gap-2  border items-center justify-center rounded-lg px-2 py-1",
          editor.isActive("strike") ? "bg-border" : ""
        )}
      >
        <StrikethroughIcon />
      </button>
    </div>
  );
}

export const RichTextEditor = ({
  content,
  setDescription,
}: {
  content: string;
  setDescription: (description: string) => void;
}) => {
  const extensions = [
    StarterKit,
    Underline,
    Highlight,
    Link.configure({
      openOnClick: true,
      autolink: true,
    }),
    Placeholder.configure({
      placeholder: "Write something …",
    }),
  ];

  useEffect(() => {
    const textInput = document.querySelector(".ProseMirror") as HTMLElement;

    if (textInput) {
      textInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          textInput.style.height = `${textInput.scrollHeight}px`;
        }
      });
    }
  }, []);

  return (
    <div>
      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={content}
        onUpdate={({ editor }) => setDescription(editor.getHTML())}
      >
        <></>
      </EditorProvider>
    </div>
  );
};
