import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["couple", "staff", "admin"], {
    required_error: "Please select a role",
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration successful",
        description: "Account created and logged in successfully.",
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  // Quick fill buttons for demo accounts
  const quickFillDemo = (type: 'couple' | 'planner' | 'couple2' | 'admin' | 'super') => {
    const demoData = {
      couple: {
        username: 'demo_couple',
        password: 'password123',
        name: 'Raj & Priya',
        email: 'couple@example.com',
        role: 'couple' as const
      },
      planner: {
        username: 'demo_planner',
        password: 'password123',
        name: 'Wedding Planner',
        email: 'planner@example.com',
        role: 'staff' as const
      },
      couple2: {
        username: 'demo_couple2',
        password: 'password123',
        name: 'Arjun & Nisha',
        email: 'couple2@example.com',
        role: 'couple' as const
      },
      admin: {
        username: 'demo_admin',
        password: 'password123',
        name: 'System Admin',
        email: 'admin2@example.com',
        role: 'admin' as const
      },
      super: {
        username: 'abhishek',
        password: 'password',
        name: 'Super Admin',
        email: 'admin@example.com',
        role: 'admin' as const
      }
    };

    const data = demoData[type];
    form.setValue('username', data.username);
    form.setValue('password', data.password);
    form.setValue('name', data.name);
    form.setValue('email', data.email);
    form.setValue('role', data.role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Register a new account for the wedding platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="staff">Staff/Planner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-2">
            <Label className="text-sm font-medium">Quick Fill Demo Accounts:</Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button variant="outline" size="sm" type="button" onClick={() => quickFillDemo('couple')}>
                Demo Couple
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => quickFillDemo('planner')}>
                Demo Planner
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => quickFillDemo('couple2')}>
                Demo Couple 2
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => quickFillDemo('admin')}>
                Demo Admin
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => quickFillDemo('super')}>
                Super Admin
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/login">
              <Button variant="link" className="text-sm">
                Already have an account? Sign in
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}