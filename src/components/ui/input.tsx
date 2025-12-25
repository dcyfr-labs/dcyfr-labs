import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Error message to display (also applies error styling) */
  error?: string | null;
  /** Show success indicator */
  success?: boolean;
  /** Wrapper div className for error/success message positioning */
  wrapperClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, wrapperClassName, ...props }, ref) => {
    const hasError = error && error.trim() !== "";
    const showSuccess = success && !hasError;

    // If no validation states, render simple input
    if (!hasError && !showSuccess) {
      return (
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm transition-theme duration-200 hover:border-ring/50 focus:border-ring",
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }

    // Render with validation states
    return (
      <div className={cn("relative", wrapperClassName)}>
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm transition-theme duration-200",
            // Error state
            hasError &&
              "border-destructive pr-10 focus-visible:ring-destructive/20 focus:border-destructive hover:border-destructive",
            // Success state
            showSuccess &&
              "border-success pr-10 focus-visible:ring-success/20 focus:border-success hover:border-success",
            // Default (no error/success)
            !hasError &&
              !showSuccess &&
              "border-input hover:border-ring/50 focus:border-ring focus-visible:ring-ring",
            className
          )}
          ref={ref}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={hasError ? `${props.id}-error` : undefined}
          {...props}
        />

        {/* Success icon */}
        {showSuccess && (
          <CheckCircle2
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success"
            aria-hidden="true"
          />
        )}

        {/* Error icon */}
        {hasError && (
          <AlertCircle
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive"
            aria-hidden="true"
          />
        )}

        {/* Error message */}
        {hasError && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-xs text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
