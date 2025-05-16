import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useCurrentEvent } from "@/hooks/use-current-event";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Steps, Step } from "@/components/ui/steps";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, ArrowRight, Save, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Step components
import BasicInfoStep from "@/components/wizard/basic-info-step";
import VenuesStep from "@/components/wizard/venues-step";
import RsvpConfigStep from "@/components/wizard/rsvp-config-step";
import HotelsStep from "@/components/wizard/hotels-step";
import TransportStep from "@/components/wizard/transport-step";
import CommunicationStep from "@/components/wizard/communication-step";
import DesignStep from "@/components/wizard/design-step";
import AIAssistantStep from "@/components/wizard/ai-assistant-step";

export default function EventSetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [savedStep, setSavedStep] = useState(0);
  const [_, navigate] = useNavigate();
  const { eventId } = useParams();
  const { currentEvent, isLoading: isLoadingEvent } = useCurrentEvent();
  const { toast } = useToast();

  // Fetch wizard progress data from API
  const { 
    data: wizardData, 
    isLoading: isLoadingWizard,
    error: wizardError,
    refetch: refetchWizardData
  } = useQuery({
    queryKey: [`/api/events/${eventId}/setup-progress`],
    enabled: !!eventId,
  });

  // Save wizard progress
  const saveProgressMutation = useMutation({
    mutationFn: async (progressData: any) => {
      const res = await apiRequest("POST", `/api/events/${eventId}/setup-progress`, progressData);
      return await res.json();
    },
    onSuccess: () => {
      setSavedStep(currentStep);
      toast({
        title: "Progress saved",
        description: "Your setup progress has been saved.",
        variant: "default",
      });
      refetchWizardData();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save progress",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Complete current step
  const completeStepMutation = useMutation({
    mutationFn: async (stepData: any) => {
      const res = await apiRequest("POST", `/api/events/${eventId}/complete-step`, {
        step: steps[currentStep].id,
        data: stepData
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Step completed",
        description: `${steps[currentStep].title} step has been completed.`,
        variant: "default",
      });
      refetchWizardData();
      // Move to next step if not the last one
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete step",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Steps configuration
  const steps = [
    { 
      id: "basic_info", 
      title: "Basic Information", 
      description: "Event details, couple information and dates",
      component: BasicInfoStep,
      completed: wizardData?.basicInfoComplete || false
    },
    { 
      id: "venues", 
      title: "Venues & Ceremonies", 
      description: "Add venues and ceremony details", 
      component: VenuesStep,
      completed: wizardData?.venuesComplete || false
    },
    { 
      id: "rsvp", 
      title: "RSVP Configuration", 
      description: "Customize RSVP form and options", 
      component: RsvpConfigStep,
      completed: wizardData?.rsvpComplete || false
    },
    { 
      id: "accommodation", 
      title: "Hotels & Accommodation", 
      description: "Set up hotel properties and room inventory", 
      component: HotelsStep,
      completed: wizardData?.accommodationComplete || false
    },
    { 
      id: "transport", 
      title: "Transportation", 
      description: "Configure transport options and vehicles", 
      component: TransportStep,
      completed: wizardData?.transportComplete || false
    },
    { 
      id: "communication", 
      title: "Communication", 
      description: "Set up email and WhatsApp messaging", 
      component: CommunicationStep,
      completed: wizardData?.communicationComplete || false
    },
    { 
      id: "ai_assistant", 
      title: "AI Assistant", 
      description: "Configure AI chatbot for guest interactions", 
      component: AIAssistantStep,
      completed: wizardData?.aiAssistantComplete || false
    },
    { 
      id: "styling", 
      title: "Design & Styling", 
      description: "Customize appearance and branding", 
      component: DesignStep,
      completed: wizardData?.stylingComplete || false
    }
  ];

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Save current progress
  const handleSaveProgress = () => {
    saveProgressMutation.mutate({
      currentStep: steps[currentStep].id
    });
  };

  // Complete current step
  const handleCompleteStep = (data: any) => {
    completeStepMutation.mutate(data);
  };

  // Skip current step
  const handleSkipStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      toast({
        title: "Step skipped",
        description: `You can come back to ${steps[currentStep].title} later.`,
        variant: "default",
      });
    }
  };

  // Navigate to dashboard
  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  // Initialize current step from saved progress
  useEffect(() => {
    if (wizardData?.currentStep) {
      const stepIndex = steps.findIndex(step => step.id === wizardData.currentStep);
      if (stepIndex !== -1) {
        setCurrentStep(stepIndex);
        setSavedStep(stepIndex);
      }
    }
  }, [wizardData]);

  // Handle loading state
  if (isLoadingEvent || isLoadingWizard) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading event setup wizard...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Handle error state
  if (wizardError) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error loading wizard</AlertTitle>
          <AlertDescription>
            There was an error loading the event setup wizard: {wizardError.toString()}
          </AlertDescription>
        </Alert>
        <Button onClick={handleGoToDashboard}>Return to Dashboard</Button>
      </DashboardLayout>
    );
  }

  // Get current step component
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-playfair font-bold text-neutral">Event Setup Wizard</h2>
        <p className="text-sm text-gray-500">
          Configure {currentEvent?.title || "your event"} step by step
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Setup Progress</CardTitle>
          <CardDescription>Complete all steps to fully configure your event</CardDescription>
        </CardHeader>
        <CardContent>
          <Steps currentStep={currentStep} onStepClick={setCurrentStep}>
            {steps.map((step, index) => (
              <Step 
                key={step.id} 
                title={step.title} 
                description={step.description}
                isComplete={step.completed}
                isCurrent={index === currentStep}
              />
            ))}
          </Steps>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent 
            eventId={eventId} 
            currentEvent={currentEvent}
            onComplete={handleCompleteStep}
            isCompleted={steps[currentStep].completed}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="mr-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSkipStep}
              disabled={currentStep === steps.length - 1 || steps[currentStep].completed}
            >
              Skip for Now
            </Button>
          </div>
          <div>
            <Button 
              variant="outline" 
              onClick={handleSaveProgress}
              disabled={currentStep === savedStep && !saveProgressMutation.isPending}
              className="mr-2"
            >
              <Save className="mr-2 h-4 w-4" /> 
              {saveProgressMutation.isPending ? "Saving..." : "Save Progress"}
            </Button>
            <Button 
              onClick={handleNextStep}
              disabled={currentStep === steps.length - 1}
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleGoToDashboard}>
          Return to Dashboard
        </Button>
      </div>
    </DashboardLayout>
  );
}