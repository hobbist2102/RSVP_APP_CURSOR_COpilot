import React, { useState, useEffect } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import EventSelector from "../event/event-selector";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get the current event from the cache (this will be set by EventSelector)
  const { data: currentEvent } = useQuery({
    queryKey: ['/api/current-event'],
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Fallback to event 1 if no current event is set
  useEffect(() => {
    if (!currentEvent) {
      // Fetch default event (we'll keep this as a fallback)
      const fetchEvent = async () => {
        try {
          const response = await fetch('/api/events/1');
          if (response.ok) {
            const data = await response.json();
            // This event data will be displayed in header
          }
        } catch (error) {
          console.error('Error fetching default event:', error);
        }
      };
      
      fetchEvent();
    }
  }, [currentEvent]);

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
