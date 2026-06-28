import React from "react";
import { useListAchievements } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Lock, Trophy, Zap, Star } from "lucide-react";

export default function Achievements() {
  const { data, isLoading } = useListAchievements();

  if (isLoading) return <div>Loading achievements...</div>;
  if (!data) return null;

  const nextLevelXp = (data.level + 1) * 1000;
  const progressPercent = (data.xp / nextLevelXp) * 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Achievements & Stats</h1>
        <p className="text-muted-foreground mt-1">Level up your study habits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground md:col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
            <Trophy className="w-64 h-64" />
          </div>
          <CardContent className="pt-6 flex flex-col justify-center h-full relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 text-2xl font-bold">
                {data.level}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Level {data.level} Scholar</h2>
                <p className="text-primary-foreground/80 font-mono text-sm">{data.xp} / {nextLevelXp} XP</p>
              </div>
            </div>
            <Progress value={progressPercent} className="h-2 bg-black/20" style={{ "--tw-progress-fill": "white" } as any} />
            <p className="text-sm mt-3 text-primary-foreground/80">
              {nextLevelXp - data.xp} XP until Level {data.level + 1}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">{data.currentStreak} Day Streak</h3>
            <p className="text-sm text-muted-foreground">Best streak: {data.bestStreak} days</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> 
          Badges Earned ({data.badges.filter(b => b.earned).length}/{data.badges.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.badges.map(badge => (
            <Card key={badge.id} className={`text-center transition-all ${badge.earned ? 'bg-card border-primary/20 shadow-md shadow-primary/5' : 'bg-muted/30 border-dashed opacity-60'}`}>
              <CardContent className="p-4 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${badge.earned ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {badge.earned ? <Star className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>
                <h4 className="font-semibold text-sm leading-tight mb-1">{badge.name}</h4>
                <p className="text-[10px] text-muted-foreground leading-tight">{badge.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold">All Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.achievements.map(ach => (
            <div key={ach.id} className={`flex items-start gap-4 p-4 rounded-lg border ${ach.earned ? 'bg-card border-border shadow-sm' : 'bg-muted/20 border-transparent'}`}>
              <div className={`mt-0.5 rounded-full p-2 ${ach.earned ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                {ach.earned ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <h4 className={`font-semibold ${ach.earned ? 'text-foreground' : 'text-muted-foreground'}`}>{ach.name}</h4>
                <p className="text-sm text-muted-foreground">{ach.description}</p>
                {ach.earned && ach.earnedAt && (
                  <p className="text-xs text-green-600/80 mt-1 font-medium">Earned {new Date(ach.earnedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Check(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;
}
