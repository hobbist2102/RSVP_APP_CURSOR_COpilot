import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ROOM_TYPES, BED_TYPES } from "@/lib/constants";
import { Plus, Trash2, Check, Hotel } from "lucide-react";
import { WeddingEvent } from "@shared/schema";

// Define accommodation provision modes
const PROVISION_MODES = {
  NONE: "none",
  BLOCK: "block_booking",
  BOOK: "direct_booking"
};

// Define schema for a hotel
const hotelSchema = z.object({
  name: z.string().min(2, {
    message: "Hotel name must be at least 2 characters.",
  }),
  location: z.string().min(5, {
    message: "Location must be at least 5 characters.",
  }),
  description: z.string().optional(),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().nullable(),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  amenities: z.string().optional(),
  specialDeals: z.string().optional(),
  bookingInstructions: z.string().optional(),
});

// Define schema for a room type
const roomTypeSchema = z.object({
  hotelIndex: z.number(),
  name: z.string().min(2, {
    message: "Room type name must be at least 2 characters.",
  }),
  bedType: z.string(),
  maxOccupancy: z.number().min(1, {
    message: "Maximum occupancy must be at least 1.",
  }),
  totalRooms: z.number().min(1, {
    message: "Total number of rooms must be at least 1.",
  }),
  pricePerNight: z.string().optional(),
  specialFeatures: z.string().optional(),
  description: z.string().optional(),
});

// Define schema for accommodation settings
const accommodationSettingsSchema = z.object({
  accommodationMode: z.enum([
    PROVISION_MODES.NONE,
    PROVISION_MODES.BLOCK,
    PROVISION_MODES.BOOK
  ]),
  enableAutoAllocation: z.boolean().optional(),
  enableGuestRoomPreferences: z.boolean().optional(),
  allocationStrategy: z.enum(["family", "individual", "hybrid"]).optional(),
  hotels: z.array(hotelSchema).optional(),
  roomTypes: z.array(roomTypeSchema).optional(),
});

// TypeScript type for the form data
type AccommodationSettingsData = z.infer<typeof accommodationSettingsSchema>;

interface HotelsStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: AccommodationSettingsData) => void;
  isCompleted: boolean;
}

export default function HotelsStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted
}: HotelsStepProps) {
  const [isEditing, setIsEditing] = useState(!isCompleted);
  
  // This is a placeholder component for demonstration purposes
  // In a real implementation, we would have a more complex form with full hotel/room management
  
  // Set up form with default values 
  const form = useForm<AccommodationSettingsData>({
    resolver: zodResolver(accommodationSettingsSchema),
    defaultValues: {
      accommodationMode: PROVISION_MODES.BLOCK,
      enableAutoAllocation: true,
      enableGuestRoomPreferences: true,
      allocationStrategy: "family",
      hotels: [],
      roomTypes: [],
    },
  });

  function onSubmit(data: AccommodationSettingsData) {
    onComplete(data);
    setIsEditing(false);
  }

  // If step is completed and not editing, show summary view
  if (isCompleted && !isEditing) {
    const data = form.getValues();
    
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Accommodation Mode:</h3>
              <p className="col-span-3 capitalize">{data.accommodationMode.replace('_', ' ')}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Auto Allocation:</h3>
              <p className="col-span-3">{data.enableAutoAllocation ? "Enabled" : "Disabled"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Guest Preferences:</h3>
              <p className="col-span-3">{data.enableGuestRoomPreferences ? "Enabled" : "Disabled"}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Allocation Strategy:</h3>
              <p className="col-span-3 capitalize">{data.allocationStrategy}</p>
            </div>
          </div>
        </div>
        
        <Button type="button" onClick={() => setIsEditing(true)}>
          Edit Accommodation Settings
        </Button>
      </div>
    );
  }

  // Placeholder for editing interface
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-md p-6 text-center">
        <h3 className="text-lg font-medium mb-2">Hotel & Accommodation Management</h3>
        <p className="text-muted-foreground text-sm mb-4">
          This is a placeholder for the hotel and accommodation management interface.
          In a complete implementation, you would be able to add hotels, configure room types,
          and set up accommodation allocation strategies.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Hotel
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Room Type
          </Button>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button onClick={() => onSubmit(form.getValues())} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Save Accommodation Settings
        </Button>
      </div>
    </div>
  );
}