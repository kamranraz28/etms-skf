import { ReactNode } from "react";

export const PageHeader = ({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 animate-fade-in-up">
    <div className="flex items-start gap-4 min-w-0">
      {/* Left accent bar */}
      <div className="hidden sm:block w-1 h-12 rounded-full bg-gradient-to-b from-primary to-accent shrink-0 mt-0.5" />
      <div className="min-w-0">
        <h1 className="text-2xl md:text-[1.75rem] font-bold text-foreground tracking-tight leading-tight font-display">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed animate-fade-in-left">
            {description}
          </p>
        )}
      </div>
    </div>
    {actions && (
      <div className="flex items-center gap-2 flex-wrap shrink-0 animate-fade-in-right">
        {actions}
      </div>
    )}
  </div>
);
