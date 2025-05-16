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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
import { WeddingEvent } from "@shared/schema";

// Define schema for RSVP configuration
const rsvpConfigSchema = z.object({
  rsvpDeadline: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "RSVP deadline must be a valid date",
  }),
  allowPlusOnes: z.boolean().default(true),
  plusOnePolicy: z.enum(["all", "selected", "none"]).default("selected"),
  allowChildren: z.boolean().default(true),
  collectChildrenDetails: z.boolean().default(true),
  trackDietaryRestrictions: z.boolean().default(true),
  collectMealPreferences: z.boolean().default(true),
  requestTravelDetails: z.boolean().default(true),
  collectAccommodationNeeds: z.boolean().default(true),
  customQuestions: z.array(
    z.object({
      question: z.string().min(1, "Question text is required"),
      required: z.boolean().default(false),
    })
  ).default([]),
  rsvpEmailTemplate: z.string().optional(),
  rsvpConfirmationMessage: z.string().optional(),
});

type RsvpConfigData = z.infer<typeof rsvpConfigSchema>;

interface RsvpConfigStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: RsvpConfigData) => void;
  isCompleted: boolean;
}

export default function RsvpConfigStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted,
}: RsvpConfigStepProps) {
  // Create form with zodResolver
  const form = useForm<RsvpConfigData>({
    resolver: zodResolver(rsvpConfigSchema),
    defaultValues: {
      rsvpDeadline: currentEvent?.rsvpDeadline || new Date().toISOString().split('T')[0],
      allowPlusOnes: currentEvent?.allowPlusOnes ?? true,
      plusOnePolicy: "selected",
      allowChildren: true,
      collectChildrenDetails: currentEvent?.allowChildrenDetails ?? true,
      trackDietaryRestrictions: true,
      collectMealPreferences: true,
      requestTravelDetails: true,
      collectAccommodationNeeds: true,
      customQuestions: [],
      rsvpEmailTemplate: "",
      rsvpConfirmationMessage: "Thank you for your RSVP! We look forward to celebrating with you.",
    },
  });

  // Submit handler
  function onSubmit(data: RsvpConfigData) {
    onComplete(data);
  }

  // Add custom question
  const addCustomQuestion = () => {
    const currentQuestions = form.getValues("customQuestions");
    form.setValue("customQuestions", [
      ...currentQuestions,
      { question: "", required: false }
    ]);
  };

  // Remove custom question
  const removeCustomQuestion = (index: number) => {
    const currentQuestions = form.getValues("customQuestions");
    form.setValue(
      "customQuestions", 
      currentQuestions.filter((_, i) => i !== index)
    );
  };

  const watchAllowPlusOnes = form.watch("allowPlusOnes");
  const watchAllowChildren = form.watch("allowChildren");
  const watchCustomQuestions = form.watch("customQuestions");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="rsvpDeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RSVP Deadline</FormLabel>
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
                  <FormDescription>
                    The date by which guests should respond
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowPlusOnes"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Allow Plus Ones</FormLabel>
                    <FormDescription>
                      Permit guests to bring a partner/date
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchAllowPlusOnes && (
              <FormField
                control={form.control}
                name="plusOnePolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plus One Policy</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a policy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All guests can bring plus ones</SelectItem>
                        <SelectItem value="selected">Only selected guests can bring plus ones</SelectItem>
                        <SelectItem value="none">No guests can bring plus ones</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Determine who can bring additional guests
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="allowChildren"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Allow Children</FormLabel>
                    <FormDescription>
                      Permit guests to bring their children
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchAllowChildren && (
              <FormField
                control={form.control}
                name="collectChildrenDetails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Collect Children Details</FormLabel>
                      <FormDescription>
                        Gather names and ages of children attending
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="trackDietaryRestrictions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Track Dietary Restrictions</FormLabel>
                    <FormDescription>
                      Collect information about allergies and dietary needs
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collectMealPreferences"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Collect Meal Preferences</FormLabel>
                    <FormDescription>
                      Allow guests to select meal options if available
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requestTravelDetails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Request Travel Details</FormLabel>
                    <FormDescription>
                      Collect information about travel plans and arrival times
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collectAccommodationNeeds"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Collect Accommodation Needs</FormLabel>
                    <FormDescription>
                      Gather information about hotel preferences or requirements
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Custom Questions</CardTitle>
            <CardDescription>
              Add custom questions to your RSVP form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {watchCustomQuestions.map((_, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-1 space-y-2">
                    <FormField
                      control={form.control}
                      name={`customQuestions.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Enter question..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`customQuestions.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Required</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => removeCustomQuestion(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addCustomQuestion}
              >
                Add Custom Question
              </Button>
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="rsvpConfirmationMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RSVP Confirmation Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Thank you for your RSVP..." 
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                Message shown to guests after they submit their RSVP
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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