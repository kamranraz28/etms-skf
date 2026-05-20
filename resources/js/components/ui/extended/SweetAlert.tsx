import { AlertCircle, AlertTriangle, CheckCircle2, Info, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";

export type AlertVariant = "default" | "destructive" | "success" | "warning" | "info";

interface SweetAlertOptions {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | ReactNode;
  variant?: AlertVariant;
  icon?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  loading?: boolean;
}

const variantConfig = {
  default: {
    icon: <Info className="h-6 w-6 text-accent" />,
    bg: "bg-accent/10",
    border: "border-accent/20",
    confirm: "",
  },
  destructive: {
    icon: <AlertCircle className="h-6 w-6 text-destructive" />,
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    confirm: "destructive",
  },
  success: {
    icon: <CheckCircle2 className="h-6 w-6 text-success" />,
    bg: "bg-success/10",
    border: "border-success/20",
    confirm: "",
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-warning" />,
    bg: "bg-warning/10",
    border: "border-warning/20",
    confirm: "",
  },
  info: {
    icon: <Info className="h-6 w-6 text-info" />,
    bg: "bg-info/10",
    border: "border-info/20",
    confirm: "",
  },
};

export function SweetAlert({
  open, onClose, title, description, variant = "default",
  icon, confirmText = "Confirm", cancelText = "Cancel",
  onConfirm, onCancel, showCancel = true, loading = false,
}: SweetAlertOptions) {
  const cfg = variantConfig[variant];
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !loading) onClose(); }}>
      <DialogContent className="sm:max-w-md gap-0 p-0">
        <div className="flex flex-col items-center text-center px-6 pt-8 pb-6">
          <div className={cn("h-14 w-14 rounded-full flex items-center justify-center mb-4", cfg.bg, cfg.border, "border")}>
            {icon ?? cfg.icon}
          </div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && (
            <div className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-sm">
              {description}
            </div>
          )}
        </div>
        <DialogFooter className="px-6 pb-6 sm:justify-center gap-2">
          {showCancel && (
            <Button variant="outline" onClick={() => { onCancel?.(); onClose(); }} disabled={loading}>
              {cancelText}
            </Button>
          )}
          <Button
            variant={cfg.confirm as any || "default"}
            onClick={() => onConfirm?.()}
            disabled={loading}
            className={cn(!cfg.confirm && variant === "success" && "bg-success hover:bg-success/90")}
          >
            {loading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useSweetAlert() {
  const [state, setState] = useState<SweetAlertOptions>({
    open: false,
    onClose: () => setState(prev => ({ ...prev, open: false })),
    title: "",
  });

  const show = (opts: Omit<SweetAlertOptions, "open" | "onClose">) => {
    return new Promise<boolean>((resolve) => {
      setState({
        ...opts,
        open: true,
        onClose: () => { setState(prev => ({ ...prev, open: false })); resolve(false); },
        onConfirm: () => {
          if (opts.onConfirm) {
            opts.onConfirm();
          } else {
            setState(prev => ({ ...prev, open: false }));
            resolve(true);
          }
        },
        onCancel: () => {
          opts.onCancel?.();
          setState(prev => ({ ...prev, open: false }));
          resolve(false);
        },
      });
    });
  };

  const close = () => setState(prev => ({ ...prev, open: false }));

  const confirmDelete = (name: string) =>
    show({
      title: "Are you sure?",
      description: <>You are about to delete <strong>{name}</strong>. This action cannot be undone.</>,
      variant: "destructive",
      confirmText: "Delete",
      showCancel: true,
      icon: <Trash2 className="h-6 w-6 text-destructive" />,
    });

  const confirmAction = (title: string, description?: string, confirmText = "Confirm") =>
    show({ title, description, confirmText, showCancel: true, variant: "default" });

  const alert = (title: string, description?: string, variant: AlertVariant = "success") =>
    show({ title, description, variant, confirmText: "OK", showCancel: false });

  return {
    SweetAlert: <SweetAlert {...state} />,
    show,
    close,
    confirmDelete,
    confirmAction,
    alert,
  };
}
