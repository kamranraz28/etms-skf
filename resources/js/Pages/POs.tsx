import { useState } from "react";
import { Link, router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, RefreshCw, Trash2 } from "lucide-react";

export default function POs({ pos }: any) {
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
    });
  };
  const remove = async (po: any) => {
    const ok = await sa.confirmDelete(po.po_number);
    if (!ok) return;
    router.delete(`/app/pos/${po.id}`, { onSuccess: () => sa.alert("PO deleted", `"${po.po_number}" has been removed.`, "success") });
  };

  const columns: Column[] = [
    { key: "po_number", label: "PO Number", sortable: true, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.po_number}</span> },
    { key: "vendor_erp_code", label: "Vendor ERP", sortable: true, render: (r) => <span className="font-mono text-xs">{r.vendor_erp_code ?? "—"}</span> },
    { key: "po_date", label: "PO Date", sortable: true, render: (r) => <span className="text-xs whitespace-nowrap">{r.po_date ?? "—"}</span> },
    { key: "items", label: "Items", sortable: false, render: (r) => {
      const raw = r.items ?? [];
      const total = raw.reduce((s: number, i: any) => s + (i.total_price ?? 0), 0);
      const preview = raw.slice(0,2).map((i: any) => `${i.name} ×${i.qty}`).join(", ");
      return <span className="text-xs text-muted-foreground min-w-0 max-w-[200px] truncate block">{preview}{raw.length > 2 && ` +${raw.length - 2} more`} — <strong>৳{total.toLocaleString()}</strong></span>;
    }},
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: "created_at", label: "Synced", sortable: true, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</span> },
    {
      key: "actions" as string,
      label: "Action",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <div className="inline-flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(r); }} className="hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <Head title="Purchase Orders" />
      <PageHeader
        title="Purchase Orders"
        description="Synced from your ERP."
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={sync}><RefreshCw className="h-4 w-4" /> Sync from ERP (mock)</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Manual PO</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Purchase Order</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>PO number</Label><Input value={form.po_number} onChange={(e)=>setForm({...form, po_number:e.target.value})} placeholder="PO-2026-001" /></div>
                    <div className="space-y-1.5"><Label>Vendor ERP code</Label><Input value={form.vendor_erp_code} onChange={(e)=>setForm({...form, vendor_erp_code:e.target.value})} /></div>
                    <div className="space-y-1.5"><Label>PO date</Label><Input type="date" value={form.po_date} onChange={(e)=>setForm({...form, po_date:e.target.value})} /></div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label>Items <span className="text-xs text-muted-foreground">(one per line · Name | Qty | Unit Price)</span></Label>
                      <Textarea rows={4} value={form.items} onChange={(e)=>setForm({...form, items:e.target.value})} placeholder="Cisco Switch | 6 | 25000" />
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
      <DataTable columns={columns} data={pos} exportFilename="purchase-orders" emptyMessage="No POs synced. Click 'Sync from ERP'." searchPlaceholder="Search POs..." />
      {sa.SweetAlert}
    </AppShell>
  );
}
