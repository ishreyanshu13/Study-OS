import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Calculator as CalculatorIcon, 
  Timer, 
  BarChart2, 
  Database, 
  Settings as SettingsIcon,
  LogOut,
  Search
} from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const logout = useLogout();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/login")
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/syllabus", label: "Syllabus", icon: BookOpen },
    { href: "/progress", label: "Progress", icon: TrendingUp },
    { href: "/calendar", label: "Calendar", icon: CalendarIcon },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/calculator", label: "Calculator", icon: CalculatorIcon },
    { href: "/focus", label: "Focus Timer", icon: Timer },
    { href: "/statistics", label: "Statistics", icon: BarChart2 },
    { href: "/backup", label: "Backup & Restore", icon: Database },
    { href: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-sidebar border-r border-sidebar-border flex flex-col text-sidebar-foreground flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border font-bold text-lg tracking-tight">
          <Link href="/dashboard" className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs">S</span>
            </div>
            StudyOS
          </Link>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const active = location === item.href;
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
                      active 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center w-full max-w-md bg-muted/50 rounded-md px-3 py-1.5 border border-border/50 focus-within:border-primary/50 transition-colors">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/focus" className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors cursor-pointer group">
              <div className="text-right leading-tight">
                <div className="text-foreground">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-muted-foreground text-xs font-normal">{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              </div>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors p-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-background/50">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
