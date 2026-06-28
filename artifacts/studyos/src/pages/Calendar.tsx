import React, { useState } from "react";
import {
  useListEvents, useCreateEvent, useDeleteEvent,
  getListEventsQueryKey, CalendarEventInputType,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, Trash2, X, CalendarDays } from "lucide-react";

const EVENT_COLORS = ["#3b82f6","#10b981","#ef4444","#f59e0b","#8b5cf6","#ec4899"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const EVENT_TYPES: { value: CalendarEventInputType; label: string }[] = [
  { value: "exam", label: "Exam" },
  { value: "event", label: "Event" },
  { value: "reminder", label: "Reminder" },
  { value: "holiday", label: "Holiday" },
];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<CalendarEventInputType>("event");
  const [newColor, setNewColor] = useState(EVENT_COLORS[0]!);
  const [newNotes, setNewNotes] = useState("");

  const queryClient = useQueryClient();
  const { data: events = [] } = useListEvents({ month, year });
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListEventsQueryKey({ month, year }) });

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (day: number) =>
    events.filter((e: any) => {
      const d = new Date(e.date);
      return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
    });

  const selectedEvents = selectedDay ? eventsForDay(selectedDay) : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !selectedDay) return;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    createEvent.mutate({
      data: {
        title: newTitle.trim(),
        date: dateStr,
        type: newType,
        color: newColor,
        notes: newNotes.trim() || undefined,
      }
    }, {
      onSuccess: () => {
        setNewTitle("");
        setNewNotes("");
        setShowForm(false);
        invalidate();
      }
    });
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1">Track exams, assignments, and study sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 rounded hover:bg-muted">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="font-bold text-lg">{MONTHS[month - 1]} {year}</h2>
                <button onClick={nextMonth} className="p-1.5 rounded hover:bg-muted">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`empty-${idx}`} />;
                  const dayEvents = eventsForDay(day);
                  const selected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => { setSelectedDay(day === selectedDay ? null : day); setShowForm(false); }}
                      className={`relative flex flex-col items-center p-1.5 rounded-lg min-h-[52px] transition-colors text-sm font-medium
                        ${isToday(day) ? "ring-2 ring-primary" : ""}
                        ${selected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                      `}
                    >
                      <span className="leading-none">{day}</span>
                      {dayEvents.length > 0 && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {dayEvents.slice(0, 3).map((ev: any, i: number) => (
                            <span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: selected ? "white" : (ev.color ?? "#3b82f6") }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedDay ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">
                  {MONTHS[month - 1]!.slice(0, 3)} {selectedDay}
                </h3>
                <Button size="sm" onClick={() => setShowForm(v => !v)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {showForm && (
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <form onSubmit={handleCreate} className="space-y-3">
                      <Input
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Event title..."
                        autoFocus
                        className="text-sm"
                      />
                      <select
                        value={newType}
                        onChange={e => setNewType(e.target.value as CalendarEventInputType)}
                        className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                      >
                        {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <Input
                        value={newNotes}
                        onChange={e => setNewNotes(e.target.value)}
                        placeholder="Notes (optional)"
                        className="text-sm"
                      />
                      <div className="flex gap-1.5">
                        {EVENT_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewColor(c)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${newColor === c ? "border-foreground scale-110" : "border-transparent"}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="flex-1" disabled={!newTitle.trim() || createEvent.isPending}>Save</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {selectedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events. Click "Add" to create one.</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((ev: any) => (
                    <Card key={ev.id}>
                      <div className="flex items-start gap-3 p-3">
                        <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: ev.color ?? "#3b82f6" }} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{ev.title}</div>
                          <div className="text-xs text-muted-foreground capitalize">{ev.type}</div>
                          {ev.notes && <div className="text-xs text-muted-foreground mt-1">{ev.notes}</div>}
                        </div>
                        <button
                          onClick={() => deleteEvent.mutate({ id: ev.id }, { onSuccess: invalidate })}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <CalendarDays className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Click a day to view or add events.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
