import React from "react";
import { useGetStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer, CheckSquare, TrendingUp, Flame } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetStats();

  if (isLoading) return <div>Loading dashboard...</div>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's your overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Study</CardTitle>
            <Timer className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(stats.todayMinutes / 60)}h {stats.todayMinutes % 60}m</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalSessions} sessions completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Today</CardTitle>
            <CheckSquare className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTodayTasks} / {stats.todayTasks}</div>
            <Progress value={stats.todayTasks > 0 ? (stats.completedTodayTasks / stats.todayTasks) * 100 : 0} className="h-1 mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.overallProgress)}%</div>
            <Progress value={stats.overallProgress} className="h-1 mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
            <Flame className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak} Days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {stats.bestStreak} days
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.subjectProgress?.map(sub => (
                  <div key={sub.subjectId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{sub.subjectName}</span>
                      <span className="text-muted-foreground">{Math.round(sub.percentage)}%</span>
                    </div>
                    <Progress value={sub.percentage} className="h-2" style={{ "--tw-progress-fill": sub.color } as any} />
                  </div>
                )) || <div className="text-sm text-muted-foreground">No subjects found.</div>}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.upcomingEvents && stats.upcomingEvents.length > 0 ? (
                  stats.upcomingEvents.map(event => (
                    <div key={event.id} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: event.color }}></div>
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming events.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
