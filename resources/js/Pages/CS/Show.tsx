import { useState, useMemo } from "react";
import { router, usePage, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, CheckCircle2, XCircle, Upload } from "lucide-react";
import { PageSharedProps } from "@/lib/types";

export default function CSShow({ cs, items, selections, approvals, erpLogs, prItems }: any) {
  const { props } = usePage<PageSharedProps>();
  const primary = props.auth.user?.primary_role;
  const isProc = primary === "procurement" || primary === "admin";
  const isApprover = primary === "approver";
  const isAdmin = primary === "admin";
  const [comment, setComment] = useState("");

  // group selections by item_index
  const matrix = useMemo(() => {
    const m: Record<number, any[]> = {};
    selections.forEach((s: any) => { (m[s.item_index] ??= []).push(s); });
    return m;
  }, [selections]);
  const vendorsInCs: any[] = useMemo(() => {
    const seen = new Map<string, any>();
    selections.forEach((s: any) => { if (!seen.has(s.vendor_id)) seen.set(s.vendor_id, s.vendor); });
    return Array.from(seen.values());
  }, [selections]);

  const setSelected = (item_index: number, vendor_id: string) =>
    router.post(`/app/cs/${cs.id}/select`, { item_index, vendor_id }, { preserveScroll: true });

  const submitForApproval = () => router.post(`/app/cs/${cs.id}/submit`);
  const decide = (decision: "approved"|"rejected") => router.post(`/app/cs/${cs.id}/decide`, { decision, comment }, { onSuccess: ()=>setComment("") });
  const sendToErp = () => router.post(`/app/cs/${cs.id}/erp`);

  const lowest = items[0];
  const lastErp = erpLogs[0];
  const erpDone = lastErp?.status === "success";

  return (
    <AppShell>
      <Head title={`CS · ${cs.tender?.tender_number ?? ""}`} />
      <Button variant="ghost" size="sm" onClick={()=>history.back()} className="mb-2"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
      <PageHeader title={`CS · ${cs.tender?.tender_number ?? ""}`} description={cs.tender?.title} actions={<StatusBadge status={cs.status} />} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor totals */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Bid comparison (vendor totals)</div></div>
            <table className="data-table">
              <thead><tr><th>Rank</th><th>Vendor</th><th>ERP</th><th className="text-right">Total price</th><th>Status</th></tr></thead>
              <tbody>
                {items.length === 0 && <tr><td colSpan={5} className="text-center text-muted-foreground py-6">No bids in this CS.</td></tr>}
                {items.map((it: any) => (
                  <tr key={it.id} className={lowest?.id === it.id ? "bg-success/5" : ""}>
                    <td className="font-mono text-xs">L{it.rank}{it.rank===1 && <span className="ml-1 text-[10px] uppercase text-success">low</span>}</td>
                    <td className="font-medium">{it.vendor?.name}</td>
                    <td className="font-mono text-xs">{it.vendor?.erp_code ?? <span className="text-warning">—</span>}</td>
                    <td className="text-right font-mono">{Number(it.total_price).toLocaleString()}</td>
                    <td>{it.selected ? <StatusBadge status="selected" /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Per-item matrix */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Per-item award matrix</div></div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th><th>Qty</th>
                  {vendorsInCs.map((v) => <th key={v.id} className="text-right">{v.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {prItems.map((pr: any, idx: number) => {
                  const row = matrix[idx] ?? [];
                  const lowestUnit = Math.min(...row.map((r: any) => Number(r.unit_price)));
                  return (
                    <tr key={idx}>
                      <td>{pr.name}</td>
                      <td className="text-xs">{pr.qty} {pr.unit}</td>
                      {vendorsInCs.map((v) => {
                        const s = row.find((r: any) => r.vendor_id === v.id);
                        if (!s) return <td key={v.id} className="text-right text-xs text-muted-foreground">—</td>;
                        const isLow = Number(s.unit_price) === lowestUnit;
                        return (
                          <td key={v.id} className={`text-right ${isLow ? "bg-success/5" : ""}`}>
                            <div className="font-mono text-xs">{Number(s.unit_price).toLocaleString()}{isLow && <span className="ml-1 text-[10px] uppercase text-success">low</span>}</div>
                            {cs.status === "draft" ? (
                              <label className="flex items-center justify-end gap-1.5 cursor-pointer text-[11px] mt-1">
                                <input type="radio" name={`pick-${idx}`} checked={!!s.selected}
                                  onChange={()=>setSelected(idx, v.id)} className="h-3.5 w-3.5 accent-primary" />
                                Award
                              </label>
                            ) : s.selected ? (
                              <span className="text-[10px] uppercase text-success">selected</span>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Approval timeline */}
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Approval history</div></div>
            <ul className="divide-y divide-border">
              {approvals.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">No actions yet.</li>}
              {approvals.map((a: any) => (
                <li key={a.id} className="px-4 py-3 flex items-start gap-3">
                  {a.decision === "approved" ? <CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive mt-0.5" />}
                  <div className="text-sm">
                    <div><span className="font-medium uppercase text-xs">{a.step}</span> · {a.decision}
                      <span className="ml-2 text-xs text-muted-foreground">{new Date(a.acted_at).toLocaleString()}</span>
                    </div>
                    {a.comment && <div className="text-xs text-muted-foreground mt-0.5">"{a.comment}"</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {erpLogs.length > 0 && (
            <div className="panel">
              <div className="panel-header"><div className="panel-title">ERP sync log</div></div>
              <ul className="divide-y divide-border">
                {erpLogs.map((l: any) => (
                  <li key={l.id} className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={l.status} />
                      <span className="text-xs text-muted-foreground">{new Date(l.synced_at).toLocaleString()}</span>
                    </div>
                    <pre className="mt-2 text-[11px] bg-muted/40 p-2 rounded overflow-auto max-h-40">{JSON.stringify(l.response_data, null, 2)}</pre>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="panel p-4 space-y-3">
            <div className="panel-title">Actions</div>
            {cs.status === "draft" && isProc && (
              <Button className="w-full" onClick={submitForApproval}><Send className="h-4 w-4 mr-1" /> Submit for approval</Button>
            )}
            {(cs.status === "pending_approver" || cs.status === "pending_admin") && (
              <>
                <Textarea value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="Optional comment" rows={3} />
                {((cs.status === "pending_approver" && isApprover) || (cs.status === "pending_admin" && isAdmin)) ? (
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={()=>decide("approved")}><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</Button>
                    <Button className="flex-1" variant="destructive" onClick={()=>decide("rejected")}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Awaiting {cs.status === "pending_approver" ? "approver" : "admin"} action.</p>
                )}
              </>
            )}
            {cs.status === "approved" && isAdmin && !erpDone && (
              <Button className="w-full" onClick={sendToErp}><Upload className="h-4 w-4 mr-1" /> Send to ERP</Button>
            )}
            {cs.status === "approved" && erpDone && (
              <div className="text-xs text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Pushed to ERP · ref {lastErp?.response_data?.erp_reference}</div>
            )}
            {cs.status === "rejected" && <p className="text-xs text-destructive">This CS was rejected.</p>}
          </div>
          <div className="panel p-4 text-xs text-muted-foreground space-y-1">
            <div className="panel-title text-foreground mb-1">Workflow</div>
            <div>1. Procurement picks vendor per item (draft)</div>
            <div>2. Submit → pending approver</div>
            <div>3. Approver decides → pending admin</div>
            <div>4. Admin decides → approved</div>
            <div>5. Admin pushes to ERP</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
