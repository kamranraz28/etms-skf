import { ReactNode } from "react";
export const PageHeader = ({ title, description, actions }:
  { title: string; description?: string; actions?: ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4 md:mb-5">
    <div className="min-w-0">
      <h1 className="text-lg md:text-xl font-semibold text-foreground">{title}</h1>
      {description && <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
  </div>
);
