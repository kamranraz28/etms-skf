import { useState } from "react";
import { Link, router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, RefreshCw, ChevronRight, Trash2, FileStack } from "lucide-react";

export default function PRs({ prs }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ pr_number: "", title: "", department: "", requested_by: "", items: "" });
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
      onSuccess: () => { setOpen(false); setForm({ pr_number:"",title:"",department:"",requested_by:"",items:"" }); sa.alert("PR created", `"${form.pr_number}" has been created.`, "success"); },
    });
  };
  const remove = async (pr: any) => {
    const ok = await sa.confirmDelete(pr.pr_number);
    if (!ok) return;
    router.delete(`/app/prs/${pr.id}`, { onSuccess: () => sa.alert("PR deleted", `"${pr.pr_number}" has been removed.`, "success") });
  };

  return (
    <AppShell>
      <Head title="Purchase Requisitions" />
      <PageHeader
        title="Purchase Requisitions"
        description="Synced from your ERP. Convert any PR into a tender to invite vendors."
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={sync}><RefreshCw className="h-4 w-4" /> Sync from ERP (mock)</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Manual PR</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Purchase Requisition</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>PR number</Label><Input value={form.pr_number} onChange={(e)=>setForm({...form, pr_number:e.target.value})} placeholder="PR-2025-010" /></div>
                    <div className="space-y-1.5"><Label>Department</Label><Input value={form.department} onChange={(e)=>setForm({...form, department:e.target.value})} /></div>
                    <div className="sm:col-span-2 space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} /></div>
                    <div className="sm:col-span-2 space-y-1.5"><Label>Requested by</Label><Input value={form.requested_by} onChange={(e)=>setForm({...form, requested_by:e.target.value})} /></div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label>Items <span className="text-xs text-muted-foreground">(one per line · Name | Qty | Unit)</span></Label>
                      <Textarea rows={4} value={form.items} onChange={(e)=>setForm({...form, items:e.target.value})} placeholder="Dell Latitude 5440 | 15 | pcs" />
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
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>PR Number</th><th>Title</th><th>Department</th><th>Items</th><th>Status</th><th>Synced</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {prs.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-12">No PRs synced. Click "Sync from ERP".</td></tr>}
              {prs.map((pr: any) => (
                <tr key={pr.id} className="group">
                  <td className="font-mono text-xs whitespace-nowrap">{pr.pr_number}</td>
                  <td className="font-medium min-w-0 max-w-[200px] truncate">{pr.title}</td>
                  <td className="text-xs whitespace-nowrap">{pr.department ?? "—"}</td>
                  <td className="text-xs text-muted-foreground min-w-0 max-w-[200px] truncate">
                    {(pr.items ?? []).slice(0,2).map((i: any) => `${i.name} ×${i.qty}`).join(", ")}
                    {pr.items && pr.items.length > 2 && ` +${pr.items.length - 2} more`}
                  </td>
                  <td><StatusBadge status={pr.status} /></td>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(pr.created_at).toLocaleDateString()}</td>
                  <td className="text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {pr.status === "new" && (
                        <Link href={`/app/tenders/new?pr=${pr.id}`}>
                          <Button size="sm" variant="outline">Create tender <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button>
                        </Link>
                      )}
                      <Button size="sm" variant="ghost" onClick={()=>remove(pr)} className="hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
