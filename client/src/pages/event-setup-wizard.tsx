import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Steps, Step } from "@/components/ui/steps";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import wizard step components
import BasicInfoStep from "@/components/wizard/basic-info-step";
import VenuesStep from "@/components/wizard/venues-step";
import RsvpConfigStep from "@/components/wizard/rsvp-config-step";
import HotelsStep from "@/components/wizard/hotels-step";
import TransportStep from "@/components/wizard/transport-step";
import CommunicationStep from "@/components/wizard/communication-step";
import DesignStep from "@/components/wizard/design-step";
import AiAssistantStep from "@/components/wizard/ai-assistant-step";

// Define the steps for the wizard
const STEPS = [
  {
    id: "basic-info",
    title: "Basic Info",
    description: "Set up your event details"
  },
  {
    id: "venues",
    title: "Venues & Ceremonies",
    description: "Add your ceremony locations"
  },
  {
    id: "rsvp-config",
    title: "RSVP Configuration",
    description: "Set up your RSVP form"
  },
  {
    id: "hotels",
    title: "Hotels & Accommodation",
    description: "Set up guest accommodation"
  },
  {
    id: "transport",
    title: "Transportation",
    description: "Manage guest transportation"
  },
  {
    id: "communication",
    title: "Communication",
    description: "Set up email and WhatsApp"
  },
  {
    id: "design",
    title: "Design & Styling",
    description: "Customize colors and appearance"
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    description: "Configure AI chatbot"
  }
];

