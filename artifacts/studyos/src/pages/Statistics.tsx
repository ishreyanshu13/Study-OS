import React, { useState } from "react";
import {
  useGetStats, useListSessions, useListSubjects,
  getListSessionsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Clock, Flame, TrendingUp, Calendar } from "lucide-react";

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6","#f97316"];

function fmtMins(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function Statistics() {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const { data: stats } = useGetStats();
  const { data: sessions = [] } = useListSessions({ period: "week" });
  const { data: subjects = [] } = useListSubjects();

  const weekBarData = (() => {
    const now = new Date();
    const days: { day: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const label = DAYS[d.getDay()]!;
      const dayStr = d.toISOString().slice(0, 10);
      const minutes = (sessions as any[])
        .filter((s: any) => s.completedAt && s.completedAt.slice(0, 10) === dayStr)
        .reduce((acc: number, s: any) => acc + (s.durationMinutes ?? 0), 0);
      days.push({ day: label, minutes });
    }
    return days;
  })();

  const subjectPieData = (stats?.subjectProgress ?? [])
    .filter((sp: any) => sp.completedHours > 0 || sp.totalHours > 0)
    .map((sp: any) => ({
      name: sp.subjectName,
      value: sp.totalHours,
      color: sp.color,
    }));

  const progressData = (stats?.subjectProgress ?? []).map((sp: any) => ({
    name: sp.subjectName,
    completed: sp.completedHours,
    remaining: Math.max(0, sp.totalHours - sp.completedHours),
    pct: sp.percentage,
    color: sp.color,
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground mt-1">Your study data at a glance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today", value: fmtMins(stats?.todayMinutes ?? 0), icon: Clock, color: "text-blue-500" },
          { label: "This Week", value: fmtMins(stats?.weekMinutes ?? 0), icon: Calendar, color: "text-green-500" },
          { label: "This Month", value: fmtMins(stats?.monthMinutes ?? 0), icon: TrendingUp, color: "text-purple-500" },
          { label: "Streak", value: `${stats?.currentStreak ?? 0} days`, icon: Flame, color: "text-orange-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-lg font-bold leading-tight">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Study Minutes — Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => [`${v} min`, "Study"]} />
                <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Syllabus Distribution (Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectPieData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Add subjects and chapters to see distribution.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={subjectPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {subjectPieData.map((entry: any, index: number) => (
                      <Cell key={index} fill={entry.color ?? COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v}h`, "Total Hours"]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Subject Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {progressData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No subjects yet. Add subjects in the Syllabus page.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(160, progressData.length * 48)}>
              <BarChart
                layout="vertical"
                data={progressData}
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              >
                <XAxis type="number" tick={{ fontSize: 11 }} unit="h" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip
                  formatter={(v: any, name: string) => [`${v}h`, name === "completed" ? "Completed" : "Remaining"]}
                />
                <Bar dataKey="completed" stackId="a" radius={[0, 0, 0, 0]}>
                  {progressData.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color ?? COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Overall Progress", value: `${stats?.overallProgress ?? 0}%`, sub: "of syllabus complete" },
          { label: "Total XP", value: stats?.xp ?? 0, sub: `Level ${stats?.level ?? 1}` },
          { label: "Best Streak", value: `${stats?.bestStreak ?? 0} days`, sub: "all time" },
        ].map(({ label, value, sub }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-5 text-center">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm font-medium mt-1">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
