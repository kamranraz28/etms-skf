import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Textarea } from "@/components/ui/textarea";
import { PageSharedProps } from "@/lib/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2, Download, Send, Upload, XCircle, Scale, FileText, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";

export default function CSShow({
  cs, items, selections, approvals, erpLogs, prItems,
}: any) {
  const { props } = usePage<PageSharedProps>();
  const primary = props.auth.user?.primary_role;
  const isProc = primary === "procurement" || primary === "admin";
  const isApprover = primary === "approver";
  const isAdmin = primary === "admin";
  const [comment, setComment] = useState("");
  const sa = useSweetAlert();

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
  const submitForApproval = () =>
    sa.confirmAction("Submit for approval?", "Send this CS for review?", "Submit").then((ok) => {
      if (ok) router.post(`/app/cs/${cs.id}/submit`, {}, { onSuccess: () => sa.alert("CS submitted", "The CS has been sent for review.", "success") });
    });
  const decide = (decision: "approved" | "rejected") => {
    const title = decision === "approved" ? "Approve CS?" : "Reject CS?";
    sa.confirmAction(title, decision === "approved" ? "This will mark the CS as approved." : "This will mark the CS as rejected.", decision === "approved" ? "Approve" : "Reject").then((ok) => {
      if (ok) router.post(`/app/cs/${cs.id}/decide`, { decision, comment }, {
        onSuccess: () => { setComment(""); sa.alert(decision === "approved" ? "CS approved" : "CS rejected", "...", decision === "approved" ? "success" : "warning"); },
      });
    });
  };
  const sendToErp = () =>
    sa.confirmAction("Send to ERP?", "This will push the award to the ERP system.", "Send").then((ok) => {
      if (ok) router.post(`/app/cs/${cs.id}/erp`, {}, { onSuccess: () => sa.alert("Sent to ERP", "The award has been pushed to the ERP system.", "success") });
    });

  const lowest = items[0];
  const lastErp = erpLogs[0];
  const erpDone = lastErp?.status === "success";

  const comparisonColumns: Column[] = [
    {
      key: "rank",
      label: "Rank",
      sortable: true,
      render: (r: any) => (
        <span className="font-mono text-xs whitespace-nowrap">
          L{r.rank}
          {r.rank === 1 && <span className="ml-1 text-[10px] uppercase text-success font-semibold">low</span>}
        </span>
      ),
    },
    { key: "vendor_name", label: "Vendor", sortable: false, render: (r: any) => <span className="font-medium whitespace-nowrap">{r.vendor?.name}</span> },
    { key: "erp_code", label: "ERP", sortable: false, render: (r: any) => <span className="font-mono text-xs whitespace-nowrap">{r.vendor?.erp_code ?? <span className="text-warning">—</span>}</span> },
    { key: "total_price", label: "Total price", sortable: true, className: "text-right", render: (r) => <span className="font-mono whitespace-nowrap">{Number(r.total_price).toLocaleString()}</span> },
    { key: "selected", label: "Status", sortable: false, render: (r) => r.selected ? <StatusBadge status="selected" /> : <span className="text-xs text-muted-foreground">—</span> },
  ];

  const approvalColumns: Column[] = [
    {
      key: "step",
      label: "Step",
      sortable: false,
      render: (a: any) => (
        <div className="flex items-center gap-2">
          {a.decision === "approved" ? (
            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive shrink-0" />
          )}
          <span className="font-bold uppercase text-xs">{a.step}</span>
        </div>
      ),
    },
    { key: "decision", label: "Decision", sortable: false, render: (a) => <span>{a.decision}</span> },
    { key: "acted_at", label: "Date", sortable: true, render: (a) => <span className="text-xs text-muted-foreground">{new Date(a.acted_at).toLocaleString()}</span> },
    { key: "comment", label: "Comment", sortable: false, render: (a) => a.comment ? <span className="text-xs text-muted-foreground italic">"{a.comment}"</span> : <span className="text-xs text-muted-foreground">—</span> },
  ];

  return (
    <AppShell>
      <Head title={`CS · ${cs.tender?.tender_number ?? ""}`} />
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <PageHeader
        title={`CS · ${cs.tender?.tender_number ?? ""}`}
        description={cs.tender?.title}
        actions={<StatusBadge status={cs.status} />}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="panel overflow-hidden">
            <div className="panel-header bg-gradient-to-r from-card to-muted/20">
              <div className="panel-title"><Scale className="h-4.5 w-4.5 text-accent" /> Bid comparison (vendor totals)</div>
            </div>
            <DataTable
              columns={comparisonColumns}
              data={items}
              rowClassName={(r: any) => lowest?.id === r.id ? "bg-success/5" : ""}
              searchable={false}
              exportable={false}
              hidePageSize
              pageSize={50}
              compact
              emptyMessage="No bids."
            />
          </div>

          <div className="panel overflow-hidden">
            <div className="panel-header bg-gradient-to-r from-card to-muted/20">
              <div className="panel-title"><FileText className="h-4.5 w-4.5 text-primary" /> Per-item award matrix</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/40 to-muted/20">
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Item</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Qty</th>
                    {vendorsInCs.map((v) => (
                      <th key={v.id} className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 whitespace-nowrap">{v.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {prItems.map((pr: any, idx: number) => {
                    const row = matrix[idx] ?? [];
                    const lowestUnit = Math.min(...row.map((r: any) => Number(r.unit_price)));
                    return (
                      <tr key={idx} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap font-medium">{pr.name}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">{pr.qty} {pr.unit}</td>
                        {vendorsInCs.map((v) => {
                          const s = row.find((r: any) => r.vendor_id === v.id);
                          if (!s) return <td key={v.id} className="px-4 py-3 text-right text-xs text-muted-foreground">—</td>;
                          const isLow = Number(s.unit_price) === lowestUnit;
                          return (
                            <td key={v.id} className={`px-4 py-3 text-right whitespace-nowrap ${isLow ? "bg-success/5" : ""}`}>
                              <div className="font-mono text-xs">
                                {Number(s.unit_price).toLocaleString()}
                                {isLow && <span className="ml-1 text-[10px] uppercase text-success font-semibold">low</span>}
                              </div>
                              {cs.status === "draft" ? (
                                <label className="flex items-center justify-end gap-1.5 cursor-pointer text-[11px] mt-1">
                                  <input type="radio" name={`pick-${idx}`} checked={!!s.selected} onChange={() => setSelected(idx, v.id)} className="h-3.5 w-3.5 accent-primary" />
                                  Award
                                </label>
                              ) : s.selected ? (
                                <span className="text-[10px] uppercase text-success font-semibold">selected</span>
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
          </div>

          <div className="panel overflow-hidden">
            <div className="panel-header bg-gradient-to-r from-card to-muted/20">
              <div className="panel-title"><UserCheck className="h-4.5 w-4.5 text-accent" /> Approval history</div>
            </div>
            <DataTable
              columns={approvalColumns}
              data={approvals}
              searchable={false}
              exportable={false}
              hidePageSize
              pageSize={50}
              compact
              emptyMessage="No actions yet."
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="panel-title">Actions</div>
            {cs.status === "draft" && isProc && (
              <Button className="w-full" onClick={submitForApproval}><Send className="h-4 w-4 mr-1" /> Submit for approval</Button>
            )}
            {(cs.status === "pending_approver" || cs.status === "pending_admin") && (
              <>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment" rows={3} />
                {(cs.status === "pending_approver" && isApprover) || (cs.status === "pending_admin" && isAdmin) ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex-1" onClick={() => decide("approved")}><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</Button>
                    <Button className="flex-1" variant="destructive" onClick={() => decide("rejected")}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
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
              <div className="text-xs text-success flex items-center gap-1.5 bg-success/5 p-3 rounded-lg border border-success/20">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Pushed to ERP · ref {lastErp?.response_data?.erp_reference}
              </div>
            )}
            {cs.status === "approved" && (
              <a href={`/app/cs/${cs.id}/pdf`} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full" variant="outline"><Download className="h-4 w-4 mr-1" /> Download CS (PDF)</Button>
              </a>
            )}
            {cs.status === "rejected" && (
              <div className="text-xs text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/20 font-medium">This CS was rejected.</div>
            )}
          </div>
          <div className="panel p-5 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Scale className="h-4 w-4 text-accent" /> Workflow
            </div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 1. Procurement picks vendor per item (draft)</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 2. Submit → pending approver</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 3. Approver decides → pending admin</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 4. Admin decides → approved</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 5. Admin pushes to ERP</div>
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
