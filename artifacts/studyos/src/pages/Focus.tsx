import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateSession } from "@workspace/api-client-react";

export default function Focus() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const createSession = useCreateSession();

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setIsRunning(false);
          createSession.mutate({ data: { durationMinutes: 25, sessionType: "pomodoro" } });
          return 25 * 60;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, createSession]);

  const toggle = () => setIsRunning(!isRunning);
  const reset = () => { setIsRunning(false); setTimeLeft(25 * 60); };

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="space-y-6 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-muted-foreground mb-12">Focus Session</h1>
        <div className="text-9xl font-mono font-bold tracking-tighter mb-12 tabular-nums">
          {m}:{s}
        </div>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={toggle} className="w-32 text-lg h-14">
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button size="lg" variant="outline" onClick={reset} className="w-32 text-lg h-14">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
