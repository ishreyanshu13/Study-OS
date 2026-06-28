import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const login = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    login.mutate(
      { data },
      {
        onSuccess: () => {
          setLocation("/dashboard");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-sm p-8 bg-card border border-border/50 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground text-xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">StudyOS</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your master password</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Password" 
                      className="h-12 bg-background text-center text-lg tracking-widest focus-visible:ring-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={login.isPending}
            >
              {login.isPending ? "Unlocking..." : "Unlock"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
