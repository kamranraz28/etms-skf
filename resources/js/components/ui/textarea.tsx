import * as React from "react";
import { cn } from "@/lib/utils";
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary/50 focus-visible:shadow-lg focus-visible:shadow-primary/10",
        "hover:border-muted-foreground/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props} />
  ),
);
Textarea.displayName = "Textarea";
export { Textarea };
