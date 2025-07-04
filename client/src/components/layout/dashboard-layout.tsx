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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content area with left margin to account for fixed sidebar */}
      <div className="flex flex-col min-h-screen ml-64">
        <Header toggleSidebar={toggleSidebar} currentEvent={eventData} />

        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}