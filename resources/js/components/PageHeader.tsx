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
    <div className="min-w-0">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight smooth-transition hover:text-primary/80">
        {title}
      </h1>
      {description && (
        <p className="text-sm text-muted-foreground/80 mt-2 max-w-2xl leading-relaxed animate-fade-in-left">
          {description}
        </p>
      )}
    </div>
    {actions && (
      <div className="flex items-center gap-2 flex-wrap shrink-0 animate-fade-in-right">
        {actions}
      </div>
    )}
  </div>
);
