import React from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-4xl font-serif font-bold text-foreground">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage application settings and preferences
        </p>
      </div>
      
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mb-2">
              The settings management feature is under development and will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}