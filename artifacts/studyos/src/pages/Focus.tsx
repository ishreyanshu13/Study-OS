import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateSession, useGetSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { Timer, Coffee, RefreshCw } from "lucide-react";

type Mode = "focus" | "short" | "long";

export default function Focus() {
  const { data: settings } = useGetSettings({ query: { queryKey: getGetSettingsQueryKey() } });
  const focusDuration = (settings?.pomodoroMinutes ?? 25) * 60;
  const shortBreak = (settings?.shortBreakMinutes ?? 5) * 60;
  const longBreak = (settings?.longBreakMinutes ?? 15) * 60;

  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(focusDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const createSession = useCreateSession();

  const getDuration = useCallback((m: Mode) => {
    if (m === "focus") return focusDuration;
    if (m === "short") return shortBreak;
    return longBreak;
  }, [focusDuration, shortBreak, longBreak]);

  useEffect(() => {
    setTimeLeft(getDuration(mode));
    setIsRunning(false);
  }, [mode, getDuration]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsRunning(false);
          if (mode === "focus") {
            const mins = Math.round(focusDuration / 60);
            createSession.mutate({ data: { durationMinutes: mins, sessionType: "pomodoro" } });
            setSessions(s => s + 1);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, mode, focusDuration, createSession]);

  const reset = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const switchMode = (m: Mode) => {
    setMode(m);
  };

  const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const s = (timeLeft % 60).toString().padStart(2, "0");
  const total = getDuration(mode);
  const progress = total > 0 ? ((total - timeLeft) / total) * 100 : 0;

  const modeConfig = {
    focus: { label: "Focus", color: "text-blue-500", ring: "stroke-blue-500" },
    short: { label: "Short Break", color: "text-green-500", ring: "stroke-green-500" },
    long: { label: "Long Break", color: "text-purple-500", ring: "stroke-purple-500" },
  };
  const { label, color, ring } = modeConfig[mode];

  const circumference = 2 * Math.PI * 110;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Focus Timer</h1>
        <p className="text-muted-foreground mt-1">Stay in the zone. Sessions auto-save.</p>
      </div>

      <div className="flex gap-2">
        {(["focus", "short", "long"] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border
              ${mode === m ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
          >
            {m === "focus" ? "Focus" : m === "short" ? "Short Break" : "Long Break"}
          </button>
        ))}
      </div>

      <div className="relative flex items-center justify-center w-64 h-64">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="110" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
          <circle
            cx="120" cy="120" r="110"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={`transition-all duration-1000 ${ring}`}
          />
        </svg>
        <div className="text-center z-10">
          <div className={`text-6xl font-mono font-bold tracking-tighter tabular-nums ${color}`}>
            {m}:{s}
          </div>
          <div className="text-sm text-muted-foreground mt-1">{label}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          size="lg"
          onClick={() => setIsRunning(v => !v)}
          className="w-36 h-12 text-base"
          disabled={timeLeft === 0}
        >
          {isRunning ? "Pause" : timeLeft === 0 ? "Done!" : "Start"}
        </Button>
        <Button size="lg" variant="outline" onClick={reset} className="h-12 w-12 p-0">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {sessions > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Timer className="w-4 h-4 text-primary" />
          {sessions} session{sessions > 1 ? "s" : ""} completed today
        </div>
      )}

      <Card className="w-full">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold">{settings?.pomodoroMinutes ?? 25} min</div>
              <div className="text-muted-foreground text-xs flex items-center justify-center gap-1 mt-0.5">
                <Timer className="w-3 h-3" /> Focus
              </div>
            </div>
            <div>
              <div className="font-semibold">{settings?.shortBreakMinutes ?? 5} min</div>
              <div className="text-muted-foreground text-xs flex items-center justify-center gap-1 mt-0.5">
                <Coffee className="w-3 h-3" /> Short Break
              </div>
            </div>
            <div>
              <div className="font-semibold">{settings?.longBreakMinutes ?? 15} min</div>
              <div className="text-muted-foreground text-xs flex items-center justify-center gap-1 mt-0.5">
                <Coffee className="w-3 h-3" /> Long Break
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Change durations in <span className="text-primary">Settings</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
