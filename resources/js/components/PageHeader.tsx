import { ReactNode } from "react";
export const PageHeader = ({ title, description, actions }:
  { title: string; description?: string; actions?: ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
    <div className="min-w-0">
      <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">{title}</h1>
      {description && <p className="text-sm text-muted-foreground/80 mt-1 max-w-2xl leading-relaxed">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
  </div>
);
