import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Check, Circle } from "lucide-react";

// Step styles with variants
const stepVariants = cva(
  "relative flex items-center gap-2 py-2",
  {
    variants: {
      orientation: {
        horizontal: "flex-col",
        vertical: "flex-row",
      },
      variant: {
        default: "",
        outline: "",
      },
      size: {
        default: "",
        sm: "text-sm",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      orientation: "vertical",
      variant: "default",
      size: "default",
    },
  }
);

// Step indicator styles
const stepIndicatorVariants = cva(
  "flex items-center justify-center rounded-full transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-8 w-8",
        sm: "h-6 w-6",
        lg: "h-10 w-10",
      },
      state: {
        incomplete: "border-muted-foreground text-muted-foreground",
        current: "border-primary text-primary",
        complete: "border-primary bg-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "incomplete",
    },
  }
);

// Step connector styles
const stepConnectorVariants = cva(
  "flex-1 transition-all",
  {
    variants: {
      orientation: {
        horizontal: "h-px mt-3 mx-2",
        vertical: "w-px ml-4 my-1",
      },
      state: {
        incomplete: "bg-muted",
        complete: "bg-primary",
      },
    },
    defaultVariants: {
      orientation: "vertical",
      state: "incomplete",
    },
  }
);

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  activeStep: number;
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
}

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  completed?: boolean;
}

const StepContext = React.createContext<{
  activeStep: number;
  orientation: "horizontal" | "vertical";
  stepIndex: number;
}>({
  activeStep: 0,
  orientation: "vertical",
  stepIndex: 0,
});

const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ className, completed, children, ...props }, ref) => {
    const { activeStep, orientation, stepIndex } = React.useContext(StepContext);
    
    let state: "incomplete" | "current" | "complete" = "incomplete";
    if (stepIndex === activeStep) {
      state = "current";
    } else if (stepIndex < activeStep || completed) {
      state = "complete";
    }

    return (
      <div
        ref={ref}
        className={cn(
          stepVariants({ orientation }),
          className
        )}
        {...props}
      >
        <div 
          className={cn(
            stepIndicatorVariants({ state })
          )}
        >
          {state === "complete" ? (
            <Check className="h-4 w-4" />
          ) : (
            <span>{stepIndex + 1}</span>
          )}
        </div>
        <div className="flex flex-col">
          {children}
        </div>
      </div>
    );
  }
);
Step.displayName = "Step";

const Steps = React.forwardRef<
  HTMLDivElement,
  StepsProps
>(({ activeStep, orientation = "vertical", children, className, ...props }, ref) => {
  const validChildren = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child)
  ) as React.ReactElement[];

  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className
      )}
      {...props}
    >
      {validChildren.map((child, index) => {
        const isLast = index === validChildren.length - 1;

        return (
          <React.Fragment key={index}>
            <StepContext.Provider
              value={{
                activeStep,
                orientation,
                stepIndex: index,
              }}
            >
              {child}
            </StepContext.Provider>
            
            {!isLast && (
              <div
                className={cn(
                  stepConnectorVariants({
                    orientation,
                    state: index < activeStep ? "complete" : "incomplete",
                  })
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
});
Steps.displayName = "Steps";

export { Steps, Step };