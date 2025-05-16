import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, Trash2 } from "lucide-react";
import { WeddingEvent } from "@shared/schema";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface VenuesStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: any) => void;
  isCompleted: boolean;
}

export default function VenuesStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted
}: VenuesStepProps) {
  const [isEditing, setIsEditing] = useState(!isCompleted);

  // Fetch existing ceremonies for this event
  const { data: ceremonies, isLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/ceremonies`],
    enabled: !!eventId
  });

  // This is a simplified component for demonstration purposes
  const handleComplete = () => {
    // In a real implementation, we would validate and save ceremonies data
    onComplete({
      ceremonies: ceremonies || [],
      completed: true
    });
    setIsEditing(false);
  };

  // If step is completed and not editing, show summary view
  if (isCompleted && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ceremonies && ceremonies.length > 0 ? (
            ceremonies.map((ceremony: any) => (
              <Card key={ceremony.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3">
                  <CardTitle className="text-lg">{ceremony.name}</CardTitle>
                  <CardDescription>{format(new Date(ceremony.date), "PPP")}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm font-medium">Location: {ceremony.location}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {ceremony.startTime} - {ceremony.endTime}
                  </p>
                  {ceremony.description && (
                    <p className="text-sm mt-2">{ceremony.description}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-muted-foreground">
              No ceremonies have been added yet.
            </div>
          )}
        </div>
        
        <Button type="button" onClick={() => setIsEditing(true)}>
          Edit Ceremonies
        </Button>
      </div>
    );
  }

  // This is a placeholder for the editing interface
  // In a real implementation, we would include forms to add and edit ceremonies
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-md p-6 text-center">
        <h3 className="text-lg font-medium mb-2">Ceremony Management</h3>
        <p className="text-muted-foreground text-sm mb-4">
          This is a placeholder for the ceremony/venues management interface. 
          In a complete implementation, you would be able to add, edit, and manage 
          different ceremonies for the wedding event.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Ceremony
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Remove Ceremony
          </Button>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={handleComplete} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Save Ceremonies
        </Button>
      </div>
    </div>
  );
}