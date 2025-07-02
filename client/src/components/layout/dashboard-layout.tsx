import React, { useState } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import { formatDateForDisplay } from "@/lib/date-utils";
import EventSelector from "../event/event-selector";
import { useCurrentEvent } from "@/hooks/use-current-event";
import Footer from "./footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use our custom hook to get the current event
  const { currentEvent } = useCurrentEvent();

  const eventData = currentEvent ? {
    title: currentEvent.title,
    date: `${formatDateForDisplay(currentEvent.startDate)} - ${formatDateForDisplay(currentEvent.endDate)}`
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

        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}