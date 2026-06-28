import React, { useState } from "react";
import { useListTasks, useCreateTask, useUpdateTask, useDeleteTask, getListTasksQueryKey, TaskType, TaskPriority } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, AlertCircle, Clock } from "lucide-react";

export default function Tasks() {
  const [activeTab, setActiveTab] = useState<TaskType>("daily");
  const { data: tasks, isLoading } = useListTasks({ type: activeTab });
  const [newTaskTitle, setNewTaskTitle] = useState("");
  
  const queryClient = useQueryClient();
  
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createTask.mutate({
      data: {
        title: newTaskTitle,
        type: activeTab,
        priority: "medium",
        completed: false
      }
    }, {
      onSuccess: () => {
        setNewTaskTitle("");
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({ type: activeTab }) });
      }
    });
  };

  const handleToggle = (id: number, completed: boolean) => {
    updateTask.mutate({
      id,
      data: { completed }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({ type: activeTab }) });
      }
    });
  };

  const handleDelete = (id: number) => {
    deleteTask.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey({ type: activeTab }) });
      }
    });
  };

  const priorityColors = {
    low: "text-muted-foreground bg-muted",
    medium: "text-blue-500 bg-blue-500/10",
    high: "text-red-500 bg-red-500/10"
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">To-Do</h1>
        <p className="text-muted-foreground mt-1">Manage your study tasks.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TaskType)} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleCreate} className="flex gap-2 mb-6">
          <Input 
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-card"
          />
          <Button type="submit" disabled={!newTaskTitle.trim() || createTask.isPending}>
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </form>

        <div className="space-y-3">
          {isLoading ? (
            <div>Loading tasks...</div>
          ) : tasks?.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6 text-center text-muted-foreground flex flex-col items-center">
                <CheckSquare className="w-8 h-8 mb-2 opacity-20" />
                <p>No {activeTab} tasks yet.</p>
              </CardContent>
            </Card>
          ) : (
            tasks?.map(task => (
              <Card key={task.id} className={`transition-all ${task.completed ? 'opacity-60 bg-muted/50' : 'bg-card'}`}>
                <div className="flex items-center p-4 gap-4">
                  <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={(checked) => handleToggle(task.id, checked as boolean)} 
                    className="w-5 h-5"
                  />
                  <div className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}

// Temporary icon component for the empty state
function CheckSquare(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>;
}
