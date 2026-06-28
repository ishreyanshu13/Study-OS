import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Plus, Trash2, Pencil, Check, X, ChevronDown, ChevronRight } from "lucide-react";

interface Chapter {
  id: string;
  name: string;
  completed: boolean;
}

interface Subject {
  id: string;
  name: string;
  totalChapters: number;
  chapters: Chapter[];
  expanded: boolean;
}

interface SectionData {
  subjects: Subject[];
}

type SectionKey = "school" | "online" | "selfstudy";

const SECTION_LABELS: Record<SectionKey, string> = {
  school: "School",
  online: "Online Class",
  selfstudy: "Self Study",
};

const SECTION_COLORS: Record<SectionKey, string> = {
  school: "text-blue-500",
  online: "text-purple-500",
  selfstudy: "text-emerald-500",
};

const STORAGE_KEY = "studyos_progress_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadData(): Record<SectionKey, SectionData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { school: { subjects: [] }, online: { subjects: [] }, selfstudy: { subjects: [] } };
}

function saveData(data: Record<SectionKey, SectionData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function SectionPanel({ sectionKey, data, onChange }: {
  sectionKey: SectionKey;
  data: SectionData;
  onChange: (d: SectionData) => void;
}) {
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectTotal, setNewSubjectTotal] = useState("0");

  const subjects = data.subjects;

  const totalChapters = subjects.reduce((s, sub) => s + sub.totalChapters, 0);
  const completedChapters = subjects.reduce((s, sub) => s + sub.chapters.filter(c => c.completed).length, 0);
  const pct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const update = (newSubjects: Subject[]) => onChange({ subjects: newSubjects });

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const total = parseInt(newSubjectTotal) || 0;
    const chapters: Chapter[] = Array.from({ length: total }, (_, i) => ({
      id: uid(),
      name: `Chapter ${i + 1}`,
      completed: false,
    }));
    update([...subjects, { id: uid(), name: newSubjectName.trim(), totalChapters: total, chapters, expanded: true }]);
    setNewSubjectName("");
    setNewSubjectTotal("0");
    setAddingSubject(false);
  };

  const deleteSubject = (id: string) => update(subjects.filter(s => s.id !== id));

  const toggleExpand = (id: string) =>
    update(subjects.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));

  const toggleChapter = (subId: string, chId: string, completed: boolean) =>
    update(subjects.map(s =>
      s.id === subId
        ? { ...s, chapters: s.chapters.map(c => c.id === chId ? { ...c, completed } : c) }
        : s
    ));

  const updateChapterName = (subId: string, chId: string, name: string) =>
    update(subjects.map(s =>
      s.id === subId
        ? { ...s, chapters: s.chapters.map(c => c.id === chId ? { ...c, name } : c) }
        : s
    ));

  const updateTotalChapters = (subId: string, newTotal: number) => {
    update(subjects.map(s => {
      if (s.id !== subId) return s;
      const current = s.chapters;
      let chapters = [...current];
      if (newTotal > current.length) {
        for (let i = current.length; i < newTotal; i++) {
          chapters.push({ id: uid(), name: `Chapter ${i + 1}`, completed: false });
        }
      } else {
        chapters = chapters.slice(0, newTotal);
      }
      return { ...s, totalChapters: newTotal, chapters };
    }));
  };

  const addChapterToSubject = (subId: string) => {
    update(subjects.map(s => {
      if (s.id !== subId) return s;
      const newCh: Chapter = { id: uid(), name: `Chapter ${s.chapters.length + 1}`, completed: false };
      return { ...s, totalChapters: s.totalChapters + 1, chapters: [...s.chapters, newCh] };
    }));
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className={`text-lg flex items-center justify-between ${SECTION_COLORS[sectionKey]}`}>
          <span>{SECTION_LABELS[sectionKey]}</span>
          <span className="text-2xl font-bold">{pct}%</span>
        </CardTitle>
        <div className="mt-2">
          <ProgressBar value={pct} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{completedChapters} / {totalChapters} chapters completed</p>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col gap-3">
        {subjects.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No subjects yet. Add one below.</p>
        )}

        {subjects.map(sub => {
          const subCompleted = sub.chapters.filter(c => c.completed).length;
          const subPct = sub.totalChapters > 0 ? Math.round((subCompleted / sub.totalChapters) * 100) : 0;

          return (
            <div key={sub.id} className="border rounded-lg overflow-hidden">
              <div
                className="flex items-center gap-2 px-3 py-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpand(sub.id)}
              >
                {sub.expanded
                  ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                  : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{sub.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <ProgressBar value={subPct} className="h-1 flex-1" />
                    <span className="text-xs text-muted-foreground shrink-0">{subCompleted}/{sub.totalChapters}</span>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteSubject(sub.id); }}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {sub.expanded && (
                <div className="px-3 py-2 space-y-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">Total chapters:</span>
                    <input
                      type="number"
                      min={0}
                      value={sub.totalChapters}
                      onChange={e => updateTotalChapters(sub.id, parseInt(e.target.value) || 0)}
                      onClick={e => e.stopPropagation()}
                      className="w-16 h-6 text-xs border rounded px-2 bg-background"
                    />
                  </div>

                  {sub.chapters.map((ch, idx) => (
                    <div key={ch.id} className="flex items-center gap-2 py-0.5 group">
                      <Checkbox
                        checked={ch.completed}
                        onCheckedChange={v => toggleChapter(sub.id, ch.id, v as boolean)}
                        className="w-4 h-4"
                      />
                      <input
                        value={ch.name}
                        onChange={e => updateChapterName(sub.id, ch.id, e.target.value)}
                        className={`flex-1 text-sm bg-transparent border-none outline-none ${ch.completed ? "line-through text-muted-foreground" : ""}`}
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => addChapterToSubject(sub.id)}
                    className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add chapter
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-auto pt-2">
          {addingSubject ? (
            <div className="flex flex-col gap-2 border rounded-lg p-3 bg-muted/20">
              <Input
                value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                placeholder="Subject name..."
                className="h-8 text-sm"
                autoFocus
                onKeyDown={e => { if (e.key === "Enter") addSubject(); if (e.key === "Escape") setAddingSubject(false); }}
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">Total chapters:</span>
                <Input
                  type="number"
                  min={0}
                  value={newSubjectTotal}
                  onChange={e => setNewSubjectTotal(e.target.value)}
                  className="h-7 w-20 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs flex-1" onClick={addSubject} disabled={!newSubjectName.trim()}>
                  <Check className="w-3 h-3 mr-1" /> Add
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingSubject(false)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => setAddingSubject(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Subject
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Progress() {
  const [data, setData] = useState<Record<SectionKey, SectionData>>(() => loadData());

  useEffect(() => { saveData(data); }, [data]);

  const updateSection = (key: SectionKey, section: SectionData) =>
    setData(d => ({ ...d, [key]: section }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress Tracker</h1>
        <p className="text-muted-foreground mt-1">Track chapters across School, Online Class, and Self Study.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {(["school", "online", "selfstudy"] as SectionKey[]).map(key => (
          <SectionPanel
            key={key}
            sectionKey={key}
            data={data[key]}
            onChange={d => updateSection(key, d)}
          />
        ))}
      </div>
    </div>
  );
}
