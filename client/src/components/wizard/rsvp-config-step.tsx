import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WeddingEvent } from "@shared/schema";
import { Check, Mail, Plus, MessageSquare } from "lucide-react";
import { RSVP_STATUSES } from "@/lib/constants";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface RsvpConfigStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: any) => void;
  isCompleted: boolean;
}

export default function RsvpConfigStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted
}: RsvpConfigStepProps) {
  const [isEditing, setIsEditing] = useState(!isCompleted);

  // Simplified RSVP settings for demonstration
  const defaultRsvpSettings = {
    enablePlusOne: true,
    enableMealSelection: true,
    enableTransportPreferences: true,
    enableAccommodationPreferences: true,
    enableCustomMessages: true,
    rsvpDeadlineDays: 30,
    autoReminderDays: [14, 7, 3],
    requiredFields: [
      "email",
      "phone",
      "dietaryRestrictions"
    ],
    rsvpStatuses: [
      "Attending",
      "Not Attending",
      "Maybe"
    ]
  };
  
  // This is a simplified component for demonstration
  const handleComplete = () => {
    onComplete(defaultRsvpSettings);
    setIsEditing(false);
  };

  // If step is completed and not editing, show summary view
  if (isCompleted && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Plus One:</h3>
              <p className="col-span-3">{defaultRsvpSettings.enablePlusOne ? "Enabled" : "Disabled"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Meal Selection:</h3>
              <p className="col-span-3">{defaultRsvpSettings.enableMealSelection ? "Enabled" : "Disabled"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Transport Preferences:</h3>
              <p className="col-span-3">{defaultRsvpSettings.enableTransportPreferences ? "Enabled" : "Disabled"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Accommodation Preferences:</h3>
              <p className="col-span-3">{defaultRsvpSettings.enableAccommodationPreferences ? "Enabled" : "Disabled"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Custom Messages:</h3>
              <p className="col-span-3">{defaultRsvpSettings.enableCustomMessages ? "Enabled" : "Disabled"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">RSVP Deadline:</h3>
              <p className="col-span-3">{defaultRsvpSettings.rsvpDeadlineDays} days before event</p>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <h3 className="font-medium text-sm">Auto Reminders:</h3>
              <div className="col-span-3">
                {defaultRsvpSettings.autoReminderDays.map((days, i) => (
                  <span key={i} className="inline-block bg-muted rounded-full px-3 py-1 text-xs mr-2 mb-2">
                    {days} days before
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <h3 className="font-medium text-sm">Required Fields:</h3>
              <div className="col-span-3">
                {defaultRsvpSettings.requiredFields.map((field, i) => (
                  <span key={i} className="inline-block bg-muted rounded-full px-3 py-1 text-xs mr-2 mb-2 capitalize">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <Button type="button" onClick={() => setIsEditing(true)}>
          Edit RSVP Settings
        </Button>
      </div>
    );
  }

  // Placeholder for editing interface
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-md p-6">
        <h3 className="text-lg font-medium mb-4 text-center">RSVP Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="plus-one">Enable Plus One</Label>
                    <p className="text-xs text-muted-foreground">Allow guests to bring a companion</p>
                  </div>
                  <Switch id="plus-one" defaultChecked={defaultRsvpSettings.enablePlusOne} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="meals">Enable Meal Selection</Label>
                    <p className="text-xs text-muted-foreground">Allow guests to select meal preferences</p>
                  </div>
                  <Switch id="meals" defaultChecked={defaultRsvpSettings.enableMealSelection} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="transport">Transport Preferences</Label>
                    <p className="text-xs text-muted-foreground">Allow guests to select transport options</p>
                  </div>
                  <Switch id="transport" defaultChecked={defaultRsvpSettings.enableTransportPreferences} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="accommodation">Accommodation Preferences</Label>
                    <p className="text-xs text-muted-foreground">Allow guests to select room preferences</p>
                  </div>
                  <Switch id="accommodation" defaultChecked={defaultRsvpSettings.enableAccommodationPreferences} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="messages">Enable Custom Messages</Label>
                    <p className="text-xs text-muted-foreground">Allow guests to send personal messages</p>
                  </div>
                  <Switch id="messages" defaultChecked={defaultRsvpSettings.enableCustomMessages} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex gap-4 mt-8 justify-center">
        <Button variant="outline" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Configure Email Templates
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Configure SMS Templates
        </Button>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleComplete} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Save RSVP Settings
        </Button>
      </div>
    </div>
  );
}