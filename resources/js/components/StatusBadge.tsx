import { cn } from "@/lib/utils";
type Status = string;
const STYLES: Record<string, string> = {
  pending:
    "bg-warning/10 text-warning border-warning/30 shadow-lg shadow-warning/20 hover:shadow-xl hover:shadow-warning/30",
  active:
    "bg-success/10 text-success border-success/30 shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30",
  inactive:
    "bg-muted/50 text-muted-foreground border-border/30 hover:bg-muted/60",
  blacklisted:
    "bg-destructive/10 text-destructive border-destructive/30 shadow-lg shadow-destructive/20 hover:shadow-xl hover:shadow-destructive/30",
  open: "bg-info/10 text-info border-info/30 shadow-lg shadow-info/20 hover:shadow-xl hover:shadow-info/30",
  closed:
    "bg-muted/50 text-muted-foreground border-border/30 hover:bg-muted/60",
  awarded:
    "bg-success/10 text-success border-success/30 shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30",
  new: "bg-accent/10 text-accent border-accent/30 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30",
  tendered:
    "bg-primary/8 text-primary border-primary/30 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
  draft: "bg-muted/50 text-muted-foreground border-border/30 hover:bg-muted/60",
  pending_approver:
    "bg-warning/10 text-warning border-warning/30 shadow-lg shadow-warning/20 hover:shadow-xl hover:shadow-warning/30",
  pending_admin:
    "bg-warning/10 text-warning border-warning/30 shadow-lg shadow-warning/20 hover:shadow-xl hover:shadow-warning/30",
  approved:
    "bg-success/10 text-success border-success/30 shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30",
  rejected:
    "bg-destructive/10 text-destructive border-destructive/30 shadow-lg shadow-destructive/20 hover:shadow-xl hover:shadow-destructive/30",
  forwarded_to_finance:
    "bg-success/10 text-success border-success/30 shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30",
  pending_approval:
    "bg-warning/10 text-warning border-warning/30 shadow-lg shadow-warning/20 hover:shadow-xl hover:shadow-warning/30",
  re_tendered:
    "bg-info/10 text-info border-info/30 shadow-lg shadow-info/20 hover:shadow-xl hover:shadow-info/30",
  success:
    "bg-success/10 text-success border-success/30 shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30",
  failed:
    "bg-destructive/10 text-destructive border-destructive/30 shadow-lg shadow-destructive/20 hover:shadow-xl hover:shadow-destructive/30",
  selected:
    "bg-success/10 text-success border-success/30 shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30",
  not_selected:
    "bg-muted/50 text-muted-foreground border-border/30 hover:bg-muted/60",
  submitted:
    "bg-info/10 text-info border-info/30 shadow-lg shadow-info/20 hover:shadow-xl hover:shadow-info/30",
  under_review_procurement:
    "bg-warning/10 text-warning border-warning/30 shadow-lg shadow-warning/20 hover:shadow-xl hover:shadow-warning/30",
  under_review_approver:
    "bg-warning/10 text-warning border-warning/30 shadow-lg shadow-warning/20 hover:shadow-xl hover:shadow-warning/30",
  under_review_admin:
    "bg-warning/10 text-warning border-warning/30 shadow-lg shadow-warning/20 hover:shadow-xl hover:shadow-warning/30",
  invoice:
    "bg-primary/8 text-primary border-primary/30 shadow-lg shadow-primary/15 hover:shadow-xl",
  delivery_challan:
    "bg-accent/10 text-accent border-accent/30 shadow-lg shadow-accent/15 hover:shadow-xl",
  payment_receipt:
    "bg-success/10 text-success border-success/30 shadow-lg shadow-success/15 hover:shadow-xl",
  other: "bg-muted/50 text-muted-foreground border-border/30 hover:bg-muted/60",
};
export const StatusBadge = ({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) => {
  const style =
    STYLES[status] ?? "bg-muted/50 text-muted-foreground border-border/30";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 animate-fade-in",
        style,
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full bg-current animate-pulse-soft shadow-lg shadow-current/50",
        )}
      />
      {status.replace(/_/g, " ")}
    </span>
  );
};
