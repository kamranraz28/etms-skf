import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { PageSharedProps, VendorStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Head, router, usePage } from "@inertiajs/react";
import { Pencil, Plus, ShieldCheck, ShieldOff, Trash2, Building2, Users, Clock, Ban, Tag } from "lucide-react";
import { useMemo, useState } from "react";

export default function Vendors({ vendors, categories }: any) {
  const { props } = usePage<PageSharedProps>();
  const errors = (props as any).errors || {};
  const isAdmin = !!props.auth.user?.roles.includes("admin");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", status: "pending" as VendorStatus, vendor_category_ids: [] as number[] });
  const sa = useSweetAlert();

  const openNew = () => { setEditing(null); setForm({ name:"",email:"",phone:"",notes:"",status:"pending",vendor_category_ids:[] }); setOpen(true); };
  const openEdit = (v: any) => { setEditing(v); setForm({ name:v.name,email:v.email,phone:v.phone??"",notes:v.notes??"",status:v.status,vendor_category_ids:v.categories?.map((c:any)=>c.id)??[] }); setOpen(true); };

  const save = async () => {
    if (saving) return; setSaving(true);
    const confirmed = await sa.confirmAction(editing ? "Update vendor?" : "Create vendor?", `Save vendor "${form.name}"?`, "Save");
    if (!confirmed) { setSaving(false); return; }
    if (editing) router.put(`/app/vendors/${editing.id}`, form, {
      onSuccess: () => { setOpen(false); setSaving(false); sa.alert("Vendor updated", `"${form.name}" has been updated.`, "success"); },
      onError: () => setSaving(false),
    });
    else router.post(`/app/vendors`, form, {
      onSuccess: () => { setOpen(false); setSaving(false); sa.alert("Vendor created", `"${form.name}" has been created.`, "success"); },
      onError: () => setSaving(false),
    });
  };

  const setStatus = async (v: any, status: VendorStatus) => {
    const label = status === "active" ? "activate" : "blacklist";
    const ok = await sa.confirmAction(`${status === "active" ? "Activate" : "Blacklist"} vendor?`, `Are you sure you want to ${label} "${v.name}"?`, status === "active" ? "Activate" : "Blacklist");
    if (!ok) return;
    router.put(`/app/vendors/${v.id}`, { ...v, status }, {
      onSuccess: () => sa.alert("Status updated", `"${v.name}" is now ${status}.`, status === "active" ? "success" : "warning"),
    });
  };

  const remove = async (v: any) => {
    const ok = await sa.confirmDelete(v.name);
    if (!ok) return;
    router.delete(`/app/vendors/${v.id}`, { onSuccess: () => sa.alert("Vendor deleted", `"${v.name}" has been removed.`, "success") });
  };

  // Summary stats
  const stats = useMemo(() => ({
    total: vendors.length,
    active: vendors.filter((v: any) => v.status === "active").length,
    pending: vendors.filter((v: any) => v.status === "pending").length,
    blacklisted: vendors.filter((v: any) => v.status === "blacklisted").length,
  }), [vendors]);

  const baseColumns: Column[] = [
    {
      key: "name", label: "Vendor", sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {r.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "categories", label: "Categories", sortable: false,
      render: (r) => (r.categories ?? []).length > 0
        ? <div className="flex flex-wrap gap-1">{r.categories.map((c: any) => <span key={c.id} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold border border-accent/15">{c.name}</span>)}</div>
        : <span className="text-xs text-muted-foreground/50">—</span>,
    },
    { key: "phone", label: "Phone", sortable: false, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{r.phone ?? "—"}</span> },
    {
      key: "erp_code", label: "ERP Code", sortable: true,
      render: (r) => (
        <span className={cn("font-mono text-xs px-2 py-0.5 rounded-md whitespace-nowrap", r.erp_code ? "bg-muted/50" : "bg-warning/8 text-warning")}>
          {r.erp_code ?? "Not mapped"}
        </span>
      ),
    },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: "created_at", label: "Created", sortable: true, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</span> },
    ...(isAdmin ? [{
      key: "actions" as string,
      label: "Actions",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <div className="inline-flex items-center gap-1">
          {r.status !== "active" && <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setStatus(r, "active"); }} className="h-7 w-7 p-0 hover:bg-success/10" title="Activate"><ShieldCheck className="h-3.5 w-3.5 text-success" /></Button>}
          {r.status !== "blacklisted" && <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setStatus(r, "blacklisted"); }} className="h-7 w-7 p-0 hover:bg-destructive/10" title="Blacklist"><ShieldOff className="h-3.5 w-3.5 text-destructive" /></Button>}
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="h-7 w-7 p-0" title="Edit"><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(r); }} className="h-7 w-7 p-0 hover:bg-destructive/10" title="Delete"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
        </div>
      ),
    }] : []),
  ];

  const summaryCards = [
    { label: "Total Vendors", value: stats.total, icon: Users, color: "from-primary/15 to-primary/5", iconColor: "text-primary" },
    { label: "Active", value: stats.active, icon: ShieldCheck, color: "from-success/15 to-success/5", iconColor: "text-success" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "from-warning/15 to-warning/5", iconColor: "text-warning" },
    { label: "Blacklisted", value: stats.blacklisted, icon: Ban, color: "from-destructive/15 to-destructive/5", iconColor: "text-destructive" },
  ];

  return (
    <AppShell>
      <Head title="Vendors" />
      <PageHeader
        title="Vendors"
        description="Master list of suppliers. ERP code is required before a vendor can be selected for award."
        actions={isAdmin ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="gap-2">
                <Plus className="h-4 w-4" /> New Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  {editing ? "Edit Vendor" : "Create Vendor"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Name <span className="text-destructive">*</span></Label>
                    <Input className={errors.name && "border-destructive"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Vendor company name" />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Email <span className="text-destructive">*</span></Label>
                    <Input type="email" className={errors.email && "border-destructive"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="vendor@company.com" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Phone <span className="text-destructive">*</span></Label>
                    <Input className={errors.phone && "border-destructive"} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880..." />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Status <span className="text-destructive">*</span></Label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VendorStatus })}
                      className={cn("w-full h-10 rounded-xl border bg-background px-3 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20", errors.status && "border-destructive")}>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="blacklisted">Blacklisted</option>
                    </select>
                    {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Categories <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-border/60 bg-muted/20 min-h-[60px]">
                    {categories.map((cat: any) => (
                      <label key={cat.id} className={cn(
                        "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-all duration-150",
                        form.vendor_category_ids.includes(cat.id)
                          ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                          : "bg-background text-muted-foreground border-border/50 hover:border-primary/30",
                      )}>
                        <input type="checkbox" value={cat.id}
                          checked={form.vendor_category_ids.includes(cat.id)}
                          onChange={(e) => {
                            const ids = e.target.checked
                              ? [...form.vendor_category_ids, cat.id]
                              : form.vendor_category_ids.filter((id) => id !== cat.id);
                            setForm({ ...form, vendor_category_ids: ids });
                          }}
                          className="sr-only" />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                  {errors.vendor_category_ids && <p className="text-xs text-destructive">{errors.vendor_category_ids}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Notes</Label>
                  <Textarea rows={3} className={errors.notes && "border-destructive"} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes about this vendor..." />
                  {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save} disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Create vendor"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger-children">
        {summaryCards.map((card, i) => (
          <div key={i} className={`relative bg-card border border-border/50 rounded-2xl p-4 overflow-hidden hover-lift`}>
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

      <DataTable columns={baseColumns} data={vendors} exportFilename="vendors" emptyMessage="No vendors yet." searchPlaceholder="Search vendors..." />
      {sa.SweetAlert}
    </AppShell>
  );
}
