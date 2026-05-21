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
import { Pencil, Plus, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Vendors({ vendors, categories }: any) {
  const { props } = usePage<PageSharedProps>();
  const errors = (props as any).errors || {};
  const isAdmin = !!props.auth.user?.roles.includes("admin");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "", status: "pending" as VendorStatus, vendor_category_id: "" });
  const sa = useSweetAlert();

  const openNew = () => { setEditing(null); setForm({ name:"",email:"",phone:"",notes:"",status:"pending",vendor_category_id:"" }); setOpen(true); };
  const openEdit = (v: any) => { setEditing(v); setForm({ name:v.name,email:v.email,phone:v.phone??"",notes:v.notes??"",status:v.status,vendor_category_id:v.vendor_category_id??"" }); setOpen(true); };
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

  const baseColumns: Column[] = [
    { key: "name", label: "Vendor", sortable: true, render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.email}</div></div> },
    { key: "vendor_category", label: "Category", sortable: false, render: (r) => <span className="text-xs whitespace-nowrap">{r.vendor_category?.name ?? "—"}</span> },
    { key: "phone", label: "Phone", sortable: false, render: (r) => <span className="text-xs whitespace-nowrap">{r.phone ?? "—"}</span> },
    { key: "erp_code", label: "ERP code", sortable: true, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.erp_code ?? <span className="text-warning font-medium">Not mapped</span>}</span> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: "created_at", label: "Created", sortable: true, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</span> },
    ...(isAdmin ? [{
      key: "actions" as string,
      label: "Actions",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <div className="inline-flex items-center gap-1">
          {r.status !== "active" && <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setStatus(r, "active"); }} className="hover:bg-success/10"><ShieldCheck className="h-4 w-4 text-success" /></Button>}
          {r.status !== "blacklisted" && <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setStatus(r, "blacklisted"); }} className="hover:bg-destructive/10"><ShieldOff className="h-4 w-4 text-destructive" /></Button>}
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(r); }}><Pencil className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(r); }} className="hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <AppShell>
      <Head title="Vendors" />
      <PageHeader
        title="Vendors"
        description="Master list of suppliers. ERP code is required before a vendor can be selected for award."
        actions={isAdmin ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4" /> New vendor</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit vendor" : "Create vendor"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name <span className="text-destructive">*</span></Label>
                    <Input className={errors.name && "border-destructive focus-visible:ring-destructive"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email <span className="text-destructive">*</span></Label>
                    <Input type="email" className={errors.email && "border-destructive focus-visible:ring-destructive"} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone <span className="text-destructive">*</span></Label>
                    <Input className={errors.phone && "border-destructive focus-visible:ring-destructive"} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status <span className="text-destructive">*</span></Label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VendorStatus })}
                      className={cn("w-full h-10 rounded-lg border bg-background/80 px-3 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring", errors.status && "border-destructive")}>
                      <option value="pending">Pending</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="blacklisted">Blacklisted</option>
                    </select>
                    {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category <span className="text-destructive">*</span></Label>
                    <select value={form.vendor_category_id} onChange={(e) => setForm({ ...form, vendor_category_id: e.target.value })}
                      className={cn("w-full h-10 rounded-lg border bg-background/80 px-3 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring", errors.vendor_category_id && "border-destructive")}>
                      <option value="">Select a category</option>
                      {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    {errors.vendor_category_id && <p className="text-xs text-destructive">{errors.vendor_category_id}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Textarea rows={3} className={errors.notes && "border-destructive focus-visible:ring-destructive"} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      />
      <DataTable columns={baseColumns} data={vendors} exportFilename="vendors" emptyMessage="No vendors yet." searchPlaceholder="Search vendors..." />
      {sa.SweetAlert}
    </AppShell>
  );
}
