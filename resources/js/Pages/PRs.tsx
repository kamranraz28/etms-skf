import { useState } from "react";
import { Link, router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus, RefreshCw, ChevronRight, Trash2 } from "lucide-react";

export default function PRs({ prs }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ pr_number: "", title: "", department: "", requested_by: "", items: "" });

  const sync = () => router.post("/app/prs/sync");
  const createManual = () => {
    const items = form.items.split("\n").map((l) => l.trim()).filter(Boolean).map((line) => {
      const [name, qty, unit] = line.split("|").map((s) => s.trim());
      return { name, qty: Number(qty || 1), unit: unit || "pcs" };
    });
    router.post("/app/prs", { ...form, items }, { onSuccess: () => { setOpen(false); setForm({ pr_number:"",title:"",department:"",requested_by:"",items:"" }); } });
  };
  const remove = (pr: any) => { if (confirm(`Delete ${pr.pr_number}?`)) router.delete(`/app/prs/${pr.id}`); };

  return (
    <AppShell>
      <Head title="Purchase Requisitions" />
      <PageHeader
        title="Purchase Requisitions"
        description="Synced from your ERP. Convert any PR into a tender to invite vendors."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={sync}><RefreshCw className="h-4 w-4 mr-1" /> Sync from ERP (mock)</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Manual PR</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Purchase Requisition</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>PR number</Label><Input value={form.pr_number} onChange={(e)=>setForm({...form, pr_number:e.target.value})} placeholder="PR-2025-010" /></div>
                    <div><Label>Department</Label><Input value={form.department} onChange={(e)=>setForm({...form, department:e.target.value})} /></div>
                    <div className="col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} /></div>
                    <div className="col-span-2"><Label>Requested by</Label><Input value={form.requested_by} onChange={(e)=>setForm({...form, requested_by:e.target.value})} /></div>
                    <div className="col-span-2">
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

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr><th>PR Number</th><th>Title</th><th>Department</th><th>Items</th><th>Status</th><th>Synced</th><th className="text-right">Action</th></tr>
          </thead>
          <tbody>
            {prs.length === 0 && (
              <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No PRs synced. Click "Sync from ERP".</td></tr>
            )}
            {prs.map((pr: any) => (
              <tr key={pr.id}>
                <td className="font-mono text-xs">{pr.pr_number}</td>
                <td className="font-medium">{pr.title}</td>
                <td className="text-xs">{pr.department ?? "—"}</td>
                <td className="text-xs text-muted-foreground">
                  {(pr.items ?? []).slice(0,2).map((i: any) => `${i.name} ×${i.qty}`).join(", ")}
                  {pr.items && pr.items.length > 2 && ` +${pr.items.length - 2} more`}
                </td>
                <td><StatusBadge status={pr.status} /></td>
                <td className="text-xs text-muted-foreground">{new Date(pr.created_at).toLocaleDateString()}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-1">
                    {pr.status === "new" && (
                      <Link href={`/app/tenders/new?pr=${pr.id}`}>
                        <Button size="sm" variant="outline">Create tender <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button>
                      </Link>
                    )}
                    <Button size="sm" variant="ghost" onClick={()=>remove(pr)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
