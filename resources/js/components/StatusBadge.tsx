import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  XCircle,
  MinusCircle,
  AlertCircle,
  ArrowDownCircle,
  FileText,
  Gavel,
  Star,
  Ban,
  TrendingUp,
  Eye,
  PackageCheck,
  RotateCcw,
} from "lucide-react";

type Status = string;

interface BadgeConfig {
  classes: string;
  icon?: React.ReactNode;
  dotPulse?: boolean;
}

const CONFIG: Record<string, BadgeConfig> = {
  pending: {
    classes: "bg-warning/10 text-warning border-warning/25",
    icon: <Clock className="h-3 w-3" />,
    dotPulse: true,
  },
  active: {
    classes: "bg-success/10 text-success border-success/25",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  inactive: {
    classes: "bg-muted/50 text-muted-foreground border-border/30",
    icon: <MinusCircle className="h-3 w-3" />,
  },
  blacklisted: {
    classes: "bg-destructive/10 text-destructive border-destructive/25",
    icon: <Ban className="h-3 w-3" />,
  },
  open: {
    classes: "bg-info/10 text-info border-info/25",
    icon: <Eye className="h-3 w-3" />,
    dotPulse: true,
  },
  closed: {
    classes: "bg-muted/50 text-muted-foreground border-border/30",
    icon: <MinusCircle className="h-3 w-3" />,
  },
  awarded: {
    classes: "bg-success/10 text-success border-success/25",
    icon: <Star className="h-3 w-3" />,
  },
  new: {
    classes: "bg-accent/10 text-accent border-accent/25",
    icon: <FileText className="h-3 w-3" />,
  },
  tendered: {
    classes: "bg-primary/10 text-primary border-primary/25",
    icon: <Gavel className="h-3 w-3" />,
  },
  draft: {
    classes: "bg-muted/50 text-muted-foreground border-border/30",
    icon: <FileText className="h-3 w-3" />,
  },
  pending_approver: {
    classes: "bg-warning/10 text-warning border-warning/25",
    icon: <Clock className="h-3 w-3" />,
    dotPulse: true,
  },
  pending_admin: {
    classes: "bg-warning/10 text-warning border-warning/25",
    icon: <Clock className="h-3 w-3" />,
    dotPulse: true,
  },
  pending_approval: {
    classes: "bg-warning/10 text-warning border-warning/25",
    icon: <Clock className="h-3 w-3" />,
    dotPulse: true,
  },
  approved: {
    classes: "bg-success/10 text-success border-success/25",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  rejected: {
    classes: "bg-destructive/10 text-destructive border-destructive/25",
    icon: <XCircle className="h-3 w-3" />,
  },
  forwarded_to_finance: {
    classes: "bg-success/10 text-success border-success/25",
    icon: <TrendingUp className="h-3 w-3" />,
  },
  re_tendered: {
    classes: "bg-info/10 text-info border-info/25",
    icon: <RotateCcw className="h-3 w-3" />,
  },
  success: {
    classes: "bg-success/10 text-success border-success/25",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  failed: {
    classes: "bg-destructive/10 text-destructive border-destructive/25",
    icon: <XCircle className="h-3 w-3" />,
  },
  selected: {
    classes: "bg-success/10 text-success border-success/25",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  not_selected: {
    classes: "bg-muted/50 text-muted-foreground border-border/30",
    icon: <MinusCircle className="h-3 w-3" />,
  },
  submitted: {
    classes: "bg-info/10 text-info border-info/25",
    icon: <ArrowDownCircle className="h-3 w-3" />,
  },
  under_review_procurement: {
    classes: "bg-warning/10 text-warning border-warning/25",
    icon: <Eye className="h-3 w-3" />,
    dotPulse: true,
  },
  under_review_approver: {
    classes: "bg-warning/10 text-warning border-warning/25",
    icon: <Eye className="h-3 w-3" />,
    dotPulse: true,
  },
  under_review_admin: {
    classes: "bg-warning/10 text-warning border-warning/25",
    icon: <Eye className="h-3 w-3" />,
    dotPulse: true,
  },
  invoice: {
    classes: "bg-primary/10 text-primary border-primary/25",
    icon: <FileText className="h-3 w-3" />,
  },
  delivery_challan: {
    classes: "bg-accent/10 text-accent border-accent/25",
    icon: <PackageCheck className="h-3 w-3" />,
  },
  payment_receipt: {
    classes: "bg-success/10 text-success border-success/25",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  partial: {
    classes: "bg-warning/10 text-warning border-warning/25",
    icon: <AlertCircle className="h-3 w-3" />,
    dotPulse: true,
  },
  lowest: {
    classes: "bg-success/10 text-success border-success/25",
    icon: <TrendingUp className="h-3 w-3" />,
  },
  in_tender: {
    classes: "bg-info/10 text-info border-info/25",
    icon: <Gavel className="h-3 w-3" />,
  },
  cs_assigned: {
    classes: "bg-success/10 text-success border-success/25",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  other: {
    classes: "bg-muted/50 text-muted-foreground border-border/30",
  },
};

const DEFAULT_CONFIG: BadgeConfig = {
  classes: "bg-muted/50 text-muted-foreground border-border/30",
};

export const StatusBadge = ({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) => {
  const config = CONFIG[status] ?? DEFAULT_CONFIG;
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[11px] font-semibold tracking-wide uppercase",
        "transition-all duration-200 whitespace-nowrap",
        config.classes,
        className,
      )}
    >
      {config.icon ? (
        <span className={cn("shrink-0", config.dotPulse && "animate-pulse-soft")}>
          {config.icon}
        </span>
      ) : (
        <span className={cn(
          "h-1.5 w-1.5 rounded-full bg-current shrink-0",
          config.dotPulse && "animate-pulse-soft",
        )} />
      )}
      {label}
    </span>
  );
};
