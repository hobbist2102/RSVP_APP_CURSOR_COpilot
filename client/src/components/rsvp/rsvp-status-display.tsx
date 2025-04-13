import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";

interface RsvpStatusDisplayProps {
  guest: any;
  showDetails?: boolean;
}

export default function RsvpStatusDisplay({ guest, showDetails = true }: RsvpStatusDisplayProps) {
  // Get stage completion percentages
  const getStage1Progress = () => {
    if (guest.rsvpStatus === "pending") return 0;
    return 100; // Confirmed or declined means stage 1 is complete
  };
  
  const getStage2Progress = () => {
    if (guest.rsvpStatus !== "confirmed") return 0;
    if (guest.isLocalGuest) return 100; // Local guests don't need to complete stage 2
    
    // Calculate based on completion of travel/accommodation details
    let fieldsCompleted = 0;
    let totalFields = 0;
    
    // Check accommodation details
    if (guest.needsAccommodation !== undefined) {
      fieldsCompleted += 1;
      if (guest.needsAccommodation && guest.accommodationPreference) {
        fieldsCompleted += 1;
      }
    }
    totalFields += 2;
    
    // Check transportation details
    if (guest.needsTransportation !== undefined) {
      fieldsCompleted += 1;
      if (guest.needsTransportation && guest.transportationPreference) {
        fieldsCompleted += 1;
      }
    }
    totalFields += 2;
    
    // Travel dates
    if (guest.arrivalDate) fieldsCompleted += 1;
    if (guest.departureDate) fieldsCompleted += 1;
    totalFields += 2;
    
    // Calculate percentage
    return Math.round((fieldsCompleted / totalFields) * 100);
  };
  
  const stage1Progress = getStage1Progress();
  const stage2Progress = getStage2Progress();
  const overallProgress = Math.round((stage1Progress + stage2Progress) / 2);
  
  // Get status colors
  const getStageColor = (progress: number) => {
    if (progress === 0) return "bg-gray-200";
    if (progress < 50) return "bg-amber-500";
    if (progress < 100) return "bg-blue-500";
    return "bg-green-500";
  };
  
  // Get status badges
  const getStatusBadge = () => {
    if (guest.rsvpStatus === "pending") {
      return <Badge variant="outline" className="whitespace-nowrap">Not Responded</Badge>;
    } else if (guest.rsvpStatus === "declined") {
      return <Badge variant="destructive" className="whitespace-nowrap">Declined</Badge>;
    } else if (guest.rsvpStatus === "confirmed") {
      if (stage2Progress === 100) {
        return <Badge className="bg-green-500 text-white whitespace-nowrap">Fully Confirmed</Badge>;
      } else if (stage2Progress > 0) {
        return <Badge variant="default" className="whitespace-nowrap">Partially Complete</Badge>;
      } else {
        return <Badge variant="secondary" className="whitespace-nowrap">Basic Confirmation</Badge>;
      }
    }
    return null;
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          {guest.rsvpDate && (
            <span className="text-xs text-muted-foreground">
              {formatDate(guest.rsvpDate)}
            </span>
          )}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium">{overallProgress}%</span>
                <Progress value={overallProgress} className="w-16 h-2" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Overall RSVP completion: {overallProgress}%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {showDetails && guest.rsvpStatus !== "pending" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs">Stage 1</span>
              <span className="text-xs font-medium">{stage1Progress}%</span>
            </div>
            <Progress value={stage1Progress} className={`h-1.5 ${getStageColor(stage1Progress)}`} />
          </div>
          
          {guest.rsvpStatus === "confirmed" && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs">Stage 2</span>
                <span className="text-xs font-medium">{stage2Progress}%</span>
              </div>
              <Progress value={stage2Progress} className={`h-1.5 ${getStageColor(stage2Progress)}`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}