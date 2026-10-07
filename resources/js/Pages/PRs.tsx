import { useState, useMemo, useRef, useEffect } from "react";
import { Link, router, Head, usePage } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn, currencySymbol } from "@/lib/utils";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, RefreshCw, ChevronRight, Trash2, ExternalLink, FileStack, CheckCircle2, Clock, Activity } from "lucide-react";

export default function PRs({ prs }: any) {
  const { props } = usePage();
  const errors = (props as any).errors || {};
  const [open, setOpen] = useState(false);
  const blankItem = () => ({ name: "", qty: "1", unit: "pcs", approximate_price: "", currency: "BDT" });
  const [form, setForm] = useState({ pr_number: "", title: "", department: "", items: [blankItem()] });
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const sa = useSweetAlert();
  const itemsScrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest item row visible when appended
  useEffect(() => {
    itemsScrollRef.current?.scrollTo({ top: itemsScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [form.items.length]);

  const departments = useMemo(() => [...new Set(prs.map((p: any) => p.department).filter(Boolean))].sort(), [prs]);
  const statuses = useMemo(() => [...new Set(prs.map((p: any) => p.derived_status ?? p.status).filter(Boolean))].sort(), [prs]);

  const filteredPrs = useMemo(() => prs.filter((p: any) => {
    if (statusFilter && (p.derived_status ?? p.status) !== statusFilter) return false;
    if (deptFilter && p.department !== deptFilter) return false;
    return true;
  }), [prs, statusFilter, deptFilter]);

  const sync = async () => {
    const ok = await sa.confirmAction("Sync from ERP?", "Fetch latest purchase requisitions from the ERP system.", "Sync");
    if (!ok) return;
    router.post("/app/prs/sync", {}, {
      onSuccess: () => sa.alert("PRs synced", "Latest purchase requisitions have been synced.", "success"),
      onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
    });
  };

  const setItem = (i: number, field: string, value: string) => {
    const copy = [...form.items];
    copy[i] = { ...copy[i], [field]: value };
    setForm({ ...form, items: copy });
  };
  const addItem = () => setForm({ ...form, items: [...form.items, blankItem()] });
  const removeItem = (i: number) => {
    if (form.items.length === 1) return;
    setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  };

  const createManual = async () => {
    if (!form.pr_number.trim()) { sa.alert("PR number required", "Enter a PR number.", "error"); return; }
    if (!form.title.trim()) { sa.alert("Title required", "Enter a PR title.", "error"); return; }
    for (const [idx, it] of form.items.entries()) {
      if (!it.name.trim()) { sa.alert("Item name required", `Enter a name for item #${idx + 1}.`, "error"); return; }
      if (!it.qty || Number(it.qty) < 1) { sa.alert("Quantity required", `Enter a quantity of at least 1 for "${it.name || `item #${idx + 1}`}."`, "error"); return; }
      if (!it.unit.trim()) { sa.alert("Unit required", `Enter a unit for "${it.name || `item #${idx + 1}`}."`, "error"); return; }
      if (it.approximate_price !== "" && Number(it.approximate_price) < 0) { sa.alert("Invalid budget", `Approximate price for "${it.name}" cannot be negative.`, "error"); return; }
    }
    const ok = await sa.confirmAction("Create PR?", `Create PR "${form.pr_number}"?`, "Create");
    if (!ok) return;
    const items = form.items.map((it) => ({
      name: it.name.trim(),
      qty: Number(it.qty),
      unit: it.unit.trim() || "pcs",
      approximate_price: it.approximate_price === "" ? null : Number(it.approximate_price),
      currency: it.currency,
    }));
    router.post("/app/prs", { pr_number: form.pr_number, title: form.title, department: form.department, items }, {
      onSuccess: () => { setOpen(false); setForm({ pr_number:"",title:"",department:"",items:[blankItem()] }); sa.alert("PR created", `"${form.pr_number}" has been created.`, "success"); },
      onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
    });
  };

  const remove = async (pr: any) => {
    const ok = await sa.confirmDelete(pr.pr_number);
    if (!ok) return;
    router.delete(`/app/prs/${pr.id}`, {
      onSuccess: () => sa.alert("PR deleted", `"${pr.pr_number}" has been removed.`, "success"),
      onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
    });
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
      render: (r) => <span className="text-xs text-foreground whitespace-nowrap">{r.department ?? "—"}</span>
    },
    {
      key: "budget",
      label: "Est. Budget",
      sortable: false,
      render: (r) => {
        const budgeted = (r.items ?? []).filter((i: any) => i.approximate_price != null);
        if (budgeted.length === 0) return <span className="text-xs text-foreground/60">—</span>;
        const byCur: Record<string, number> = {};
        budgeted.forEach((i: any) => { const c = i.currency || "BDT"; byCur[c] = (byCur[c] ?? 0) + Number(i.approximate_price); });
        const parts = Object.entries(byCur).map(([c, sum]) => `${currencySymbol(c)}${Number(sum).toLocaleString()}`);
        return (
          <span className="font-mono text-xs font-bold text-foreground whitespace-nowrap" title={`${budgeted.length} item(s) budgeted`}>
            {parts.join(" + ")}
          </span>
        );
      }
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
            <div className="text-xs text-foreground truncate block">
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
      render: (r) => <span className="text-xs text-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</span>
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="shrink-0">
                  <DialogTitle className="flex items-center gap-2">
                    <FileStack className="h-4 w-4 text-primary" />
                    Create Purchase Requisition
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 overflow-y-auto flex-1 pr-1" ref={itemsScrollRef}>
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
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border/40">
                      <Label className="text-xs font-bold uppercase tracking-wider text-foreground/80">Items <span className="text-destructive">*</span></Label>
                      <Button size="sm" variant="outline" onClick={addItem} className="h-8 text-xs gap-1"><Plus className="h-3.5 w-3.5" /> Add Item</Button>
                    </div>
                    {errors.items && typeof errors.items === "string" && <p className="text-xs text-destructive">{errors.items}</p>}
                    <div className="space-y-3">
                      {form.items.map((it, i) => (
                        <div key={i} className="p-4 rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/15 space-y-3 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-foreground/60">Item #{i + 1}</span>
                            {form.items.length > 1 && (
                              <button onClick={() => removeItem(i)} className="text-xs font-semibold text-destructive hover:underline">Remove</button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2 space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Item Name *</Label>
                              <Input value={it.name} onChange={(e) => setItem(i, "name", e.target.value)} className="h-9 text-xs" placeholder="e.g. Dell Latitude 5440" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Qty *</Label>
                              <Input type="number" min="1" inputMode="numeric" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} className="h-9 text-xs" placeholder="15" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Unit *</Label>
                              <Input value={it.unit} onChange={(e) => setItem(i, "unit", e.target.value)} className="h-9 text-xs" placeholder="pcs" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Approx. Price <span className="normal-case font-medium">(in-house)</span></Label>
                              <Input type="number" min="0" step="0.01" inputMode="decimal" value={it.approximate_price} onChange={(e) => setItem(i, "approximate_price", e.target.value)} className="h-9 text-xs" placeholder="e.g. 50000" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Currency</Label>
                              <select value={it.currency} onChange={(e) => setItem(i, "currency", e.target.value)}
                                className="w-full h-9 rounded-xl border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-accent/25">
                                {["BDT", "USD", "EUR", "GBP", "INR"].map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter className="shrink-0 pt-4 border-t border-border/40">
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
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{card.label}</span>
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground font-display">{card.value}</div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={filteredPrs} exportFilename="purchase-requisitions" emptyMessage="No PRs match the current search / filters." searchPlaceholder="Search PRs..."
        filterable
        filters={
          <div className="flex flex-col sm:flex-row items-end gap-3.5">
            <div className="w-full sm:flex-1 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-foreground">Status</label>
              <select className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/25 transition-all" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                {statuses.map((s: any) => <option key={s} value={s}>{String(s).replace(/_/g, " ").toUpperCase()}</option>)}
              </select>
            </div>
            <div className="w-full sm:flex-1 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-foreground">Department</label>
              <select className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/25 transition-all" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="">All departments</option>
                {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {(statusFilter || deptFilter) && (
              <Button variant="outline" onClick={() => { setStatusFilter(""); setDeptFilter(""); }} className="w-full sm:w-auto h-10 px-5 shrink-0">Clear</Button>
            )}
          </div>
        }
      />
      {sa.SweetAlert}
    </AppShell>
  );
}
