import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQueryParams } from "../hooks/use-query-params";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TwoStageRsvpForm from "@/components/rsvp/two-stage-rsvp-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { extractRsvpToken } from "@/lib/rsvp-token-handler";

enum RSVPStage {
  LOADING = "loading",
  INVALID = "invalid",
  FORM = "form",
  SUCCESS = "success",
}

export default function RsvpPage({ params }: { params?: { token?: string } }) {
  const [matched, routeParams] = useRoute<{token: string}>("/guest-rsvp/:token");
  
  // This gets the token from all possible sources (URL parameter, path, window object, etc.)
  // in a reliable, consistent way that handles all the edge cases
  const extractedToken = extractRsvpToken();
  
  // Get token with fallbacks for maximum compatibility
  const token = params?.token || routeParams?.token || extractedToken || '';
  
  console.log("RSVP Page - Using token:", token, "- Extracted from:", { 
    paramsToken: params?.token,  
    routeParamsToken: routeParams?.token, 
    extractedToken,
    path: window.location.pathname
  });
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [stage, setStage] = useState<RSVPStage>(RSVPStage.LOADING);
  const [tokenData, setTokenData] = useState<any>(null);
  const [stageData, setStageData] = useState<any>(null);
  
  // Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStage(RSVPStage.INVALID);
        return;
      }
      
      try {
        // Use the token to verify, regardless of how it was passed
        const response = await apiRequest("GET", `/api/rsvp/verify?token=${token}`);
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || "Invalid or expired token");
        }
        
        setTokenData(data);
        setStage(RSVPStage.FORM);
      } catch (error) {
        console.error("Token verification error:", error);
        setStage(RSVPStage.INVALID);
        toast({
          variant: "destructive",
          title: "Invalid Invitation Link",
          description: error instanceof Error ? error.message : "The invitation link is invalid or has expired.",
        });
      }
    };
    
    verifyToken();
  }, [token, toast]);
  
  // Handle successful submission of Stage 1
  const handleStage1Success = (data: any) => {
    setStageData(data);
    
    if (data.requiresStage2) {
      setStage(RSVPStage.STAGE2);
    } else {
      setStage(RSVPStage.SUCCESS);
    }
  };
  
  // Handle proceeding to Stage 2
  const handleProceedToStage2 = (data: any) => {
    setStageData(data);
    setStage(RSVPStage.STAGE2);
  };
  
  // Handle going back to Stage 1
  const handleBackToStage1 = () => {
    setStage(RSVPStage.STAGE1);
  };
  
  // Handle successful submission of Stage 2
  const handleStage2Success = (data: any) => {
    setStageData({ ...stageData, ...data });
    setStage(RSVPStage.SUCCESS);
  };
  
  // Handle returning to home page
  const handleReturnHome = () => {
    setLocation('/');
  };
  
  if (stage === RSVPStage.LOADING) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>Verifying Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">
              Please wait while we verify your invitation...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (stage === RSVPStage.INVALID) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>Invalid Invitation Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground mb-6">
              The invitation link appears to be invalid or has expired. Please contact the couple for assistance.
            </p>
            <Button onClick={handleReturnHome}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (stage === RSVPStage.SUCCESS) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>RSVP Successfully Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-6">
            <div className="mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto text-primary mb-4"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3 className="text-xl font-medium mb-2">
                {stageData?.guest?.rsvpStatus === "confirmed" 
                  ? "We're looking forward to celebrating with you!" 
                  : "Thank you for letting us know you can't make it."}
              </h3>
              <p className="text-muted-foreground">
                {stageData?.guest?.rsvpStatus === "confirmed"
                  ? "Your RSVP has been confirmed. We're excited to see you at our wedding!"
                  : "We appreciate you taking the time to respond. You'll be missed!"}
              </p>
            </div>
            <Button onClick={handleReturnHome}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2 font-playfair">Wedding RSVP</h1>
        <p className="text-muted-foreground">
          {tokenData?.event?.coupleNames || "The Couple"} 
          {" • "}
          {tokenData?.event?.startDate 
            ? new Date(tokenData.event.startDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) 
            : ""
          }
        </p>
      </div>
      
      {stage === RSVPStage.STAGE1 && tokenData && (
        <div className="mb-10">
          <RsvpStage1Form
            eventId={tokenData.event.id}
            guestId={tokenData.guest.id}
            defaultValues={{
              firstName: tokenData.guest.firstName,
              lastName: tokenData.guest.lastName,
              email: tokenData.guest.email,
              rsvpStatus: tokenData.guest.rsvpStatus || "confirmed",
              plusOneName: tokenData.guest.plusOneName,
              dietaryRestrictions: tokenData.guest.dietaryRestrictions,
            }}
            ceremonies={tokenData.ceremonies}
            onSuccess={handleStage1Success}
            onProceedToStage2={handleProceedToStage2}
          />
        </div>
      )}
      
      {stage === RSVPStage.STAGE2 && tokenData && stageData && (
        <div className="mb-10">
          <RsvpStage2Form
            eventId={tokenData.event.id}
            guestId={tokenData.guest.id}
            mealOptions={tokenData.ceremonies.flatMap((c: any) => c.mealOptions || [])}
            onBack={handleBackToStage1}
            onSuccess={handleStage2Success}
          />
        </div>
      )}
    </div>
  );
}