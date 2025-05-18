import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Steps } from "@/components/ui/steps";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Check, Wand2 } from "lucide-react";
import BasicInfoStep from "@/components/wizard/basic-info-step";
import VenuesStep from "@/components/wizard/venues-step";
import RsvpConfigStep from "@/components/wizard/rsvp-config-step";
import HotelsStep from "@/components/wizard/hotels-step";
import TransportStep from "@/components/wizard/transport-step";
import CommunicationStep from "@/components/wizard/communication-step";
import DesignStep from "@/components/wizard/design-step";
import AiAssistantStep from "@/components/wizard/ai-assistant-step";
import EventSelector from "@/components/wizard/event-selector";
import { WIZARD_STEPS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Spinner } from "@/components/ui/spinner";

// Define the wizard steps
const steps = [
  { id: WIZARD_STEPS.BASIC_INFO, label: "Basic Info" },
  { id: WIZARD_STEPS.VENUES, label: "Venues" },
  { id: WIZARD_STEPS.RSVP_CONFIG, label: "RSVP Configuration" },
  { id: WIZARD_STEPS.HOTELS, label: "Hotels & Accommodations" },
  { id: WIZARD_STEPS.TRANSPORT, label: "Transport" },
  { id: WIZARD_STEPS.COMMUNICATION, label: "Communication" },
  { id: WIZARD_STEPS.DESIGN, label: "Design & Styling" },
  { id: WIZARD_STEPS.AI_ASSISTANT, label: "AI Assistant" },
];

