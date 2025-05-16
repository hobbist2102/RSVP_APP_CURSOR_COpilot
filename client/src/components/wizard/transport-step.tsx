import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WeddingEvent } from "@shared/schema";
import { Check, Bus, Car, Plus } from "lucide-react";
import { VEHICLE_TYPES } from "@/lib/constants";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface TransportStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: any) => void;
  isCompleted: boolean;
}

export default function TransportStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted
}: TransportStepProps) {
  const [isEditing, setIsEditing] = useState(!isCompleted);

  // Simplified transport settings for demonstration
  const defaultTransportSettings = {
    enableTransport: true,
    transportGroupingStrategy: "family",
    autoAssignVehicles: true,
    allowGuestPreferences: true,
    vehicles: [
      {
        name: "Airport Shuttle",
        type: "Bus",
        capacity: 45,
        count: 2,
        description: "For airport transfers on arrival and departure days"
      },
      {
        name: "VIP Cars",
        type: "Sedan",
        capacity: 4,
        count: 5,
        description: "For family members and VIP guests"
      }
    ]
  };
  
  // This is a simplified component for demonstration
  const handleComplete = () => {
    onComplete(defaultTransportSettings);
    setIsEditing(false);
  };

  // If step is completed and not editing, show summary view
  if (isCompleted && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Transport Enabled:</h3>
              <p className="col-span-3">{defaultTransportSettings.enableTransport ? "Yes" : "No"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Grouping Strategy:</h3>
              <p className="col-span-3 capitalize">{defaultTransportSettings.transportGroupingStrategy}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Auto-assign Vehicles:</h3>
              <p className="col-span-3">{defaultTransportSettings.autoAssignVehicles ? "Yes" : "No"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Guest Preferences:</h3>
              <p className="col-span-3">{defaultTransportSettings.allowGuestPreferences ? "Allowed" : "Not Allowed"}</p>
            </div>
          </div>
          
          <h3 className="font-medium mt-4">Vehicles:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {defaultTransportSettings.vehicles.map((vehicle, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{vehicle.name}</CardTitle>
                    {vehicle.type === "Bus" ? 
                      <Bus className="h-5 w-5 text-muted-foreground" /> : 
                      <Car className="h-5 w-5 text-muted-foreground" />
                    }
                  </div>
                  <CardDescription>{vehicle.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <p><span className="font-medium">Capacity:</span> {vehicle.capacity} passengers</p>
                    <p><span className="font-medium">Count:</span> {vehicle.count} vehicles</p>
                    <p className="mt-2 text-muted-foreground">{vehicle.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <Button type="button" onClick={() => setIsEditing(true)}>
          Edit Transport Settings
        </Button>
      </div>
    );
  }

  // Placeholder for editing interface
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-md p-6 text-center">
        <h3 className="text-lg font-medium mb-2">Transport Management</h3>
        <p className="text-muted-foreground text-sm mb-4">
          This is a placeholder for the transport management interface.
          In a complete implementation, you would be able to define vehicle types,
          set up fleet capacities, and configure group allocations based on families.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleComplete} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Save Transport Settings
        </Button>
      </div>
    </div>
  );
}