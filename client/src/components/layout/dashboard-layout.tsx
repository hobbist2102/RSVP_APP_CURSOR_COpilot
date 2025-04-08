import React, { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { data: currentEvent } = useQuery({
    queryKey: ['/api/events/1'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const eventData = currentEvent ? {
    title: currentEvent.title,
    date: formatDate(currentEvent.date)
  } : undefined;
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Create an overlay that closes the sidebar when clicked (on mobile)
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleSidebar={toggleSidebar} currentEvent={eventData} />
      
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} />
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-[5] bg-black/50 lg:hidden"
            onClick={handleOverlayClick}
          />
        )}
        
        <main className="flex-1 overflow-y-auto bg-accent p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
