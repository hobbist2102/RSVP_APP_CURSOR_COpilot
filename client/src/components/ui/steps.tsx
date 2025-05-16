import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface StepsProps {
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  children: React.ReactNode;
  className?: string;
}

export function Steps({ 
  currentStep, 
  onStepClick, 
  children, 
  className 
}: StepsProps) {
  // Convert React.Children to array
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {React.Children.map(childrenArray, (child, index) => {
        // Make sure we only render Step components
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<StepProps>, {
            stepNumber: index + 1,
            isCurrent: index === currentStep,
            isComplete: (child.props as StepProps).isComplete || false,
            isPassed: index < currentStep,
            onClick: onStepClick ? () => onStepClick(index) : undefined,
          });
        }
        return child;
      })}
    </div>
  );
}

export interface StepProps {
  title: string;
  description?: string;
  stepNumber?: number;
  isCurrent?: boolean;
  isComplete?: boolean;
  isPassed?: boolean;
  onClick?: () => void;
}

export function Step({
  title,
  description,
  stepNumber,
  isCurrent = false,
  isComplete = false,
  isPassed = false,
  onClick,
}: StepProps) {
  const isClickable = onClick && (!isCurrent || isComplete);
  
  return (
    <div 
      className={cn(
        "flex items-start p-3 rounded-md transition-colors",
        isCurrent && "bg-muted/50",
        isClickable && "cursor-pointer hover:bg-muted/80"
      )}
      onClick={isClickable ? onClick : undefined}
    >
      <div className="flex-shrink-0 mr-4">
        <div 
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full text-sm border font-medium",
            isCurrent && "border-primary text-primary",
            isComplete && "bg-primary text-primary-foreground border-primary",
            isPassed && !isComplete && "border-muted-foreground text-muted-foreground"
          )}
        >
          {isComplete ? <CheckCircle2 className="h-5 w-5" /> : stepNumber}
        </div>
      </div>
      <div className="flex flex-col">
        <h3 
          className={cn(
            "text-base font-medium",
            isCurrent && "text-primary",
            isComplete && "text-foreground",
            isPassed && !isComplete && "text-muted-foreground"
          )}
        >
          {title}
        </h3>
        {description && (
          <p 
            className={cn(
              "text-sm",
              isCurrent ? "text-muted-foreground" : "text-muted-foreground/70"
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}