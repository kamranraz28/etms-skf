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
import { Plus, RefreshCw, ChevronRight, Trash2, ExternalLink, FileStack, CheckCircle2, Clock, Activity } from "lucide-react";

export default function PRs({ prs }: any) {
  const { props } = usePage();
  const errors = (props as any).errors || {};
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ pr_number: "", title: "", department: "", items: "" });
  const sa = useSweetAlert();

  const sync = async () => {
    const ok = await sa.confirmAction("Sync from ERP?", "Fetch latest purchase requisitions from the ERP system.", "Sync");
    if (!ok) return;
    router.post("/app/prs/sync", {}, { onSuccess: () => sa.alert("PRs synced", "Latest purchase requisitions have been synced.", "success") });
  };

  const createManual = async () => {
    const ok = await sa.confirmAction("Create PR?", `Create PR "${form.pr_number}"?`, "Create");
    if (!ok) return;
    const items = form.items.split("\n").map((l) => l.trim()).filter(Boolean).map((line) => {
      const [name, qty, unit] = line.split("|").map((s) => s.trim());
      return { name, qty: Number(qty || 1), unit: unit || "pcs" };
    });
    router.post("/app/prs", { ...form, items }, {
      onSuccess: () => { setOpen(false); setForm({ pr_number:"",title:"",department:"",items:"" }); sa.alert("PR created", `"${form.pr_number}" has been created.`, "success"); },
      onError: () => {},
    });
  };

  const remove = async (pr: any) => {
    const ok = await sa.confirmDelete(pr.pr_number);
    if (!ok) return;
    router.delete(`/app/prs/${pr.id}`, { onSuccess: () => sa.alert("PR deleted", `"${pr.pr_number}" has been removed.`, "success") });
  };

  // Summary stats calculations
  const stats = useMemo(() => {
    const total = prs.length;
    const isNew = prs.filter((p: any) => (p.derived_status ?? p.status) === "new").length;
    const partial = prs.filter((p: any) => (p.derived_status ?? p.status) === "partial").length;
    const fullyTendered = prs.filter((p: any) => (p.derived_status ?? p.status) === "tendered").length;
    return { total, isNew, partial, fullyTendered };
  }, [prs]);

  const columns: Column[] = [
    {
      key: "pr_number",
      label: "PR Number",
      sortable: true,
      render: (r) => <span className="font-mono text-xs bg-muted/60 px-2 py-0.5 rounded-md whitespace-nowrap">{r.pr_number}</span>
    },
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (r) => <span className="font-semibold text-sm max-w-[220px] truncate block text-foreground">{r.title}</span>
    },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{r.department ?? "—"}</span>
    },
    {
      key: "items",
      label: "Items",
      sortable: false,
      render: (r) => {
        const raw = r.items ?? [];
        const assignments = r.assignments ?? [];
        const assignedCount = assignments.filter((a: any) => a.status !== "pending").length;
        const preview = raw.slice(0, 2).map((i: any) => `${i.name} ×${i.qty}`).join(", ");
        return (
          <div className="min-w-0 max-w-[240px]">
            <div className="text-xs text-muted-foreground truncate block">
              {preview}{raw.length > 2 && ` +${raw.length - 2} more`}
            </div>
            {assignedCount > 0 && (
              <div className="mt-1 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
                <span className="text-[10px] text-success-foreground font-semibold bg-success/10 px-1.5 py-0.5 rounded-md">
                  {assignedCount}/{raw.length} Tendered
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (r) => <StatusBadge status={r.derived_status ?? r.status} />
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
        <div className="inline-flex items-center gap-1.5">
          <Link href={`/app/prs/${r.id}`} title="View Details">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
          {(!r.derived_status || r.derived_status === "new" || r.derived_status === "partial") && (
            <Link href={`/app/tenders/new?pr=${r.id}`}>
              <Button size="sm" variant="outline" className="h-8 py-0 px-3 flex items-center gap-1 text-xs" onClick={(e) => e.stopPropagation()}>
                Tender <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
          <Button size="sm" variant="ghost" title="Delete Requisition" onClick={(e) => { e.stopPropagation(); remove(r); }} className="h-8 w-8 p-0 hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const summaryCards = [
    { label: "Total Requisitions", value: stats.total, icon: FileStack, color: "from-primary/15 to-primary/5", iconColor: "text-primary" },
    { label: "New Requisitions", value: stats.isNew, icon: Clock, color: "from-accent/15 to-accent/5", iconColor: "text-accent" },
    { label: "Partially Tendered", value: stats.partial, icon: Activity, color: "from-warning/15 to-warning/5", iconColor: "text-warning" },
    { label: "Fully Tendered", value: stats.fullyTendered, icon: CheckCircle2, color: "from-success/15 to-success/5", iconColor: "text-success" },
  ];

  return (
    <AppShell>
      <Head title="Purchase Requisitions" />
      <PageHeader
        title="Purchase Requisitions"
        description="Purchase requisitions synced from your ERP system. Convert open requisitions into tenders."
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={sync} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Sync from ERP
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> Manual PR
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileStack className="h-4 w-4 text-primary" />
                    Create Purchase Requisition
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">PR number <span className="text-destructive">*</span></Label>
                      <Input className={errors.pr_number && "border-destructive focus-visible:ring-destructive"} value={form.pr_number} onChange={(e)=>setForm({...form, pr_number:e.target.value})} placeholder="PR-2025-010" />
                      {errors.pr_number && <p className="text-xs text-destructive">{errors.pr_number}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Department</Label>
                      <Input className={errors.department && "border-destructive focus-visible:ring-destructive"} value={form.department} onChange={(e)=>setForm({...form, department:e.target.value})} placeholder="e.g. IT, Production" />
                      {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Title <span className="text-destructive">*</span></Label>
                      <Input className={errors.title && "border-destructive focus-visible:ring-destructive"} value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} placeholder="e.g. Procurement of Laptops for HQ" />
                      {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Items <span className="text-destructive">*</span> <span className="text-[11px] text-muted-foreground lowercase normal-case">(Format: Name | Quantity | Unit - one per line)</span></Label>
                      <Textarea rows={4} className={errors.items && "border-destructive focus-visible:ring-destructive"} value={form.items} onChange={(e)=>setForm({...form, items:e.target.value})} placeholder="Dell Latitude 5440 | 15 | pcs&#10;Logitech Wireless Mouse | 20 | pcs" />
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
            <div className="text-2xl font-bold text-foreground font-display">{card.value}</div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={prs} exportFilename="purchase-requisitions" emptyMessage="No PRs synced. Click 'Sync from ERP'." searchPlaceholder="Search PRs..." />
      {sa.SweetAlert}
    </AppShell>
  );
}
