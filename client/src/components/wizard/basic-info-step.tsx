import React from "react";
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
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2, Calendar, MapPin } from "lucide-react";
import { WeddingEvent } from "@shared/schema";

// Define schema for basic info
const basicInfoSchema = z.object({
  title: z.string().min(2, {
    message: "Event title must be at least 2 characters.",
  }),
  coupleNames: z.string().min(2, {
    message: "Couple names must be at least 2 characters.",
  }),
  brideName: z.string().min(2, {
    message: "Bride name must be at least 2 characters.",
  }),
  groomName: z.string().min(2, {
    message: "Groom name must be at least 2 characters.",
  }),
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Start date must be a valid date",
  }),
  endDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "End date must be a valid date",
  }).refine((date, data) => {
    const start = new Date(data.startDate);
    const end = new Date(date);
    return end >= start;
  }, {
    message: "End date must be after or equal to start date",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type BasicInfoData = z.infer<typeof basicInfoSchema>;

interface BasicInfoStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: BasicInfoData) => void;
  isCompleted: boolean;
}

export default function BasicInfoStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted,
}: BasicInfoStepProps) {
  // Create form with zodResolver
  const form = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      title: currentEvent?.title || "",
      coupleNames: currentEvent?.coupleNames || "",
      brideName: currentEvent?.brideName || "",
      groomName: currentEvent?.groomName || "",
      startDate: currentEvent?.startDate || new Date().toISOString().split('T')[0],
      endDate: currentEvent?.endDate || new Date().toISOString().split('T')[0],
      location: currentEvent?.location || "",
      description: currentEvent?.description || "",
    },
  });

  // Submit handler
  function onSubmit(data: BasicInfoData) {
    onComplete(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sarah & Raj's Wedding" {...field} />
                  </FormControl>
                  <FormDescription>
                    The title of your wedding event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coupleNames"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couple Names</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sarah & Raj" {...field} />
                  </FormControl>
                  <FormDescription>
                    How you'd like to be referred to as a couple.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brideName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bride's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sarah" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groomName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Groom's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Raj" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="date" 
                          className="pl-9" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="date" 
                          className="pl-9" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Main Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="e.g., Mumbai, India" 
                        className="pl-9" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The primary location of your wedding events.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your wedding event..." 
                      {...field} 
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of your wedding event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting || isCompleted}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isCompleted ? (
              "Completed"
            ) : (
              "Complete & Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}