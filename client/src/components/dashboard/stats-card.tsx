import React from "react";
import { 
  ArrowUp, 
  ArrowDown, 
  UserCheck, 
  UserX, 
  Watch, 
  Users 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  change?: {
    value: number;
    text: string;
  };
  icon: "confirmed" | "declined" | "pending" | "total";
  className?: string;
  onClick?: () => void;
}

export default function StatsCard({ title, value, change, icon, className, onClick }: StatsCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "confirmed":
        return <UserCheck className="text-lg" />;
      case "declined":
        return <UserX className="text-lg" />;
      case "pending":
        return <Watch className="text-lg" />;
      case "total":
        return <Users className="text-lg" />;
    }
  };

  const getIconClass = () => {
    switch (icon) {
      case "confirmed":
        return "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400";
      case "declined":
        return "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400";
      case "pending":
        return "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400";
      case "total":
        return "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400";
    }
  };

  const getChangeColor = () => {
    if (!change) return "";
    return change.value > 0 ? "text-green-600" : 
           change.value < 0 ? "text-red-600" : "text-gray-500";
  };

  return (
    <div 
      className={cn(
        "bg-card border border-border rounded-lg shadow-sm p-6 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md", 
        onClick && "cursor-pointer", 
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={cn("p-3 rounded-full", getIconClass())}>
          {getIcon()}
        </div>
        <div className="ml-5">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <h3 className="font-playfair text-2xl font-bold text-foreground">{value}</h3>
        </div>
      </div>

      {change && (
        <div className="mt-4">
          <div className="flex items-center">
            <span className={cn("text-sm font-medium flex items-center", getChangeColor())}>
              {change.value > 0 ? (
                <ArrowUp className="mr-1 h-4 w-4" />
              ) : change.value < 0 ? (
                <ArrowDown className="mr-1 h-4 w-4" />
              ) : null}
              {Math.abs(change.value)}%
            </span>
            <span className="text-muted-foreground text-sm ml-2">{change.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
