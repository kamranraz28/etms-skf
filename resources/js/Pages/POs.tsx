import { useState, useMemo } from "react";
import { Link, router, Head, usePage } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, RefreshCw, Trash2, ClipboardList, TrendingUp, CheckCircle, Clock } from "lucide-react";

export default function POs({ pos }: any) {
  const { props } = usePage();
  const errors = (props as any).errors || {};
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ po_number: "", vendor_erp_code: "", po_date: "", items: "" });
  const sa = useSweetAlert();

  const sync = async () => {
    const ok = await sa.confirmAction("Sync from ERP?", "Fetch latest purchase orders from the ERP system.", "Sync");
    if (!ok) return;
    router.post("/app/pos/sync", {}, { onSuccess: () => sa.alert("POs synced", "Latest purchase orders have been synced.", "success") });
  };

  const createManual = async () => {
    const ok = await sa.confirmAction("Create PO?", `Create PO "${form.po_number}"?`, "Create");
    if (!ok) return;
    const items = form.items.split("\n").map((l) => l.trim()).filter(Boolean).map((line) => {
      const parts = line.split("|").map((s) => s.trim());
      const qty = Number(parts[1] || 1);
      const unit_price = Number(parts[2] || 0);
      return { name: parts[0], qty, unit_price, total_price: qty * unit_price };
    });
    router.post("/app/pos", { ...form, items }, {
      onSuccess: () => { setOpen(false); setForm({ po_number:"",vendor_erp_code:"",po_date:"",items:"" }); sa.alert("PO created", `"${form.po_number}" has been created.`, "success"); },
      onError: () => {},
    });
  };

  const remove = async (po: any) => {
    const ok = await sa.confirmDelete(po.po_number);
    if (!ok) return;
    router.delete(`/app/pos/${po.id}`, { onSuccess: () => sa.alert("PO deleted", `"${po.po_number}" has been removed.`, "success") });
  };

  // Summary stats
  const stats = useMemo(() => {
    const totalCount = pos.length;
    let totalAmt = 0;
    let pendingCount = 0;
    let completedCount = 0;

    pos.forEach((po: any) => {
      const pStatus = po.status?.toLowerCase();
      if (pStatus === "pending" || pStatus === "draft") {
        pendingCount++;
      } else {
        completedCount++;
      }
      const raw = po.items ?? [];
      const poTotal = raw.reduce((s: number, i: any) => s + (i.total_price ?? 0), 0);
      totalAmt += poTotal;
    });

    return { totalCount, totalAmt, pendingCount, completedCount };
  }, [pos]);

  const columns: Column[] = [
    {
      key: "po_number",
      label: "PO Number",
      sortable: true,
      render: (r) => <span className="font-mono text-xs bg-muted/60 px-2 py-0.5 rounded-md whitespace-nowrap">{r.po_number}</span>
    },
    {
      key: "vendor_erp_code",
      label: "Vendor ERP",
      sortable: true,
      render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.vendor_erp_code ?? "—"}</span>
    },
    {
      key: "po_date",
      label: "PO Date",
      sortable: true,
      render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{r.po_date ?? "—"}</span>
    },
    {
      key: "items",
      label: "Items & Amount",
      sortable: false,
      render: (r) => {
        const raw = r.items ?? [];
        const total = raw.reduce((s: number, i: any) => s + (i.total_price ?? 0), 0);
        const preview = raw.slice(0, 2).map((i: any) => `${i.name} ×${i.qty}`).join(", ");
        return (
          <div className="min-w-0 max-w-[250px]">
            <div className="text-xs text-muted-foreground truncate font-medium">
              {preview}{raw.length > 2 && ` +${raw.length - 2} more`}
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5">
              ৳ {total.toLocaleString()}
            </div>
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />
    },
    {
      key: "created_at",
      label: "Synced",
      sortable: true,
      render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</span>
    },
    {
      key: "actions" as string,
      label: "Action",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <div className="inline-flex items-center justify-end">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(r); }} className="h-8 w-8 p-0 hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const summaryCards = [
    { label: "Total Orders", value: stats.totalCount, icon: ClipboardList, color: "from-primary/15 to-primary/5", iconColor: "text-primary" },
    { label: "Total Amount", value: `৳${stats.totalAmt.toLocaleString()}`, icon: TrendingUp, color: "from-accent/15 to-accent/5", iconColor: "text-accent" },
    { label: "Pending POs", value: stats.pendingCount, icon: Clock, color: "from-warning/15 to-warning/5", iconColor: "text-warning" },
    { label: "Completed POs", value: stats.completedCount, icon: CheckCircle, color: "from-success/15 to-success/5", iconColor: "text-success" },
  ];

  return (
    <AppShell>
      <Head title="Purchase Orders" />
      <PageHeader
        title="Purchase Orders"
        description="Purchase orders synced from the ERP. Track active order statuses and payments."
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={sync} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Sync from ERP
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Manual PO
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Create Purchase Order
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">PO number <span className="text-destructive">*</span></Label>
                      <Input className={errors.po_number && "border-destructive focus-visible:ring-destructive"} value={form.po_number} onChange={(e)=>setForm({...form, po_number:e.target.value})} placeholder="PO-2026-001" />
                      {errors.po_number && <p className="text-xs text-destructive">{errors.po_number}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Vendor ERP code <span className="text-destructive">*</span></Label>
                      <Input className={errors.vendor_erp_code && "border-destructive focus-visible:ring-destructive"} value={form.vendor_erp_code} onChange={(e)=>setForm({...form, vendor_erp_code:e.target.value})} placeholder="e.g. VEN-099" />
                      {errors.vendor_erp_code && <p className="text-xs text-destructive">{errors.vendor_erp_code}</p>}
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">PO Date <span className="text-destructive">*</span></Label>
                      <Input type="date" className={errors.po_date && "border-destructive focus-visible:ring-destructive"} value={form.po_date} onChange={(e)=>setForm({...form, po_date:e.target.value})} />
                      {errors.po_date && <p className="text-xs text-destructive">{errors.po_date}</p>}
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Items <span className="text-destructive">*</span> <span className="text-[11px] text-muted-foreground lowercase normal-case">(Format: Name | Quantity | Unit Price - one per line)</span></Label>
                      <Textarea rows={4} className={errors.items && "border-destructive focus-visible:ring-destructive"} value={form.items} onChange={(e)=>setForm({...form, items:e.target.value})} placeholder="Cisco Switch | 6 | 25000&#10;Ethernet Cable Roll | 10 | 4500" />
                      {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                  <Button onClick={createManual}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger-children">
        {summaryCards.map((card, i) => (
          <div key={i} className="relative bg-card border border-border/50 rounded-2xl p-4 overflow-hidden hover-lift">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span>
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground font-display truncate">{card.value}</div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={pos} exportFilename="purchase-orders" emptyMessage="No POs synced. Click 'Sync from ERP'." searchPlaceholder="Search POs..." />
      {sa.SweetAlert}
    </AppShell>
  );
}
