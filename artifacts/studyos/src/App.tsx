import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";

import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Syllabus from "@/pages/Syllabus";
import Progress from "@/pages/Progress";
import CalendarPage from "@/pages/Calendar";
import Tasks from "@/pages/Tasks";
import Calculator from "@/pages/Calculator";
import Focus from "@/pages/Focus";
import Statistics from "@/pages/Statistics";
import Achievements from "@/pages/Achievements";
import Backup from "@/pages/Backup";
import Settings from "@/pages/Settings";
import { useGetAuthStatus } from "@workspace/api-client-react";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: any }) {
  const { data: auth, isLoading } = useGetAuthStatus();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && auth && !auth.authenticated) {
      setLocation("/login");
    }
  }, [auth, isLoading, setLocation]);

  if (isLoading || !auth?.authenticated) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/syllabus" component={() => <ProtectedRoute component={Syllabus} />} />
      <Route path="/progress" component={() => <ProtectedRoute component={Progress} />} />
      <Route path="/calendar" component={() => <ProtectedRoute component={CalendarPage} />} />
      <Route path="/tasks" component={() => <ProtectedRoute component={Tasks} />} />
      <Route path="/calculator" component={() => <ProtectedRoute component={Calculator} />} />
      <Route path="/focus" component={() => <ProtectedRoute component={Focus} />} />
      <Route path="/statistics" component={() => <ProtectedRoute component={Statistics} />} />
      <Route path="/achievements" component={() => <ProtectedRoute component={Achievements} />} />
      <Route path="/backup" component={() => <ProtectedRoute component={Backup} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
