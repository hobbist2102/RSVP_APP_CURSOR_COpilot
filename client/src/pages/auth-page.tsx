import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to dashboard if already logged in
  React.useEffect(() => {
    if (user && !isLoading) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Hero section (right side) */}
      <div className="w-0 md:w-1/2 lg:w-2/3 bg-gradient-to-r from-purple-800 via-purple-900 to-indigo-900 hidden md:flex md:flex-col md:justify-center md:items-center text-white p-10">
        <div className="max-w-2xl text-center">
          <h1 className="font-script text-5xl mb-6">Eternally Yours</h1>
          <h2 className="font-playfair text-3xl mb-6">Wedding Management Suite</h2>
          <p className="text-xl mb-8">
            Manage your Indian wedding events with ease. From guest lists to ceremonies, 
            accommodations to meal preferences - all in one beautiful platform.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="text-4xl font-bold mb-2">300+</div>
              <div className="text-sm">Guests Managed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-sm">Ceremonies</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-sm">Stress Reduction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth forms (left side) */}
      <div className="w-full md:w-1/2 lg:w-1/3 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-script text-5xl text-primary mb-2">Eternally Yours</h1>
            <p className="font-playfair text-neutral text-xl">Wedding Management Suite</p>
          </div>
          
          <div className="flex flex-col items-center justify-center space-y-6">
            <p className="text-center text-gray-600">
              Sign in to manage your wedding events, track RSVPs, and more!
            </p>
            
            <a 
              href="/api/login" 
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign in with Replit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}