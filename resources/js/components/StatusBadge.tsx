import { cn } from "@/lib/utils";
type Status = string;
const STYLES: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20 shadow-sm shadow-warning/5",
  active: "bg-success/10 text-success border-success/20 shadow-sm shadow-success/5",
  inactive: "bg-muted/50 text-muted-foreground border-border/30",
  blacklisted: "bg-destructive/10 text-destructive border-destructive/20 shadow-sm shadow-destructive/5",
  open: "bg-info/10 text-info border-info/20 shadow-sm shadow-info/5",
  closed: "bg-muted/50 text-muted-foreground border-border/30",
  awarded: "bg-success/10 text-success border-success/20 shadow-sm shadow-success/5",
  new: "bg-accent/10 text-accent border-accent/20 shadow-sm shadow-accent/5",
  tendered: "bg-primary/8 text-primary border-primary/20 shadow-sm shadow-primary/5",
  draft: "bg-muted/50 text-muted-foreground border-border/30",
  pending_approver: "bg-warning/10 text-warning border-warning/20 shadow-sm shadow-warning/5",
  pending_admin: "bg-warning/10 text-warning border-warning/20 shadow-sm shadow-warning/5",
  approved: "bg-success/10 text-success border-success/20 shadow-sm shadow-success/5",
  rejected: "bg-destructive/10 text-destructive border-destructive/20 shadow-sm shadow-destructive/5",
  success: "bg-success/10 text-success border-success/20 shadow-sm shadow-success/5",
  failed: "bg-destructive/10 text-destructive border-destructive/20 shadow-sm shadow-destructive/5",
  selected: "bg-success/10 text-success border-success/20 shadow-sm shadow-success/5",
  not_selected: "bg-muted/50 text-muted-foreground border-border/30",
  submitted: "bg-info/10 text-info border-info/20 shadow-sm shadow-info/5",
  under_review_procurement: "bg-warning/10 text-warning border-warning/20 shadow-sm shadow-warning/5",
  under_review_approver: "bg-warning/10 text-warning border-warning/20 shadow-sm shadow-warning/5",
  under_review_admin: "bg-warning/10 text-warning border-warning/20 shadow-sm shadow-warning/5",
  invoice: "bg-primary/8 text-primary border-primary/20",
  delivery_challan: "bg-accent/10 text-accent border-accent/20",
  payment_receipt: "bg-success/10 text-success border-success/20",
  other: "bg-muted/50 text-muted-foreground border-border/30",
};
export const StatusBadge = ({ status, className }: { status: Status; className?: string }) => {
  const style = STYLES[status] ?? "bg-muted/50 text-muted-foreground border-border/30";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 hover:scale-105", style, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current animate-pulse-soft")} />
      {status.replace(/_/g, " ")}
    </span>
  );
};
