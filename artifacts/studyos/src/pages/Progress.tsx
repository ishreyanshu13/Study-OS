import React from "react";
import { useGetProgressStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";

export default function Progress() {
  const { data: stats, isLoading } = useGetProgressStats();

  if (isLoading) return <div>Loading progress...</div>;
  if (!stats) return null;

  const sections = [
    { title: "School", data: stats.school, color: "bg-blue-500" },
    { title: "Online Class", data: stats.online, color: "bg-purple-500" },
    { title: "Self-Study", data: stats.selfstudy, color: "bg-emerald-500" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress Tracker</h1>
        <p className="text-muted-foreground mt-1">Track your completion by estimated hours across categories.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map(section => (
          <Card key={section.title} className="flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center justify-between">
                {section.title}
                <span className="text-2xl font-bold text-primary">{Math.round(section.data.percentage)}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Hours</span>
                  <span className="font-medium">{section.data.completedHours} / {section.data.totalHours}</span>
                </div>
                <ProgressBar value={section.data.percentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground">Total Subjects</p>
                  <p className="text-lg font-semibold">{section.data.subjects?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chapters Completed</p>
                  <p className="text-lg font-semibold">{section.data.completedChapters} / {section.data.totalChapters}</p>
                </div>
              </div>

              {section.data.subjects && section.data.subjects.length > 0 && (
                <div className="mt-auto pt-4 space-y-3">
                  <p className="text-sm font-medium">Subjects</p>
                  {section.data.subjects.map(sub => (
                    <div key={sub.subjectId}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate pr-2">{sub.subjectName}</span>
                        <span>{Math.round(sub.percentage)}%</span>
                      </div>
                      <ProgressBar value={sub.percentage} className="h-1.5" style={{ "--tw-progress-fill": sub.color } as any} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
