import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Textarea } from "@/components/ui/textarea";
import { PageSharedProps } from "@/lib/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2, Download, Send, Upload, XCircle, Scale, FileText, UserCheck, Workflow, RefreshCw, Wand2, Save } from "lucide-react";
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
  const [savingAwards, setSavingAwards] = useState<Record<number, boolean>>({});
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

  const [draftQtys, setDraftQtys] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    selections.forEach((s: any) => { init[`${s.item_index}-${s.vendor_id}`] = Number(s.qty ?? 0); });
    return init;
  });

  const currentStep = cs.current_step;
  const canActOnCurrentStep = currentStep && (userRoles.includes(currentStep.role_name));

  const updateQty = (itemIdx: number, vendorId: string, val: string) => {
    const key = `${itemIdx}-${vendorId}`;
    setDraftQtys(prev => ({ ...prev, [key]: Math.max(0, Number(val) || 0) }));
  };

  const autoFill = (itemIdx: number) => {
    const row = matrix[itemIdx] ?? [];
    if (row.length === 0) return;
    const prItem = prItems[itemIdx];
    if (!prItem) return;
    const requested = Number(prItem.qty);
    const lowest = row.reduce((a: any, b: any) => Number(a.unit_price) < Number(b.unit_price) ? a : b);
    const newQtys: Record<string, number> = {};
    row.forEach((s: any) => { newQtys[`${itemIdx}-${s.vendor_id}`] = 0; });
    newQtys[`${itemIdx}-${lowest.vendor_id}`] = requested;
    setDraftQtys(prev => ({ ...prev, ...newQtys }));
  };

  const saveAwards = (itemIdx: number) => {
    const row = matrix[itemIdx] ?? [];
    const prItem = prItems[itemIdx];
    if (!prItem) return;
    const awards = row.map((s: any) => ({
      vendor_id: s.vendor_id,
      qty: draftQtys[`${itemIdx}-${s.vendor_id}`] ?? 0,
    }));
    const total = awards.reduce((sum: number, a: any) => sum + a.qty, 0);
    if (total > Number(prItem.qty)) {
      sa.alert("Qty exceeded", `Total awarded (${total}) exceeds requested (${prItem.qty}).`, "error");
      return;
    }
    setSavingAwards(prev => ({ ...prev, [itemIdx]: true }));
    router.post(`/app/cs/${cs.id}/award`, { item_index: itemIdx, awards }, {
      preserveScroll: true,
      onFinish: () => setSavingAwards(prev => ({ ...prev, [itemIdx]: false })),
    });
  };

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
      re_tendered: "A new tender will be created from the same PR with a 7-day deadline. Old logs are kept.",
    };
    sa.confirmAction(titles[decision], descs[decision], labels[decision]).then((ok) => {
      if (ok) router.post(`/app/cs/${cs.id}/decide`, { decision, comment }, {
        onSuccess: () => { setComment(""); sa.alert("Done", "CS " + (decision === "re_tendered" ? "re-tendered" : labels[decision].toLowerCase() + "d"), "success"); },
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
  const workflowSteps = cs.workflow_type?.steps ?? [];

  const approvalMap = useMemo(() => {
    const m: Record<number, any> = {};
    approvals.forEach((a: any) => { if (a.workflow_step_id) m[a.workflow_step_id] = a; });
    return m;
  }, [approvals]);

  const totalItems = prItems.length;
  const totalVendors = vendorsInCs.length;
  const lowestBid = Number(lowest?.total_price ?? 0);
  const fullyAwardedItems = prItems.filter((pr: any, idx: number) => {
    const row = matrix[idx] ?? [];
    const total = row.reduce((s: number, r: any) => s + Number(draftQtys[`${idx}-${r.vendor_id}`] ?? r.qty ?? 0), 0);
    return total === Number(pr.qty);
  }).length;

  return (
    <AppShell>
      <Head title={`CS · ${cs.tender?.tender_number ?? ""}`} />
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={() => history.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="h-4 w-px bg-border/60" />
        <span className="text-xs text-muted-foreground font-mono">CS-{cs.id}</span>
        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">{cs.tender?.tender_number}</span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">{cs.tender?.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Comparative Statement · {cs.workflow_type?.name ?? "No workflow"}</p>
        </div>
        <StatusBadge status={cs.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
          { label: "Items", value: totalItems, icon: FileText, color: "text-primary", bg: "from-primary/10 to-primary/5" },
          { label: "Vendors", value: totalVendors, icon: Scale, color: "text-accent", bg: "from-accent/10 to-accent/5" },
          { label: "Lowest bid", value: lowestBid.toLocaleString() + " BDT", icon: FileText, color: "text-success", bg: "from-success/10 to-success/5" },
          { label: "Awarded", value: `${fullyAwardedItems}/${totalItems} items`, icon: CheckCircle2, color: fullyAwardedItems === totalItems ? "text-success" : "text-warning", bg: fullyAwardedItems === totalItems ? "from-success/10 to-success/5" : "from-warning/10 to-warning/5" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center ${stat.color} shrink-0`}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-foreground leading-tight">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">

          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-border/40 bg-gradient-to-r from-primary/[0.03] to-transparent flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" /> Award matrix
              </div>
              {cs.status === "draft" && (
                <span className="text-[10px] text-muted-foreground px-2 py-1 rounded-full bg-muted/50 border border-border/40">Edit mode</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Item</th>
                    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Qty</th>
                    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Awarded</th>
                    {vendorsInCs.map((v) => (
                      <th key={v.id} className="px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 whitespace-nowrap" colSpan={2}>{v.name}</th>
                    ))}
                    {cs.status === "draft" && <th className="px-2 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 w-20">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {prItems.map((pr: any, idx: number) => {
                    const row = matrix[idx] ?? [];
                    const requestedQty = Number(pr.qty);
                    const totalAwarded = row.reduce((sum: number, s: any) => sum + Number(draftQtys[`${idx}-${s.vendor_id}`] ?? s.qty ?? 0), 0);
                    const isComplete = totalAwarded === requestedQty;
                    const isOver = totalAwarded > requestedQty;
                    const pct = Math.min(100, Math.round((totalAwarded / requestedQty) * 100));
                    const lowestUnit = Math.min(...row.map((r: any) => Number(r.unit_price)));
                    return (
                      <tr key={idx} className={`transition-colors ${isComplete ? "bg-success/[0.02]" : ""} hover:bg-muted/10`}>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-sm leading-tight">{pr.name}</div>
                          <div className="text-[10px] text-muted-foreground/60 mt-0.5">Item #{idx + 1}</div>
                        </td>
                        <td className="px-3 py-3.5 align-middle">
                          <div className="font-mono text-sm font-semibold">{pr.qty}</div>
                          <div className="text-[9px] uppercase text-muted-foreground/60">{pr.unit}</div>
                        </td>
                        <td className="px-3 py-3.5 align-middle min-w-[90px]">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-xs font-mono font-bold ${isOver ? "text-destructive" : isComplete ? "text-success" : "text-warning"}`}>
                              {totalAwarded}/{requestedQty}
                            </span>
                            {isComplete && <CheckCircle2 className="h-3 w-3 text-success" />}
                          </div>
                          <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-300 ${isOver ? "bg-destructive" : isComplete ? "bg-success" : "bg-warning"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        {vendorsInCs.map((v) => {
                          const s = row.find((r: any) => r.vendor_id === v.id);
                          if (!s) return <td key={v.id} className="px-2 py-3.5 text-center text-xs text-muted-foreground/40" colSpan={2}>—</td>;
                          const unitPrice = Number(s.unit_price);
                          const qty = draftQtys[`${idx}-${s.vendor_id}`] ?? 0;
                          const lineTotal = unitPrice * qty;
                          const isLow = unitPrice === lowestUnit;
                          return (
                            <td key={v.id} colSpan={2} className={`px-2 py-3.5`}>
                              <div className={`text-center rounded-lg p-1.5 ${isLow ? "bg-success/[0.04] ring-1 ring-success/20" : ""} ${qty > 0 ? "bg-accent/[0.03]" : ""}`}>
                                <div className={`font-mono text-xs font-bold ${isLow ? "text-success" : "text-foreground"}`}>
                                  {unitPrice.toLocaleString()}
                                </div>
                                <div className="text-[8px] uppercase tracking-wider text-muted-foreground/50 mt-0.5">/ {pr.unit}</div>
                                {cs.status === "draft" ? (
                                  <div className="mt-1.5 flex flex-col items-center gap-1">
                                    <input type="number" min={0} max={requestedQty} value={qty}
                                      onChange={(e) => updateQty(idx, s.vendor_id, e.target.value)}
                                      className="w-full max-w-[64px] h-7 rounded-md border border-border/40 bg-background/80 px-1.5 text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-accent/40 transition-all hover:border-accent/30" />
                                    {qty > 0 && <div className="text-[9px] font-mono text-muted-foreground">={lineTotal.toLocaleString()}</div>}
                                  </div>
                                ) : qty > 0 ? (
                                  <div className="mt-0.5">
                                    <div className="font-mono text-xs font-semibold text-success">× {qty}</div>
                                    <div className="font-mono text-[10px] text-success/80">={lineTotal.toLocaleString()}</div>
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          );
                        })}
                        {cs.status === "draft" && (
                          <td className="px-2 py-3.5 align-middle">
                            <div className="flex flex-col items-center gap-1">
                              <button onClick={() => autoFill(idx)} title="Auto-fill to lowest bidder"
                                className="h-7 w-7 rounded-md border border-border/40 flex items-center justify-center text-muted-foreground/60 hover:text-accent hover:border-accent/30 transition-all">
                                <Wand2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => saveAwards(idx)} disabled={savingAwards[idx]}
                                className={`h-7 px-2 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all ${
                                  isComplete
                                    ? "bg-success/10 text-success border border-success/30 hover:bg-success/20"
                                    : totalAwarded > 0 ? "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20"
                                    : "bg-muted/30 text-muted-foreground/50 border border-border/30"
                                } ${savingAwards[idx] ? "opacity-50" : ""}`}>
                                <Save className="h-3 w-3" /> Save
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-border/40 bg-gradient-to-r from-accent/[0.03] to-transparent flex items-center gap-2.5 text-sm font-semibold text-foreground">
              <Scale className="h-4 w-4 text-accent" /> Bid comparison
            </div>
            <DataTable
              columns={[
                { key: "rank", label: "Rank", sortable: true, render: (r: any) => (
                  <span className="font-mono text-xs whitespace-nowrap">
                    #{r.rank}
                    {r.rank === 1 && <span className="ml-1.5 text-[9px] uppercase text-success font-semibold bg-success/10 px-1.5 py-0.5 rounded-full">lowest</span>}
                  </span>
                )},
                { key: "vendor_name", label: "Vendor", sortable: false, render: (r: any) => <span className="font-medium whitespace-nowrap">{r.vendor?.name}</span> },
                { key: "erp_code", label: "ERP", sortable: false, render: (r: any) => <span className="font-mono text-xs whitespace-nowrap">{r.vendor?.erp_code ?? <span className="text-warning/60">—</span>}</span> },
                { key: "total_price", label: "Total bid", sortable: true, className: "text-right", render: (r) => <span className="font-mono font-semibold whitespace-nowrap">{Number(r.total_price).toLocaleString()} <span className="text-[9px] text-muted-foreground/60">BDT</span></span> },
                { key: "selected", label: "Award", sortable: false, className: "text-center", render: (r) => r.selected ? <StatusBadge status="selected" /> : (r.rank === 1 ? <StatusBadge status="lowest" /> : <span className="text-xs text-muted-foreground/40">—</span>) },
              ]}
              data={items}
              rowClassName={(r: any) => lowest?.id === r.id ? "bg-success/[0.03]" : ""}
              searchable={false} exportable={false} hidePageSize pageSize={50} compact
              emptyMessage="No bids received."
            />
          </div>

          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-border/40 bg-gradient-to-r from-accent/[0.03] to-transparent flex items-center gap-2.5 text-sm font-semibold text-foreground">
              <UserCheck className="h-4 w-4 text-accent" /> Approval timeline
            </div>
            <div className="p-5">
              {workflowSteps.length === 0 && approvals.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No approval actions yet.</div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border/60" />
                  {workflowSteps.length > 0 ? (
                    <ol className="space-y-0">
                      <li className="relative flex gap-4 pb-4">
                        <div className={`relative z-10 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ring-2 ring-card ${cs.status === "draft" && !cs.workflow_type ? "bg-accent/20 ring-accent/30" : "bg-success/20 ring-success/30"}`}>
                          {cs.status !== "draft" || cs.workflow_type ? <CheckCircle2 className="h-3 w-3 text-success" /> : <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-xs font-semibold text-foreground">Procurement award</div>
                          <div className="text-[10px] text-muted-foreground">Quantities distributed per item</div>
                        </div>
                        <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap pt-0.5">{cs.submitted_at ? new Date(cs.submitted_at).toLocaleDateString() : "Draft"}</span>
                      </li>
                      {workflowSteps.map((step: any, i: number) => {
                        const approval = approvalMap[step.id];
                        const isCurrent = cs.current_step_id === step.id && cs.status === "pending_approval";
                        const done = approval?.decision === "approved";
                        const rejected = approval?.decision === "rejected" || approval?.decision === "declined";
                        const reTendered = approval?.decision === "re_tendered";
                        const isLast = i === workflowSteps.length - 1;
                        return (
                          <li key={step.id} className={`relative flex gap-4 ${!isLast ? "pb-4" : ""}`}>
                            <div className={`relative z-10 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ring-2 ring-card ${
                              done ? "bg-success/20 ring-success/30" : isCurrent ? "bg-accent/20 ring-accent/30" : rejected || reTendered ? "bg-destructive/20 ring-destructive/30" : "bg-muted/30 ring-border/40"
                            }`}>
                              {done ? <CheckCircle2 className="h-3 w-3 text-success" /> : isCurrent ? <span className="h-2 w-2 rounded-full bg-accent animate-pulse" /> : rejected ? <XCircle className="h-3 w-3 text-destructive" /> : reTendered ? <RefreshCw className="h-3 w-3 text-info" /> : <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className={`text-xs font-semibold ${done ? "text-success" : isCurrent ? "text-accent" : rejected ? "text-destructive" : reTendered ? "text-info" : "text-foreground"}`}>
                                {step.label}
                              </div>
                              <div className="text-[10px] text-muted-foreground/70">Role: {step.role_name}</div>
                              {approval && (
                                <div className="mt-1.5 bg-muted/20 rounded-lg px-2.5 py-1.5 border border-border/30">
                                  <div className="flex items-center gap-2 text-[10px]">
                                    <span className="font-medium text-foreground">{approval.actor?.full_name}</span>
                                    {approval.comment && <span className="text-muted-foreground italic">— "{approval.comment}"</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap pt-0.5">{approval?.acted_at ? new Date(approval.acted_at).toLocaleString() : isCurrent ? "Now" : "Pending"}</span>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <div className="space-y-3">
                      {approvals.map((a: any) => (
                        <div key={a.id} className="flex items-start gap-3">
                          <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-card bg-success/20 ring-success/30">
                            {a.decision === "approved" ? <CheckCircle2 className="h-3 w-3 text-success" /> : <XCircle className="h-3 w-3 text-destructive" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-foreground capitalize">{a.step}</div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span>{a.actor?.full_name}</span>
                              <span>·</span>
                              <span>{new Date(a.acted_at).toLocaleString()}</span>
                            </div>
                            {a.comment && <div className="text-[10px] text-muted-foreground italic mt-0.5">"{a.comment}"</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {cs.tender_logs?.length > 0 && (
            <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border/40 bg-gradient-to-r from-info/[0.03] to-transparent flex items-center gap-2.5 text-sm font-semibold text-foreground">
                <RefreshCw className="h-4 w-4 text-info" /> Re-tender history
              </div>
              <div className="divide-y divide-border/30">
                {cs.tender_logs.map((log: any) => (
                  <div key={log.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 text-info/60 shrink-0" />
                      <span className="text-xs font-medium">{log.actor?.full_name}</span>
                      <span className="text-xs text-muted-foreground">— {log.reason}</span>
                    </div>
                    <a href={`/app/tenders/${log.new_tender_id}`} className="text-[10px] text-accent hover:underline font-medium">View tender →</a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm sticky top-20">
            <div className="px-5 py-3.5 border-b border-border/40 bg-gradient-to-r from-accent/[0.03] to-transparent flex items-center gap-2 text-sm font-semibold text-foreground">
              <Scale className="h-4 w-4 text-accent" /> Actions
            </div>
            <div className="p-4 space-y-3">
              {cs.status === "draft" && isProc && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Workflow type</label>
                    <select value={selectedWf} onChange={(e) => setSelectedWf(e.target.value)}
                      className="w-full h-9 rounded-lg border border-border/50 bg-background/80 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all hover:border-accent/30">
                      <option value="">Select workflow...</option>
                      {workflowTypes.map((wt: any) => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
                    </select>
                  </div>
                  <Button className="w-full h-9 text-xs" onClick={submitForApproval} disabled={!selectedWf}>
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Submit for approval
                  </Button>
                  <div className="bg-warning/[0.04] border border-warning/20 rounded-lg p-2.5">
                    <div className="text-[10px] text-warning/80 font-medium">Award all quantities before submitting.</div>
                  </div>
                </>
              )}
              {cs.status === "pending_approval" && (
                <>
                  {currentStep && (
                    <div className="bg-accent/[0.04] border border-accent/20 rounded-lg p-3 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-xs font-semibold text-accent">{currentStep.label}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Awaiting <span className="font-medium text-foreground">{currentStep.role_name}</span></div>
                    </div>
                  )}
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." rows={2}
                    className="text-xs min-h-[60px]" />
                  {canActOnCurrentStep ? (
                    <div className="flex flex-col gap-2">
                      <Button className="w-full h-9 text-xs" onClick={() => decide("approved")}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Approve
                      </Button>
                      <Button className="w-full h-9 text-xs" variant="destructive" onClick={() => decide("declined")}>
                        <XCircle className="h-3.5 w-3.5 mr-1.5" /> Decline
                      </Button>
                      <Button className="w-full h-9 text-xs" variant="outline" onClick={() => decide("re_tendered")}>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Re-tender
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground text-center py-2">Your role does not match the current step.</p>
                  )}
                </>
              )}
              {cs.status === "approved" && (
                <>
                  {isAdmin && !erpDone && (
                    <Button className="w-full h-9 text-xs" onClick={sendToErp}><Upload className="h-3.5 w-3.5 mr-1.5" /> Send to ERP</Button>
                  )}
                  {erpDone && (
                    <div className="bg-success/[0.04] border border-success/20 rounded-lg p-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <div className="text-[10px] text-success font-medium">Pushed to ERP · ref {lastErp?.response_data?.erp_reference}</div>
                    </div>
                  )}
                  <a href={`/app/cs/${cs.id}/pdf`} target="_blank" className="block">
                    <Button className="w-full h-9 text-xs" variant="outline"><Download className="h-3.5 w-3.5 mr-1.5" /> Download CS (PDF)</Button>
                  </a>
                </>
              )}
              {cs.status === "rejected" && (
                <div className="bg-destructive/[0.04] border border-destructive/20 rounded-lg p-3 text-center">
                  <XCircle className="h-5 w-5 text-destructive/60 mx-auto mb-1" />
                  <div className="text-[11px] text-destructive font-medium">This CS was rejected</div>
                  <div className="text-[10px] text-destructive/60 mt-0.5">Returned to draft for revision.</div>
                </div>
              )}
              {cs.status === "re_tendered" && (
                <div className="bg-info/[0.04] border border-info/20 rounded-lg p-3 text-center">
                  <RefreshCw className="h-5 w-5 text-info/60 mx-auto mb-1" />
                  <div className="text-[11px] text-info font-medium">Sent for re-tender</div>
                  <div className="text-[10px] text-info/60 mt-0.5">A new tender has been created.</div>
                </div>
              )}

              <div className="border-t border-border/30 pt-3 mt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Workflow className="h-3.5 w-3.5 text-accent/70" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Workflow</span>
                </div>
                {cs.workflow_type ? (
                  <div className="space-y-1">
                    <div className="text-[10px] font-medium text-foreground">{cs.workflow_type.name}</div>
                    <ol className="space-y-0.5 ml-0.5">
                      {[
                        { label: "Awarded", done: !["draft"].includes(cs.status) },
                        ...workflowSteps.map((s: any) => ({ label: s.label, done: approvals.some((a: any) => a.workflow_step_id === s.id && a.decision === "approved"), current: cs.current_step_id === s.id })),
                        { label: "ERP push", done: cs.status === "approved" && erpDone },
                      ].map((s: any, i: number) => (
                        <li key={i} className={`flex items-center gap-1.5 ${s.done ? "text-success" : s.current ? "text-accent font-medium" : "text-muted-foreground/50"}`}>
                          {s.done ? <CheckCircle2 className="h-2.5 w-2.5 shrink-0" /> : <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />}
                          <span className="text-[9px]">{s.label}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div className="text-[9px] text-muted-foreground/60">No workflow configured yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
