import React, { useRef, useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Type, Save
} from "lucide-react";

const STORAGE_KEY = "studyos_syllabus_notes";

function ToolbarButton({ title, onClick, active, children }: {
  title: string; onClick: () => void; active?: boolean; children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`px-2 py-1.5 rounded transition-colors text-sm flex items-center gap-1 ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="w-px h-5 bg-border mx-1" />;
}

export default function Syllabus() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && editorRef.current) {
      editorRef.current.innerHTML = stored;
    }
  }, []);

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const setBlock = (tag: string) => exec("formatBlock", tag);

  const handleSave = () => {
    if (editorRef.current) {
      localStorage.setItem(STORAGE_KEY, editorRef.current.innerHTML);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      localStorage.setItem(STORAGE_KEY, editorRef.current.innerHTML);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Syllabus</h1>
          <p className="text-muted-foreground mt-1">Write and format your syllabus notes.</p>
        </div>
        <Button onClick={handleSave} size="sm" variant={saved ? "default" : "outline"} className="gap-1.5">
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save"}
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b bg-muted/30">
          <ToolbarButton title="Heading 1" onClick={() => setBlock("h1")}>
            <Type className="w-3.5 h-3.5" /><span className="text-xs font-bold">H1</span>
          </ToolbarButton>
          <ToolbarButton title="Heading 2" onClick={() => setBlock("h2")}>
            <Type className="w-3 h-3" /><span className="text-xs font-bold">H2</span>
          </ToolbarButton>
          <ToolbarButton title="Heading 3" onClick={() => setBlock("h3")}>
            <Type className="w-2.5 h-2.5" /><span className="text-xs font-bold">H3</span>
          </ToolbarButton>
          <ToolbarButton title="Normal text" onClick={() => setBlock("p")}>
            <span className="text-xs">Normal</span>
          </ToolbarButton>

          <Separator />

          <ToolbarButton title="Bold" onClick={() => exec("bold")}>
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Italic" onClick={() => exec("italic")}>
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Underline" onClick={() => exec("underline")}>
            <Underline className="w-4 h-4" />
          </ToolbarButton>

          <Separator />

          <ToolbarButton title="Align left" onClick={() => exec("justifyLeft")}>
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Align center" onClick={() => exec("justifyCenter")}>
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Align right" onClick={() => exec("justifyRight")}>
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>

          <Separator />

          <ToolbarButton title="Bullet list" onClick={() => exec("insertUnorderedList")}>
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton title="Numbered list" onClick={() => exec("insertOrderedList")}>
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>

        <CardContent className="p-0">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="min-h-[calc(100vh-320px)] p-6 outline-none text-foreground prose prose-sm max-w-none focus:outline-none
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-4
              [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3
              [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3
              [&_p]:mb-2 [&_p]:leading-relaxed
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
              [&_li]:mb-0.5"
            data-placeholder="Start typing your syllabus here... Use the toolbar to format text."
            style={{ caretColor: "var(--primary)" }}
          />
        </CardContent>
      </Card>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
