import { useEffect, useMemo, useState } from "react";
import { router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function TenderNew({ prs, vendors, preselect_pr }: any) {
  const [prId, setPrId] = useState(preselect_pr ?? "");
  const [tenderNumber, setTenderNumber] = useState(`TND-${new Date().getFullYear()}-${Math.floor(100+Math.random()*900)}`);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(() => { const d = new Date(); d.setDate(d.getDate()+7); return d.toISOString().slice(0,16); });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (prId && !title) { const pr = prs.find((p: any) => p.id === prId); if (pr) setTitle(pr.title); } }, [prId]);

  const eligible = useMemo(() => vendors.filter((v: any) => v.status === "active"), [vendors]);
  const others = useMemo(() => vendors.filter((v: any) => v.status !== "active"), [vendors]);
  const toggle = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); };

  const submit = () => {
    setSaving(true);
    router.post("/app/tenders", {
      tender_number: tenderNumber, pr_id: prId, title, description, deadline,
      vendor_ids: Array.from(selected),
    }, { onFinish: () => setSaving(false) });
  };

  return (
    <AppShell>
      <Head title="Create tender" />
      <PageHeader title="Create tender" description="Convert a PR into a tender and invite eligible vendors." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 panel p-5 space-y-4">
          <div>
            <Label>From Purchase Requisition</Label>
            <select value={prId} onChange={(e)=>setPrId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">— Select PR —</option>
              {prs.map((p: any) => <option key={p.id} value={p.id}>{p.pr_number} · {p.title}{p.status==="tendered"?" (already tendered)":""}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Tender number</Label><Input value={tenderNumber} onChange={(e)=>setTenderNumber(e.target.value)} /></div>
            <div><Label>Submission deadline</Label><Input type="datetime-local" value={deadline} onChange={(e)=>setDeadline(e.target.value)} /></div>
          </div>
          <div><Label>Title</Label><Input value={title} onChange={(e)=>setTitle(e.target.value)} /></div>
          <div><Label>Description / scope</Label><Textarea rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={()=>history.back()}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>{saving?"Creating…":"Create tender"}</Button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div className="panel-title">Invite vendors</div><div className="text-xs text-muted-foreground">{selected.size} selected</div></div>
          <div className="max-h-[480px] overflow-y-auto">
            {eligible.length === 0 && <div className="p-4 text-sm text-muted-foreground">No active vendors. Activate vendors first.</div>}
            {eligible.map((v: any) => (
              <label key={v.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-border hover:bg-muted/50 cursor-pointer">
                <Checkbox checked={selected.has(v.id)} onCheckedChange={()=>toggle(v.id)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{v.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{v.email}</div>
                  <div className="text-[10px] mt-0.5">
                    {v.erp_code ? <span className="text-success">ERP: {v.erp_code}</span> : <span className="text-warning">No ERP code · cannot be awarded</span>}
                  </div>
                </div>
              </label>
            ))}
            {others.length > 0 && (
              <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40 border-y">Inactive / pending ({others.length})</div>
            )}
            {others.map((v: any) => (
              <div key={v.id} className="flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground border-b border-border">
                <span className="h-4 w-4" /><span className="flex-1 truncate">{v.name}</span><span className="capitalize">{v.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
