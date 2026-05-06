import { ReactNode } from "react";
export const PageHeader = ({ title, description, actions }:
  { title: string; description?: string; actions?: ReactNode }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
