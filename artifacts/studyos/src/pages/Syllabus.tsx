import React, { useState } from "react";
import {
  useListSubjects, useCreateSubject, useDeleteSubject,
  useListChapters, useCreateChapter, useUpdateChapter, useDeleteChapter,
  getListSubjectsQueryKey, getListChaptersQueryKey,
  SubjectInputProgressType, ChapterUpdateStatus, ChapterInputStatus,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown, ChevronRight, Plus, Trash2, BookOpen, Check, Circle, Clock,
} from "lucide-react";

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316"];

const statusOptions: { value: ChapterUpdateStatus; label: string; color: string }[] = [
  { value: "not_started", label: "Not Started", color: "text-muted-foreground" },
  { value: "in_progress", label: "In Progress", color: "text-blue-500" },
  { value: "completed", label: "Completed", color: "text-green-500" },
  { value: "revision", label: "Revision", color: "text-amber-500" },
];

function ChapterRow({ chapter, subjectId }: { chapter: any; subjectId: number }) {
  const queryClient = useQueryClient();
  const updateChapter = useUpdateChapter();
  const deleteChapter = useDeleteChapter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(chapter.name);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListChaptersQueryKey(subjectId) });

  const updateStatus = (status: ChapterUpdateStatus) => {
    updateChapter.mutate({ subjectId, id: chapter.id, data: { status } }, { onSuccess: invalidate });
  };

  const saveEdit = () => {
    if (!name.trim()) return;
    updateChapter.mutate({ subjectId, id: chapter.id, data: { name: name.trim() } }, {
      onSuccess: () => { setEditing(false); invalidate(); }
    });
  };

  const currentStatus = statusOptions.find(s => s.value === chapter.status) ?? statusOptions[0]!;

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 group">
      <button
        onClick={() => {
          const next = chapter.status === "not_started" ? "in_progress"
            : chapter.status === "in_progress" ? "completed"
            : chapter.status === "completed" ? "revision"
            : "not_started";
          updateStatus(next as ChapterUpdateStatus);
        }}
        className={`shrink-0 ${currentStatus.color}`}
        title={currentStatus.label}
      >
        {chapter.status === "completed" ? <Check className="w-4 h-4" /> :
         chapter.status === "in_progress" ? <Clock className="w-4 h-4" /> :
         chapter.status === "revision" ? <Circle className="w-4 h-4 fill-amber-400" /> :
         <Circle className="w-4 h-4" />}
      </button>

      {editing ? (
        <form onSubmit={e => { e.preventDefault(); saveEdit(); }} className="flex-1 flex gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} autoFocus className="h-7 text-sm" />
          <Button size="sm" type="submit" className="h-7 text-xs">Save</Button>
          <Button size="sm" variant="ghost" type="button" className="h-7 text-xs" onClick={() => { setName(chapter.name); setEditing(false); }}>Cancel</Button>
        </form>
      ) : (
        <span
          className={`flex-1 text-sm cursor-pointer ${chapter.status === "completed" ? "line-through text-muted-foreground" : ""}`}
          onDoubleClick={() => setEditing(true)}
          title="Double-click to rename"
        >
          Ch. {chapter.chapterNumber}: {chapter.name}
        </span>
      )}

      <span className={`text-xs px-2 py-0.5 rounded-full bg-muted ${currentStatus.color} shrink-0`}>
        {currentStatus.label}
      </span>

      <button
        onClick={() => deleteChapter.mutate({ subjectId, id: chapter.id }, { onSuccess: invalidate })}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function SubjectCard({ subject }: { subject: any }) {
  const [expanded, setExpanded] = useState(false);
  const [addingChapter, setAddingChapter] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [chapterNum, setChapterNum] = useState("");
  const queryClient = useQueryClient();
  const { data: chapters = [], isLoading } = useListChapters(subject.id, { query: { queryKey: getListChaptersQueryKey(subject.id), enabled: expanded } });
  const createChapter = useCreateChapter();
  const deleteSubject = useDeleteSubject();

  const invalidateChapters = () => queryClient.invalidateQueries({ queryKey: getListChaptersQueryKey(subject.id) });
  const invalidateSubjects = () => queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() });

  const totalHours = chapters.reduce((s: number, c: any) => s + (c.estimatedHours ?? 0), 0);
  const completedHours = chapters.filter((c: any) => c.status === "completed").reduce((s: number, c: any) => s + (c.estimatedHours ?? 0), 0);
  const pct = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterName.trim()) return;
    createChapter.mutate({
      subjectId: subject.id,
      data: {
        name: chapterName.trim(),
        chapterNumber: parseInt(chapterNum) || (chapters.length + 1),
        status: "not_started" as ChapterInputStatus,
        estimatedHours: 1,
      }
    }, {
      onSuccess: () => {
        setChapterName("");
        setChapterNum("");
        setAddingChapter(false);
        invalidateChapters();
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-3 h-10 rounded-full shrink-0" style={{ backgroundColor: subject.color ?? "#3b82f6" }} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base truncate">{subject.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {subject.teacherName ? `${subject.teacherName} · ` : ""}{subject.progressType ?? "school"}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <Progress value={pct} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-right shrink-0 mr-2">
          <div>{chapters.length} chapters</div>
          <div>{completedHours}/{totalHours}h</div>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t bg-muted/20">
          <div className="p-3 space-y-0.5">
            {isLoading ? (
              <p className="text-sm text-muted-foreground p-2">Loading...</p>
            ) : chapters.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No chapters yet. Add one below.</p>
            ) : (
              chapters.map((ch: any) => <ChapterRow key={ch.id} chapter={ch} subjectId={subject.id} />)
            )}
          </div>

          <div className="px-3 pb-3 flex gap-2 border-t pt-3">
            {addingChapter ? (
              <form onSubmit={handleAddChapter} className="flex gap-2 flex-1">
                <Input
                  value={chapterNum}
                  onChange={e => setChapterNum(e.target.value)}
                  placeholder="No."
                  className="w-16 h-8 text-sm"
                  type="number"
                  min={1}
                />
                <Input
                  value={chapterName}
                  onChange={e => setChapterName(e.target.value)}
                  placeholder="Chapter name..."
                  className="flex-1 h-8 text-sm"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-8 text-xs" disabled={createChapter.isPending}>Add</Button>
                <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setAddingChapter(false)}>Cancel</Button>
              </form>
            ) : (
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setAddingChapter(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Chapter
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-destructive hover:text-destructive ml-auto"
              onClick={() => {
                if (confirm(`Delete "${subject.name}" and all its chapters?`)) {
                  deleteSubject.mutate({ id: subject.id }, { onSuccess: invalidateSubjects });
                }
              }}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Subject
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function Syllabus() {
  const { data: subjects = [], isLoading } = useListSubjects();
  const createSubject = useCreateSubject();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [progressType, setProgressType] = useState<SubjectInputProgressType>("school");
  const [colorIdx, setColorIdx] = useState(0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    createSubject.mutate({
      data: {
        name: subjectName.trim(),
        teacherName: teacher.trim() || undefined,
        color: COLORS[colorIdx % COLORS.length]!,
        progressType,
      }
    }, {
      onSuccess: () => {
        setSubjectName("");
        setTeacher("");
        setShowForm(false);
        queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Syllabus</h1>
          <p className="text-muted-foreground mt-1">Manage your subjects and chapters.</p>
        </div>
        <Button onClick={() => setShowForm(v => !v)}>
          <Plus className="w-4 h-4 mr-2" /> Add Subject
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Subject Name *</label>
                  <Input value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="e.g. Mathematics" autoFocus />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Teacher</label>
                  <Input value={teacher} onChange={e => setTeacher(e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={progressType}
                    onChange={e => setProgressType(e.target.value as SubjectInputProgressType)}
                    className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="school">School</option>
                    <option value="online">Online Class</option>
                    <option value="selfstudy">Self Study</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Color</label>
                  <div className="flex gap-2 mt-1">
                    {COLORS.map((c, i) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColorIdx(i)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${colorIdx === i ? "border-foreground scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={!subjectName.trim() || createSubject.isPending}>Create Subject</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-muted-foreground">Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-muted-foreground">
            <BookOpen className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-medium">No subjects yet</p>
            <p className="text-sm">Click "Add Subject" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {subjects.map((s: any) => <SubjectCard key={s.id} subject={s} />)}
        </div>
      )}
    </div>
  );
}
