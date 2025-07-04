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
    <div className="flex min-h-screen bg-background">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 z-40">
        <Sidebar />
      </div>

      {/* Main content area with left margin to account for fixed sidebar */}
      <div className="flex flex-col min-h-screen ml-64 flex-1">
        <Header toggleSidebar={toggleSidebar} currentEvent={eventData} />

        <main className="flex-1 bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}