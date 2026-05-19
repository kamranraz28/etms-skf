import { cn } from "@/lib/utils";
type Status = string;
const STYLES: Record<string, string> = {
  pending: "bg-warning/15 text-warning border-warning/30",
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  blacklisted: "bg-destructive/15 text-destructive border-destructive/30",
  open: "bg-info/15 text-info border-info/30",
  closed: "bg-muted text-muted-foreground border-border",
  awarded: "bg-success/15 text-success border-success/30",
  new: "bg-accent/15 text-accent border-accent/30",
  tendered: "bg-primary/10 text-primary border-primary/30",
  draft: "bg-muted text-muted-foreground border-border",
  pending_approver: "bg-warning/15 text-warning border-warning/30",
  pending_admin: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  success: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
  selected: "bg-success/15 text-success border-success/30",
  not_selected: "bg-muted text-muted-foreground border-border",
  // Claim statuses
  submitted: "bg-info/15 text-info border-info/30",
  under_review_procurement: "bg-warning/15 text-warning border-warning/30",
  under_review_approver: "bg-warning/15 text-warning border-warning/30",
  under_review_admin: "bg-warning/15 text-warning border-warning/30",
  // Document types
  invoice: "bg-primary/10 text-primary border-primary/30",
  delivery_challan: "bg-accent/15 text-accent border-accent/30",
  payment_receipt: "bg-success/15 text-success border-success/30",
  other: "bg-muted text-muted-foreground border-border",
};
export const StatusBadge = ({ status, className }: { status: Status; className?: string }) => {
  const style = STYLES[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium uppercase tracking-wide", style, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
};
