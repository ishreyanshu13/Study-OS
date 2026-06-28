import React, { useEffect, useState } from "react";
import {
  useGetSettings, useUpdateSettings, getGetSettingsQueryKey, SettingsInputTheme,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Moon, Sun, Monitor, Timer, Target, Palette } from "lucide-react";

function NumInput({
  label, value, onChange, min = 1, max = 9999, unit = "min",
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; unit?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
          className="w-20 h-8 text-sm text-right"
        />
        <span className="text-sm text-muted-foreground w-7">{unit}</span>
      </div>
    </div>
  );
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const [saved, setSaved] = useState(false);

  const [theme, setTheme] = useState<SettingsInputTheme>("system");
  const [dailyGoal, setDailyGoal] = useState(120);
  const [weeklyGoal, setWeeklyGoal] = useState(600);
  const [monthlyGoal, setMonthlyGoal] = useState(2400);
  const [pomodoroMins, setPomodoroMins] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [longBreak, setLongBreak] = useState(15);

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme as SettingsInputTheme ?? "system");
      setDailyGoal(settings.dailyGoalMinutes ?? 120);
      setWeeklyGoal(settings.weeklyGoalMinutes ?? 600);
      setMonthlyGoal(settings.monthlyGoalMinutes ?? 2400);
      setPomodoroMins(settings.pomodoroMinutes ?? 25);
      setShortBreak(settings.shortBreakMinutes ?? 5);
      setLongBreak(settings.longBreakMinutes ?? 15);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      data: {
        theme,
        dailyGoalMinutes: dailyGoal,
        weeklyGoalMinutes: weeklyGoal,
        monthlyGoalMinutes: monthlyGoal,
        pomodoroMinutes: pomodoroMins,
        shortBreakMinutes: shortBreak,
        longBreakMinutes: longBreak,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else if (theme === "light") {
          document.documentElement.classList.remove("dark");
        } else {
          if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      }
    });
  };

  if (isLoading) return <div className="text-muted-foreground">Loading settings...</div>;

  const themeOptions: { value: SettingsInputTheme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
    { value: "system", label: "System", icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your StudyOS experience.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Theme</label>
            <div className="flex gap-2">
              {themeOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${theme === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                    }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Study Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NumInput label="Daily Goal" value={dailyGoal} onChange={setDailyGoal} min={1} max={1440} />
          <NumInput label="Weekly Goal" value={weeklyGoal} onChange={setWeeklyGoal} min={1} max={10080} />
          <NumInput label="Monthly Goal" value={monthlyGoal} onChange={setMonthlyGoal} min={1} max={44640} />
          <p className="text-xs text-muted-foreground">Goals are used in the dashboard to track daily, weekly, and monthly study progress.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" /> Focus Timer (Pomodoro)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NumInput label="Focus Duration" value={pomodoroMins} onChange={setPomodoroMins} min={1} max={120} />
          <NumInput label="Short Break" value={shortBreak} onChange={setShortBreak} min={1} max={60} />
          <NumInput label="Long Break" value={longBreak} onChange={setLongBreak} min={1} max={60} />
          <p className="text-xs text-muted-foreground">Changes apply the next time you start a Focus session.</p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={updateSettings.isPending} className="px-8">
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
        {saved && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle2 className="w-4 h-4" /> Saved!
          </div>
        )}
      </div>
    </div>
  );
}
