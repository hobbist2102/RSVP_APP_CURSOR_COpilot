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
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Loader2, Bot, MessageSquare, BrainCircuit } from "lucide-react";
import { WeddingEvent } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

// Define schema for AI assistant settings
const aiAssistantSchema = z.object({
  enableAiAssistant: z.boolean().default(false),
  chatbotName: z.string().optional(),
  welcomeMessage: z.string().optional(),
  aiModel: z.enum(["gpt-4", "claude-3", "gemini-pro"]).default("claude-3"),
  knowledgeBase: z.array(z.string()).default([
    "event_details",
    "guest_faq",
    "travel_info",
    "accommodation_details",
  ]),
  customInstructions: z.string().optional(),
  availableOnWebsite: z.boolean().default(true),
  availableOnWhatsapp: z.boolean().default(false),
});

type AiAssistantData = z.infer<typeof aiAssistantSchema>;

interface AiAssistantStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: AiAssistantData) => void;
  isCompleted: boolean;
}

export default function AiAssistantStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted,
}: AiAssistantStepProps) {
  // Fetch existing AI assistant settings
  const { 
    data: aiSettings, 
    isLoading: isLoadingSettings 
  } = useQuery({
    queryKey: [`/api/events/${eventId}/ai-settings`],
    enabled: !!eventId,
  });

  // Create form
  const form = useForm<AiAssistantData>({
    resolver: zodResolver(aiAssistantSchema),
    defaultValues: {
      enableAiAssistant: aiSettings?.enableAiAssistant || false,
      chatbotName: aiSettings?.chatbotName || "Wedding Assistant",
      welcomeMessage: aiSettings?.welcomeMessage || "Hello! I'm your wedding assistant. How can I help you today?",
      aiModel: aiSettings?.aiModel || "claude-3",
      knowledgeBase: aiSettings?.knowledgeBase || [
        "event_details",
        "guest_faq",
        "travel_info",
        "accommodation_details",
      ],
      customInstructions: aiSettings?.customInstructions || "",
      availableOnWebsite: aiSettings?.availableOnWebsite ?? true,
      availableOnWhatsapp: aiSettings?.availableOnWhatsapp || false,
    },
  });

  // Submit handler
  function onSubmit(data: AiAssistantData) {
    onComplete(data);
  }

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading AI settings...</p>
      </div>
    );
  }

  const enableAiAssistant = form.watch("enableAiAssistant");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              AI Wedding Assistant
            </CardTitle>
            <CardDescription>
              Set up a virtual assistant to help your guests with information and inquiries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="enableAiAssistant"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable AI Assistant</FormLabel>
                    <FormDescription>
                      Add an AI chatbot to help guests with questions
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

            {enableAiAssistant && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="chatbotName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assistant Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Wedding Helper, Event Guide" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          How the assistant will introduce itself to guests
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aiModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AI Model</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            <option value="claude-3">Claude 3 (Recommended)</option>
                            <option value="gpt-4">GPT-4</option>
                            <option value="gemini-pro">Gemini Pro</option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          The AI language model powering your assistant
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="welcomeMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welcome Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Introduce your assistant to guests..." 
                          {...field} 
                          value={field.value || ""}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>
                        The first message guests will see from the assistant
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Instructions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add special instructions for your AI assistant..." 
                          {...field} 
                          rows={4}
                        />
                      </FormControl>
                      <FormDescription>
                        Special guidance for how the AI should respond (tone, style, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Knowledge Base</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {["event_details", "guest_faq", "travel_info", "accommodation_details", "venue_information", "schedule", "dress_code", "special_requirements"].map((item) => (
                      <label key={item} className="flex items-center space-x-2 border rounded-md p-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={form.watch("knowledgeBase").includes(item)}
                          onChange={(e) => {
                            const current = form.watch("knowledgeBase");
                            if (e.target.checked) {
                              form.setValue("knowledgeBase", [...current, item]);
                            } else {
                              form.setValue("knowledgeBase", current.filter(i => i !== item));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {item.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="availableOnWebsite"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <FormLabel className="text-base">Website Chat</FormLabel>
                          </div>
                          <FormDescription>
                            Show chat widget on wedding website
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
                    name="availableOnWhatsapp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <FormLabel className="text-base">WhatsApp Integration</FormLabel>
                          </div>
                          <FormDescription>
                            Allow guests to chat via WhatsApp
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
              </>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex justify-between items-center w-full">
              <p className="text-sm text-muted-foreground">
                {enableAiAssistant ? 
                  "AI Assistant will help answer guest questions about your wedding" : 
                  "Enable the AI Assistant to provide automated help to your guests"}
              </p>
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
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}