export default function EventSetupWizard() {
  const [activeStep, setActiveStep] = useState(WIZARD_STEPS.BASIC_INFO);
  const [currentStep, setCurrentStep] = useState<string | null>(WIZARD_STEPS.BASIC_INFO);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [stepData, setStepData] = useState<Record<string, any>>({});
  const [location, setLocation] = useLocation();
  const params = useParams();
  const eventId = params.eventId || '';
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Check if this is a direct access without an event ID
  const isDirectAccess = !eventId;

  // Define the type for setup progress
  interface WizardProgress {
    currentStep: string;
    steps: Record<string, {
      isCompleted: boolean;
      stepData: any;
    }>;
  }

  // Fetch the current event
  const { data: currentEvent, isLoading } = useQuery<any>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });

  // Fetch the event setup progress
  const { data: setupProgress, isLoading: isLoadingProgress } = useQuery<WizardProgress>({
    queryKey: [`/api/wizard/${eventId}/progress`],
    enabled: !!eventId,
  });

  // Save step data mutation
  const saveStepMutation = useMutation({
    mutationFn: async (data: { stepId: string; stepData: any }) => {
      const response = await apiRequest("POST", `/api/wizard/${eventId}/steps/${data.stepId}`, data.stepData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/wizard/${eventId}/progress`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save step data",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Initialize completed steps and step data from fetched progress
  useEffect(() => {
    if (setupProgress) {
      const completed: Record<string, boolean> = {};
      const data: Record<string, any> = {};
      
      // Handle progress data with type safety
      if (setupProgress.steps && typeof setupProgress.steps === 'object') {
        // New format: setupProgress.steps is an object with step IDs as keys
        Object.entries(setupProgress.steps).forEach(([stepId, stepInfo]) => {
          completed[stepId] = stepInfo.isCompleted;
          if (stepInfo.stepData) {
            data[stepId] = stepInfo.stepData;
          }
        });
      }
      
      setCompletedSteps(completed);
      setStepData(data);
      
      // Set current step if available
      if (setupProgress.currentStep && (!currentStep || currentStep === WIZARD_STEPS.BASIC_INFO)) {
        setCurrentStep(setupProgress.currentStep);
        setActiveStep(setupProgress.currentStep);
      }
    }
  }, [setupProgress, currentStep, setCurrentStep, setActiveStep]);

  // Save current step mutation
  const saveCurrentStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const response = await apiRequest("POST", `/api/wizard/${eventId}/current-step`, { 
        currentStep: stepId 
      });
      return await response.json();
    },
    onError: (error: Error) => {
      console.error("Failed to save current step:", error);
    }
  });

  // Handle step change
  const navigateToStep = (stepId: string) => {
    setActiveStep(stepId);
    // Save the current step to the server if we have an event ID
    if (eventId) {
      saveCurrentStepMutation.mutate(stepId);
    }
  };

  // Handle step completion
  const handleStepComplete = (stepId: string, data: any) => {
    // Update local state
    setStepData((prev) => ({ ...prev, [stepId]: data }));
    setCompletedSteps((prev) => ({ ...prev, [stepId]: true }));
    
    // Save to server
    saveStepMutation.mutate({ stepId, stepData: data });

    // Show success message
    toast({
      title: "Step saved successfully",
      description: `${steps.find(s => s.id === stepId)?.label} settings have been saved.`,
      variant: "default",
    });
    
    // Automatically navigate to the next step if this isn't the last step
    const currentIndex = steps.findIndex(step => step.id === stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      // Use setTimeout to give the user a moment to see the success toast
      setTimeout(() => navigateToStep(nextStep.id), 800);
    }
  };

  // Navigate to next/previous step
  const goToNextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      navigateToStep(nextStep.id);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      navigateToStep(prevStep.id);
    }
  };

  // Finish wizard
  const finishWizard = () => {
    toast({
      title: "Setup Wizard Completed",
      description: "All settings have been saved. You can now manage your event.",
      variant: "default",
    });
    
    // Redirect to event settings
    setLocation(`/events/${eventId}/settings`);
  };

  // If loading, show a simple loading state
  if (isLoading || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Determine if the current step is completed
  const isCurrentStepCompleted = completedSteps[activeStep] || false;

  // Render the appropriate step component
  const renderStepContent = () => {
    switch (activeStep) {
      case WIZARD_STEPS.BASIC_INFO:
        return (
          <BasicInfoStep
            eventId={eventId}
            currentEvent={currentEvent as any}
            onComplete={(data) => handleStepComplete(WIZARD_STEPS.BASIC_INFO, data)}
            isCompleted={isCurrentStepCompleted}
          />
        );
      case WIZARD_STEPS.VENUES:
        return (
          <VenuesStep
            eventId={eventId}
            currentEvent={currentEvent as any}
            onComplete={(data) => handleStepComplete(WIZARD_STEPS.VENUES, data)}
            isCompleted={isCurrentStepCompleted}
          />
        );
      case WIZARD_STEPS.RSVP_CONFIG:
        return (
          <RsvpConfigStep
            eventId={eventId}
            currentEvent={currentEvent as any}
            onComplete={(data) => handleStepComplete(WIZARD_STEPS.RSVP_CONFIG, data)}
            isCompleted={isCurrentStepCompleted}
          />
        );
      case WIZARD_STEPS.HOTELS:
        return (
          <HotelsStep
            eventId={eventId}
            currentEvent={currentEvent as any}
            onComplete={(data) => handleStepComplete(WIZARD_STEPS.HOTELS, data)}
            isCompleted={isCurrentStepCompleted}
          />
        );
      case WIZARD_STEPS.TRANSPORT:
        return (
          <TransportStep
            eventId={eventId}
            currentEvent={currentEvent as any}
            onComplete={(data) => handleStepComplete(WIZARD_STEPS.TRANSPORT, data)}
            isCompleted={isCurrentStepCompleted}
          />
        );
      case WIZARD_STEPS.COMMUNICATION:
        return (
          <CommunicationStep
            eventId={eventId}
            currentEvent={currentEvent as any}
            onComplete={(data) => handleStepComplete(WIZARD_STEPS.COMMUNICATION, data)}
            isCompleted={isCurrentStepCompleted}
          />
        );
      case WIZARD_STEPS.DESIGN:
        return (
          <DesignStep
            eventId={eventId}
            currentEvent={currentEvent as any}
            onComplete={(data) => handleStepComplete(WIZARD_STEPS.DESIGN, data)}
            isCompleted={isCurrentStepCompleted}
          />
        );
      case WIZARD_STEPS.AI_ASSISTANT:
        return (
          <AiAssistantStep
            eventId={eventId}
            currentEvent={currentEvent as any}
            onComplete={(data) => handleStepComplete(WIZARD_STEPS.AI_ASSISTANT, data)}
            isCompleted={isCurrentStepCompleted}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Check if all steps are completed
  const areAllStepsCompleted = steps.every(step => completedSteps[step.id]);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center gap-2">
        <Wand2 className="h-6 w-6 text-primary" strokeWidth={1.5} />
        <h1 className="text-2xl font-bold">Event Setup Wizard</h1>
      </div>
      
      {/* Show Event Selector when accessed from sidebar without an event ID */}
      {isDirectAccess ? (
        <EventSelector onSelectEvent={(selectedEventId) => setLocation(`/event-setup-wizard/${selectedEventId}`)} />
      ) : (
        /* Show wizard interface when accessed with an event ID */
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Left sidebar with steps */}
            <div className="md:col-span-1 space-y-6">
              <Steps
                steps={steps.map(step => ({
                  id: step.id,
                  label: step.label,
                  isCompleted: completedSteps[step.id] || false,
                  isActive: activeStep === step.id
                }))}
                onStepClick={navigateToStep}
                orientation="vertical"
              />
              
              <div className="space-y-2 pt-6">
                {areAllStepsCompleted && (
                  <Button 
                    className="w-full flex items-center gap-2"
                    onClick={finishWizard}
                  >
                    <Check className="h-4 w-4" />
                    Finish Setup
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation(`/events/${eventId}`)}
                >
                  Back to Event
                </Button>
              </div>
            </div>
            
            {/* Right content area */}
            <div className="md:col-span-3">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {steps.find(step => step.id === activeStep)?.label}
                  </h2>
                  <Separator />
                </div>
                
                {/* Step content */}
                <div className="min-h-[50vh]">
                  {renderStepContent()}
                </div>
                
                {/* Navigation buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={activeStep === steps[0].id}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <Button
                    onClick={goToNextStep}
                    disabled={activeStep === steps[steps.length - 1].id}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}