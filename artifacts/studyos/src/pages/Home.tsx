import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-border/50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm">S</span>
          </div>
          StudyOS
        </div>
        <Link href="/login">
          <Button variant="outline" className="font-medium">Sign In</Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto py-24">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          A premium cockpit <br/><span className="text-primary">for your studies.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Dense with useful information, impeccably organized, and designed for focus. Like a physical study desk brought to digital life.
        </p>
        
        <Link href="/login">
          <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            Open StudyOS
          </Button>
        </Link>

        <div className="mt-24 w-full aspect-video rounded-xl bg-card border border-border/50 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50"></div>
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            {/* Minimal visual placeholder for screenshots */}
            <div className="grid grid-cols-3 grid-rows-2 gap-4 w-3/4 h-3/4 opacity-20">
              <div className="col-span-2 row-span-2 bg-foreground rounded-lg"></div>
              <div className="bg-foreground rounded-lg"></div>
              <div className="bg-foreground rounded-lg"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
