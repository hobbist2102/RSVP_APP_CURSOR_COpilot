import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { post } from "@/lib/api-utils";


interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "couple";
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Add session ID manually to requests if available
        const sessionCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('connect.sid='));
        
        const response = await fetch("/api/auth/user", {
          credentials: "include",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await post("/api/auth/login", { username, password });
      
      setUser(response.data.user);
      
      // Force a page reload to ensure cookies are properly set
      window.location.href = "/dashboard";
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.data.user.name}!`,
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await post("/api/auth/logout", {});
      setUser(null);
      
      // Redirect to auth page
      setLocation("/auth");
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
