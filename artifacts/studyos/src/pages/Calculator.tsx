import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowRight, Clock } from "lucide-react";

function diffDays(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function Calculator() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  const daysBetween = from && to ? diffDays(from, to) : null;
  const daysFromToday = to ? diffDays(today, to) : null;

  const abs = daysBetween !== null ? Math.abs(daysBetween) : null;
  const weeks = abs !== null ? Math.floor(abs / 7) : null;
  const remaining = abs !== null && weeks !== null ? abs - weeks * 7 : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Date Calculator</h1>
        <p className="text-muted-foreground mt-1">Find the number of days between two dates or days left until a deadline.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Select Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full space-y-1">
              <label className="text-sm font-medium text-muted-foreground">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full"
              />
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0 mt-5" />
            <div className="flex-1 w-full space-y-1">
              <label className="text-sm font-medium text-muted-foreground">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFromDate(new Date().toISOString().split("T")[0]!)}
            >
              Set From = Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFromDate(""); setToDate(""); }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {daysBetween !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
              <CalendarDays className="w-8 h-8 text-primary mb-3" />
              <p className="text-5xl font-bold text-primary">{abs}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Days</p>
              {weeks !== null && weeks > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {weeks} week{weeks !== 1 ? "s" : ""}{remaining! > 0 ? ` + ${remaining} day${remaining !== 1 ? "s" : ""}` : ""}
                </p>
              )}
              {daysBetween < 0 && (
                <span className="mt-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">In the past</span>
              )}
              {daysBetween > 0 && (
                <span className="mt-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">In the future</span>
              )}
              {daysBetween === 0 && (
                <span className="mt-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Same day</span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
              <Clock className="w-8 h-8 text-amber-500 mb-3" />
              <p className="text-5xl font-bold text-amber-500">{daysFromToday !== null ? Math.abs(daysFromToday) : "—"}</p>
              <p className="text-sm text-muted-foreground mt-1">Days from Today</p>
              {daysFromToday !== null && daysFromToday > 0 && (
                <span className="mt-2 text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">{daysFromToday} days left</span>
              )}
              {daysFromToday !== null && daysFromToday < 0 && (
                <span className="mt-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{Math.abs(daysFromToday)} days ago</span>
              )}
              {daysFromToday === 0 && (
                <span className="mt-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">That's today!</span>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!fromDate && !toDate && (
        <div className="text-center text-muted-foreground text-sm py-8">
          Pick two dates above to calculate the difference.
        </div>
      )}
    </div>
  );
}
