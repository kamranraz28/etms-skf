import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Textarea } from "@/components/ui/textarea";
import { PageSharedProps } from "@/lib/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2, Download, Send, Upload, XCircle, Scale, FileText, UserCheck, Workflow, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

export default function CSShow({
  cs, items, selections, approvals, erpLogs, prItems, workflowTypes,
}: any) {
  const { props } = usePage<PageSharedProps>();
  const primary = props.auth.user?.primary_role;
  const userRoles = props.auth.user?.roles ?? [];
  const isProc = primary === "procurement" || primary === "admin";
  const isAdmin = primary === "admin";
  const [comment, setComment] = useState("");
  const [selectedWf, setSelectedWf] = useState("");
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

  const currentStep = cs.current_step;
  const canActOnCurrentStep = currentStep && (userRoles.includes(currentStep.role_name));

  const setSelected = (item_index: number, vendor_id: string) =>
    router.post(`/app/cs/${cs.id}/select`, { item_index, vendor_id }, { preserveScroll: true });

  const submitForApproval = () => {
    if (!selectedWf) { sa.alert("Select workflow", "Please select a workflow type before submitting.", "warning"); return; }
    sa.confirmAction("Submit for approval?", "Send this CS for review?", "Submit").then((ok) => {
      if (ok) router.post(`/app/cs/${cs.id}/submit`, { workflow_type_id: selectedWf }, {
        onSuccess: () => sa.alert("CS submitted", "The CS has been sent for review.", "success"),
        onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
      });
    });
  };

  const decide = (decision: "approved" | "declined" | "re_tendered") => {
    const labels: Record<string, string> = { approved: "Approve", declined: "Decline", re_tendered: "Re-tender" };
    const titles: Record<string, string> = { approved: "Approve CS?", declined: "Decline CS?", re_tendered: "Re-tender CS?" };
    const descs: Record<string, string> = {
      approved: "This will advance the CS to the next approval step.",
      declined: "This will return the CS to draft for revision.",
      re_tendered: "This will create a new tender for the same PR. Old logs are kept.",
    };
    sa.confirmAction(titles[decision], descs[decision], labels[decision]).then((ok) => {
      if (ok) router.post(`/app/cs/${cs.id}/decide`, { decision, comment }, {
        onSuccess: () => { setComment(""); sa.alert("Done", "CS " + labels[decision].toLowerCase() + "d", "success"); },
        onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
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



  const workflowSteps = cs.workflow_type?.steps ?? [];

  const approvalMap = useMemo(() => {
    const m: Record<number, any> = {};
    approvals.forEach((a: any) => {
      if (a.workflow_step_id) m[a.workflow_step_id] = a;
    });
    return m;
  }, [approvals]);

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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/40 to-muted/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Step</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Decision</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {workflowSteps.map((step: any) => {
                    const approval = approvalMap[step.id];
                    const isCurrent = cs.current_step_id === step.id;
                    return (
                      <tr key={step.id} className={`hover:bg-muted/20 transition-colors ${isCurrent ? "bg-accent/5" : ""}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {approval?.decision === "approved" ? (
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            ) : approval?.decision === "rejected" ? (
                              <XCircle className="h-4 w-4 text-destructive shrink-0" />
                            ) : approval?.decision === "re_tendered" ? (
                              <RefreshCw className="h-4 w-4 text-info shrink-0" />
                            ) : isCurrent ? (
                              <span className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-muted-foreground/30 shrink-0" />
                            )}
                            <span className={`font-semibold text-xs ${isCurrent ? "text-accent" : ""}`}>{step.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {approval ? (
                            <span className={`text-xs font-medium ${approval.decision === "approved" ? "text-success" : approval.decision === "rejected" ? "text-destructive" : "text-info"}`}>
                              {approval.decision === "rejected" ? "Declined" : approval.decision}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{approval?.actor?.full_name || "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{approval?.acted_at ? new Date(approval.acted_at).toLocaleString() : "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground italic max-w-[200px] truncate">{approval?.comment ? `"${approval.comment}"` : "—"}</td>
                      </tr>
                    );
                  })}
                  {workflowSteps.length === 0 && approvals.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">No approval actions yet.</td></tr>
                  )}
                  {workflowSteps.length === 0 && approvals.length > 0 && approvals.map((a: any) => (
                    <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {a.decision === "approved" ? (
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                          ) : a.decision === "rejected" ? (
                            <XCircle className="h-4 w-4 text-destructive shrink-0" />
                          ) : (
                            <RefreshCw className="h-4 w-4 text-info shrink-0" />
                          )}
                          <span className="font-semibold text-xs uppercase">{a.step}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${a.decision === "approved" ? "text-success" : "text-destructive"}`}>{a.decision}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.actor?.full_name || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{a.acted_at ? new Date(a.acted_at).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground italic max-w-[200px] truncate">{a.comment ? `"${a.comment}"` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {cs.tender_logs?.length > 0 && (
            <div className="panel overflow-hidden">
              <div className="panel-header bg-gradient-to-r from-card to-muted/20">
                <div className="panel-title"><RefreshCw className="h-4.5 w-4.5 text-info" /> Re-tender history</div>
              </div>
              <div className="divide-y divide-border/40">
                {cs.tender_logs.map((log: any) => (
                  <div key={log.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium">{log.actor?.full_name}</span>
                      <span className="text-xs text-muted-foreground ml-2">— {log.reason}</span>
                    </div>
                    <a href={`/app/tenders/${log.new_tender_id}`} className="text-xs text-accent underline">View new tender</a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="panel-title">Actions</div>
            {cs.status === "draft" && isProc && (
              <div className="space-y-3">
                <select
                  value={selectedWf}
                  onChange={(e) => setSelectedWf(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="">Select workflow...</option>
                  {workflowTypes.map((wt: any) => (
                    <option key={wt.id} value={wt.id}>{wt.name}</option>
                  ))}
                </select>
                <Button className="w-full" onClick={submitForApproval} disabled={!selectedWf}>
                  <Send className="h-4 w-4 mr-1" /> Submit for approval
                </Button>
              </div>
            )}
            {cs.status === "pending_approval" && (
              <div className="space-y-3">
                {currentStep && (
                  <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/40">
                    <span className="font-semibold text-foreground">Awaiting: {currentStep.label}</span>
                    <span className="block text-[10px] mt-0.5">Role: {currentStep.role_name}</span>
                  </div>
                )}
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment" rows={3} />
                {canActOnCurrentStep ? (
                  <div className="flex flex-col gap-2">
                    <Button className="w-full" onClick={() => decide("approved")}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button className="w-full" variant="destructive" onClick={() => decide("declined")}>
                      <XCircle className="h-4 w-4 mr-1" /> Decline
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => decide("re_tendered")}>
                      <RefreshCw className="h-4 w-4 mr-1" /> Re-tender
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Awaiting {currentStep?.label || "approver"} action. Your role does not match the current step.
                  </p>
                )}
              </div>
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
            {cs.status === "re_tendered" && (
              <div className="text-xs text-info bg-info/5 p-3 rounded-lg border border-info/20 font-medium">This CS was sent for re-tender.</div>
            )}
          </div>

          <div className="panel p-5 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Scale className="h-4 w-4 text-accent" /> Workflow
            </div>
            {cs.workflow_type ? (
              <>
                <div className="flex items-center gap-1.5 mb-2">
                  <Workflow className="h-3.5 w-3.5 text-accent" />
                  <span className="font-semibold text-foreground text-xs">{cs.workflow_type.name}</span>
                </div>
                <ol className="space-y-1.5 ml-1">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent/50 shrink-0" />
                    0. Procurement picks vendor per item (draft)
                  </li>
                  {workflowSteps.map((step: any, i: number) => {
                    const isCurrent = cs.current_step_id === step.id;
                    const done = approvals.some((a: any) => a.workflow_step_id === step.id && a.decision === "approved");
                    return (
                      <li key={step.id} className={`flex items-center gap-2 ${isCurrent ? "text-accent font-semibold" : done ? "text-success" : ""}`}>
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                        ) : isCurrent ? (
                          <span className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                        )}
                        {i + 1}. {step.label}
                      </li>
                    );
                  })}
                  <li className="flex items-center gap-2">
                    {cs.status === "approved" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                    )}
                    {workflowSteps.length + 1}. Admin pushes to ERP
                  </li>
                </ol>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 1. Procurement picks vendor per item (draft)</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 2. Select workflow type and submit</div>
              </>
            )}
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