export default function EventSetupWizard() {
  const { eventId } = useParams();
  const [_, setLocation] = useLocation();
  const { currentEvent } = useCurrentEvent();
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, any>>({});

  // Fetch wizard progress data for this event
  const { data: wizardProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: [`/api/wizard/events/${eventId}/setup-progress`],
    queryFn: getProgressFn,
    enabled: !!eventId
  });

  function getProgressFn(): Promise<any> {
    return fetch(`/api/wizard/events/${eventId}/setup-progress`).then(res => {
      if (!res.ok) {
        throw new Error('Failed to fetch setup progress');
      }
      return res.json();
    });
  }

  // Mutation to update a step's completion status
  const completeStepMutation = useMutation({
    mutationFn: async ({ stepId, data }: { stepId: string; data: any }) => {
      const response = await apiRequest("POST", `/api/wizard/events/${eventId}/complete-step`, {
        stepId,
        data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wizard/events/${eventId}/setup-progress`] });
    },
    onError: (error) => {
      toast({
        title: "Error saving progress",
        description: error instanceof Error ? error.message : "Failed to save progress",
        variant: "destructive"
      });
    }
  });

  // Sync local state with server data when loaded
  useEffect(() => {
    if (wizardProgress?.completedSteps) {
      setCompletedSteps(wizardProgress.completedSteps);
      
      // If there are completed steps, start at the first incomplete step
      if (Object.keys(wizardProgress.completedSteps).length > 0) {
        for (let i = 0; i < STEPS.length; i++) {
          if (!wizardProgress.completedSteps[STEPS[i].id]) {
            setActiveStep(i);
            break;
          }
        }
      }
    }
  }, [wizardProgress]);

  // Handle step completion
  const handleCompleteStep = (stepId: string, data: any) => {
    completeStepMutation.mutate({ 
      stepId, 
      data 
    }, {
      onSuccess: () => {
        setCompletedSteps(prev => ({
          ...prev,
          [stepId]: data
        }));
        
        // Move to the next step if not on the last step
        if (activeStep < STEPS.length - 1) {
          setActiveStep(activeStep + 1);
        }
        
        toast({
          title: "Progress saved",
          description: `${STEPS[activeStep].title} step completed successfully.`,
        });
      }
    });
  };

  // Navigate to next or previous step
  const goToNextStep = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Go to a specific step
  const goToStep = (index: number) => {
    setActiveStep(index);
  };

  // Loading state
  if (isLoadingProgress) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading wizard progress...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Error handling for missing event
  if (!currentEvent && !isLoadingProgress) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Event not found. Please select a valid event.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => setLocation("/events")}>
            Go to Events
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Render the current step
  const renderCurrentStep = () => {
    const currentStepId = STEPS[activeStep].id;
    const isCompleted = !!completedSteps[currentStepId];
    
    switch (currentStepId) {
      case "basic-info":
        return (
          <BasicInfoStep 
            eventId={eventId || ''} 
            currentEvent={currentEvent}
            onComplete={(data) => handleCompleteStep(currentStepId, data)}
            isCompleted={isCompleted}
          />
        );
      case "venues":
        return (
          <VenuesStep 
            eventId={eventId || ''} 
            currentEvent={currentEvent}
            onComplete={(data) => handleCompleteStep(currentStepId, data)}
            isCompleted={isCompleted}
          />
        );
      case "rsvp-config":
        return (
          <RsvpConfigStep 
            eventId={eventId || ''} 
            currentEvent={currentEvent}
            onComplete={(data) => handleCompleteStep(currentStepId, data)}
            isCompleted={isCompleted}
          />
        );
      case "hotels":
        return (
          <HotelsStep 
            eventId={eventId || ''} 
            currentEvent={currentEvent}
            onComplete={(data) => handleCompleteStep(currentStepId, data)}
            isCompleted={isCompleted}
          />
        );
      case "transport":
        return (
          <TransportStep 
            eventId={eventId || ''} 
            currentEvent={currentEvent}
            onComplete={(data) => handleCompleteStep(currentStepId, data)}
            isCompleted={isCompleted}
          />
        );
      case "communication":
        return (
          <CommunicationStep 
            eventId={eventId || ''} 
            currentEvent={currentEvent}
            onComplete={(data) => handleCompleteStep(currentStepId, data)}
            isCompleted={isCompleted}
          />
        );
      case "design":
        return (
          <DesignStep 
            eventId={eventId || ''} 
            currentEvent={currentEvent}
            onComplete={(data) => handleCompleteStep(currentStepId, data)}
            isCompleted={isCompleted}
          />
        );
      case "ai-assistant":
        return (
          <AiAssistantStep 
            eventId={eventId || ''} 
            currentEvent={currentEvent}
            onComplete={(data) => handleCompleteStep(currentStepId, data)}
            isCompleted={isCompleted}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-playfair font-bold text-neutral">Event Setup Wizard</h2>
        <p className="text-sm text-gray-500">
          Configure {currentEvent?.title || "your event"} step by step
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Side navigation */}
        <div className="w-full md:w-1/4 mb-6 md:mb-0">
          <Card>
            <CardContent className="py-4">
              <Steps 
                orientation="vertical"
                activeStep={activeStep} 
                className="mt-4"
              >
                {STEPS.map((step, index) => (
                  <Step 
                    key={step.id}
                    onClick={() => goToStep(index)}
                    className="cursor-pointer"
                    completed={!!completedSteps[step.id]}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{step.title}</span>
                      <span className="text-xs text-muted-foreground">{step.description}</span>
                    </div>
                  </Step>
                ))}
              </Steps>
            </CardContent>
          </Card>
          
          {Object.keys(completedSteps).length > 0 && (
            <div className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => setLocation(`/event-settings/${eventId}`)}
                className="w-full"
              >
                Return to Event Settings
              </Button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4">
          <Card>
            <CardContent className="py-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">{STEPS[activeStep].title}</h3>
                <p className="text-sm text-muted-foreground">{STEPS[activeStep].description}</p>
              </div>
              
              <div className="py-4">
                {renderCurrentStep()}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  disabled={activeStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex gap-2">
                  {activeStep < STEPS.length - 1 ? (
                    <Button
                      onClick={goToNextStep}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setLocation(`/event-settings/${eventId}`)}
                      className="flex items-center gap-2"
                      variant="default"
                    >
                      Finish
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}