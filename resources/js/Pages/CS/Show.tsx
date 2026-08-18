import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Textarea } from "@/components/ui/textarea";
import { PageSharedProps } from "@/lib/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2, Download, Send, Upload, XCircle, Scale, FileText, UserCheck, Workflow, RefreshCw, Wand2, Save, Monitor, ShieldCheck, HelpCircle } from "lucide-react";
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

  const lowestBidDetails = items[0];
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
  const lowestBid = Number(lowestBidDetails?.total_price ?? 0);
  const fullyAwardedItems = prItems.filter((pr: any, idx: number) => {
    const row = matrix[idx] ?? [];
    const total = row.reduce((s: number, r: any) => s + Number(draftQtys[`${idx}-${r.vendor_id}`] ?? r.qty ?? 0), 0);
    return total === Number(pr.qty);
  }).length;

  return (
    <AppShell>
      <Head title={`Comparative Statement · CS-${cs.id}`} />
      
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => history.back()} className="hover:bg-muted/80 gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <span className="text-muted-foreground/30">|</span>
        <span className="font-mono text-xs bg-muted/60 text-foreground px-2 py-0.5 rounded-md font-semibold">CS-{cs.id}</span>
        <span className="text-xs text-muted-foreground font-mono">{cs.tender?.tender_number}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight font-display">{cs.tender?.title}</h1>
          <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5 font-medium">
            <Workflow className="h-4 w-4 text-accent" /> Comparative Statement Workflow · {cs.workflow_type?.name ?? "No Approval Workflow"}
          </p>
        </div>
        <StatusBadge status={cs.status} className="self-start sm:self-auto" />
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Items", value: totalItems, icon: FileText, color: "text-primary bg-primary/10" },
          { label: "Vendors Evaluated", value: totalVendors, icon: Scale, color: "text-accent bg-accent/15" },
          { label: "Lowest Bid Value", value: `৳${lowestBid.toLocaleString()}`, icon: FileText, color: "text-success bg-success/10" },
          { label: "Items Awarded", value: `${fullyAwardedItems}/${totalItems} items`, icon: CheckCircle2, color: fullyAwardedItems === totalItems ? "text-success bg-success/10" : "text-warning bg-warning/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-foreground leading-tight truncate">{stat.value}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          
          {/* Award matrix table */}
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <div className="panel-title">
                <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                  <Scale className="h-3.5 w-3.5" />
                </div>
                Award Selection Matrix
              </div>
              {cs.status === "draft" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/15">Draft Selection Mode</span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/40">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Item</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-20">Req Qty</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-28">Allocated</th>
                    {vendorsInCs.map((v) => (
                      <th key={v.id} className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 border-l border-border/30" colSpan={2}>{v.name}</th>
                    ))}
                    {cs.status === "draft" && <th className="px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-24">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/25">
                  {prItems.map((pr: any, idx: number) => {
                    const row = matrix[idx] ?? [];
                    const requestedQty = Number(pr.qty);
                    const totalAwarded = row.reduce((sum: number, s: any) => sum + Number(draftQtys[`${idx}-${s.vendor_id}`] ?? s.qty ?? 0), 0);
                    const isComplete = totalAwarded === requestedQty;
                    const isOver = totalAwarded > requestedQty;
                    const pct = Math.min(100, Math.round((totalAwarded / requestedQty) * 100));
                    const lowestUnit = Math.min(...row.map((r: any) => Number(r.unit_price)));
                    return (
                      <tr key={idx} className={cn("transition-colors hover:bg-muted/10", isComplete && "bg-success/[0.015]")}>
                        <td className="px-5 py-4">
                          <div className="font-bold text-foreground text-sm">{pr.name}</div>
                          <div className="text-[10px] text-muted-foreground/60 mt-0.5">Item Index #{idx + 1}</div>
                        </td>
                        <td className="px-3 py-4 align-middle">
                          <div className="font-bold text-foreground text-sm">{pr.qty}</div>
                          <div className="text-[10px] uppercase font-bold text-muted-foreground/60">{pr.unit}</div>
                        </td>
                        <td className="px-3 py-4 align-middle">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className={cn("text-xs font-bold font-mono px-1.5 py-0.5 rounded-md", isOver ? "bg-destructive/10 text-destructive" : isComplete ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
                              {totalAwarded}/{requestedQty}
                            </span>
                            {isComplete && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />}
                          </div>
                          <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-300", isOver ? "bg-destructive" : isComplete ? "bg-success" : "bg-warning")}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        {vendorsInCs.map((v) => {
                          const s = row.find((r: any) => r.vendor_id === v.id);
                          if (!s) return <td key={v.id} className="px-4 py-4 text-center text-xs text-muted-foreground/30 border-l border-border/30" colSpan={2}>—</td>;
                          const unitPrice = Number(s.unit_price);
                          const qty = draftQtys[`${idx}-${s.vendor_id}`] ?? 0;
                          const lineTotal = unitPrice * qty;
                          const isLow = unitPrice === lowestUnit;
                          return (
                            <td key={v.id} colSpan={2} className="px-4 py-4 border-l border-border/30">
                              <div className={cn("text-center rounded-xl p-2 transition-all duration-150", isLow ? "bg-success/[0.04] border border-success/20 shadow-xs" : "border border-transparent", qty > 0 && "bg-accent/[0.025] border-accent/15")}>
                                <div className={cn("font-mono text-xs font-bold", isLow ? "text-success" : "text-foreground")}>
                                  ৳ {unitPrice.toLocaleString()}
                                </div>
                                <div className="text-[9px] uppercase font-semibold text-muted-foreground/50 mt-0.5">/ {pr.unit}</div>
                                {cs.status === "draft" ? (
                                  <div className="mt-2.5 space-y-1.5">
                                    <input type="number" min={0} max={requestedQty} value={qty}
                                      onChange={(e) => updateQty(idx, s.vendor_id, e.target.value)}
                                      className="w-full max-w-[72px] h-8 rounded-lg border border-border/80 bg-background/85 px-2 text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all" />
                                    {qty > 0 && <div className="text-[9px] font-mono font-bold text-muted-foreground">৳ {lineTotal.toLocaleString()}</div>}
                                  </div>
                                ) : qty > 0 ? (
                                  <div className="mt-1.5 pt-1.5 border-t border-border/20">
                                    <div className="font-mono text-xs font-bold text-success">Qty: {qty}</div>
                                    <div className="font-mono text-[10px] text-success/80 mt-0.5">৳ {lineTotal.toLocaleString()}</div>
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          );
                        })}
                        {cs.status === "draft" && (
                          <td className="px-3 py-4 align-middle">
                            <div className="flex flex-col items-center gap-1.5">
                              <button onClick={() => autoFill(idx)} title="Auto fill to lowest bidder"
                                className="h-8 w-8 rounded-lg border border-border/80 flex items-center justify-center text-muted-foreground/60 hover:text-accent hover:border-accent/40 bg-card hover:bg-muted/30 transition-all">
                                <Wand2 className="h-4 w-4" />
                              </button>
                              <button onClick={() => saveAwards(idx)} disabled={savingAwards[idx]}
                                className={cn(
                                  "h-8 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all",
                                  isComplete
                                    ? "bg-success/10 text-success border border-success/30 hover:bg-success/20"
                                    : totalAwarded > 0 ? "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20"
                                    : "bg-muted/50 text-muted-foreground border border-border/30",
                                  savingAwards[idx] && "opacity-50"
                                )}>
                                <Save className="h-3.5 w-3.5" /> Save
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

          {/* Bid Summary Table */}
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <div className="panel-title">
                <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                  <Scale className="h-3.5 w-3.5" />
                </div>
                Total Bid Rankings
              </div>
            </div>
            <DataTable
              columns={[
                { key: "rank", label: "Rank", sortable: true, render: (r: any) => (
                  <span className="font-mono text-xs font-bold whitespace-nowrap flex items-center gap-1.5">
                    #{r.rank}
                    {r.rank === 1 && <span className="text-[9px] uppercase tracking-wider text-success font-bold bg-success/10 px-2 py-0.5 rounded-full border border-success/15">lowest bid</span>}
                  </span>
                )},
                { key: "vendor_name", label: "Vendor", sortable: false, render: (r: any) => <span className="font-semibold text-foreground whitespace-nowrap">{r.vendor?.name}</span> },
                { key: "erp_code", label: "ERP Code", sortable: false, render: (r: any) => <span className="font-mono text-xs whitespace-nowrap bg-muted/60 px-2 py-0.5 rounded-md">{r.vendor?.erp_code ?? <span className="text-warning/60 font-semibold">—</span>}</span> },
                { key: "total_price", label: "Total bid value", sortable: true, className: "text-right", render: (r) => <span className="font-mono font-bold whitespace-nowrap text-foreground">৳ {Number(r.total_price).toLocaleString()}</span> },
                { key: "selected", label: "Award status", sortable: false, className: "text-center", render: (r) => r.selected ? <StatusBadge status="selected" className="text-[10px]" /> : (r.rank === 1 ? <StatusBadge status="lowest" className="text-[10px]" /> : <span className="text-xs text-muted-foreground/30 font-semibold">—</span>) },
              ]}
              data={items}
              rowClassName={(r: any) => lowestBidDetails?.id === r.id ? "bg-success/[0.015]" : ""}
              searchable={false} exportable={false} hidePageSize pageSize={50} compact
              emptyMessage="No bids available."
            />
          </div>

          {/* Timeline workflow details */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                Approval Workflow Trace
              </div>
            </div>
            <div className="p-6">
              {workflowSteps.length === 0 && approvals.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">No approval steps defined for comparative statement.</div>
              ) : (
                <div className="relative">
                  <div className="absolute left-[9px] top-2.5 bottom-2.5 w-0.5 bg-border/60" />
                  {workflowSteps.length > 0 ? (
                    <ol className="space-y-0 relative">
                      <li className="relative flex gap-4 pb-5">
                        <div className={`relative z-10 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ring-2 ring-card ${cs.status === "draft" && !cs.workflow_type ? "bg-accent/20 ring-accent/30 text-accent" : "bg-success/20 ring-success/30 text-success"}`}>
                          {cs.status !== "draft" || cs.workflow_type ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="text-xs font-bold text-foreground">Procurement Award Allocation</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">Quantities distributed to selected bidders</div>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap pt-0.5 font-medium">{cs.submitted_at ? new Date(cs.submitted_at).toLocaleDateString() : "Draft"}</span>
                      </li>
                      {workflowSteps.map((step: any, i: number) => {
                        const approval = approvalMap[step.id];
                        const isCurrent = cs.current_step_id === step.id && cs.status === "pending_approval";
                        const done = approval?.decision === "approved";
                        const rejected = approval?.decision === "rejected" || approval?.decision === "declined";
                        const reTendered = approval?.decision === "re_tendered";
                        const isLast = i === workflowSteps.length - 1;
                        return (
                          <li key={step.id} className={cn("relative flex gap-4", !isLast && "pb-5")}>
                            <div className={`relative z-10 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ring-2 ring-card ${
                              done 
                                ? "bg-success/20 ring-success/30 text-success" 
                                : isCurrent 
                                  ? "bg-accent/20 ring-accent/30 text-accent" 
                                  : rejected || reTendered 
                                    ? "bg-destructive/20 ring-destructive/30 text-destructive" 
                                    : "bg-muted text-muted-foreground ring-border/40"
                            }`}>
                              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : isCurrent ? <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> : rejected ? <XCircle className="h-3.5 w-3.5" /> : reTendered ? <RefreshCw className="h-3 w-3 animate-spin-slow" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className={cn("text-xs font-bold", done ? "text-success" : isCurrent ? "text-accent" : rejected ? "text-destructive" : reTendered ? "text-info" : "text-foreground/80")}>
                                {step.label}
                              </div>
                              <div className="text-[10px] text-muted-foreground/50 font-medium">Approval Role: {step.role_name}</div>
                              {approval && (
                                <div className="mt-2 bg-muted/20 rounded-xl px-3 py-2 border border-border/40 space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="font-semibold text-foreground">{approval.actor?.full_name}</span>
                                    {approval.comment && <span className="text-muted-foreground font-medium italic">— "{approval.comment}"</span>}
                                  </div>
                                  {(approval.device_name || approval.device_ip) && (
                                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/75 font-mono">
                                      <Monitor className="h-3.5 w-3.5" />
                                      <span>{approval.device_name ?? "Client Device"}</span>
                                      {approval.device_ip && <span className="text-muted-foreground/40">· {approval.device_ip}</span>}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap pt-0.5 font-medium">{approval?.acted_at ? new Date(approval.acted_at).toLocaleDateString() : isCurrent ? "Awaiting" : "Pending"}</span>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <div className="space-y-4">
                      {approvals.map((a: any) => (
                        <div key={a.id} className="flex items-start gap-3">
                          <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-card bg-success/20 ring-success/30 text-success">
                            {a.decision === "approved" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5 text-destructive" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-foreground capitalize">{a.step}</div>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                              <span className="font-semibold text-foreground/80">{a.actor?.full_name}</span>
                              <span>·</span>
                              <span>{new Date(a.acted_at).toLocaleString()}</span>
                            </div>
                            {(a.device_name || a.device_ip) && (
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground/70 mt-1 font-mono">
                                <Monitor className="h-3.5 w-3.5" />
                                <span>{a.device_name ?? "Client"}</span>
                                {a.device_ip && <span>· {a.device_ip}</span>}
                              </div>
                            )}
                            {a.comment && <div className="text-xs text-muted-foreground italic mt-1.5 bg-muted/20 border border-border/40 p-2 rounded-lg">"{a.comment}"</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Re-tender History Log */}
          {cs.tender_logs?.length > 0 && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <div className="h-7 w-7 rounded-lg bg-info/10 flex items-center justify-center text-info">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </div>
                  Re-Tender History Log
                </div>
              </div>
              <div className="divide-y divide-border/30">
                {cs.tender_logs.map((log: any) => (
                  <div key={log.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 text-info/60 shrink-0" />
                      <span className="text-xs font-semibold text-foreground">{log.actor?.full_name}</span>
                      <span className="text-xs text-muted-foreground font-medium">— Reason: {log.reason}</span>
                    </div>
                    <a href={`/app/tenders/${log.new_tender_id}`} className="text-xs font-semibold text-accent hover:underline flex items-center gap-0.5">
                      New Tender <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm sticky top-20">
            <div className="px-5 py-4 border-b border-border/40 bg-gradient-to-r from-card to-muted/20 flex items-center gap-2.5 text-sm font-bold text-foreground">
              <Workflow className="h-4.5 w-4.5 text-accent" /> Control Center
            </div>
            <div className="p-4 space-y-4">
              {cs.status === "draft" && isProc && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-bold">Select Approval Flow</label>
                    <select value={selectedWf} onChange={(e) => setSelectedWf(e.target.value)}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-accent/25 transition-all">
                      <option value="">Choose workflow...</option>
                      {workflowTypes.map((wt: any) => <option key={wt.id} value={wt.id}>{wt.name}</option>)}
                    </select>
                  </div>
                  <Button className="w-full h-10 text-xs font-semibold" onClick={submitForApproval} disabled={!selectedWf}>
                    <Send className="h-4 w-4 mr-1.5" /> Submit Comparison Statement
                  </Button>
                  <div className="bg-warning/[0.04] border border-warning/20 rounded-xl p-3 flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div className="text-[10px] text-warning/80 font-medium leading-relaxed">Allocate and save all item awards before submitting for approvals.</div>
                  </div>
                </>
              )}
              
              {cs.status === "pending_approval" && (
                <>
                  {currentStep && (
                    <div className="bg-accent/[0.04] border border-accent/25 rounded-xl p-3.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">{currentStep.label}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Currently awaiting review by <span className="font-semibold text-foreground">{currentStep.role_name}</span></div>
                    </div>
                  )}
                  <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Decision remarks or comments..." rows={3}
                    className="text-xs min-h-[70px] rounded-xl" />
                  {canActOnCurrentStep ? (
                    <div className="flex flex-col gap-2 pt-1">
                      <Button className="w-full h-10 text-xs font-semibold" onClick={() => decide("approved")}>
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve Award
                      </Button>
                      <Button className="w-full h-10 text-xs font-semibold" variant="destructive" onClick={() => decide("declined")}>
                        <XCircle className="h-4 w-4 mr-1.5" /> Reject Statement
                      </Button>
                      <Button className="w-full h-10 text-xs font-semibold" variant="outline" onClick={() => decide("re_tendered")}>
                        <RefreshCw className="h-4 w-4 mr-1.5" /> Re-Tender Request
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-[10px] text-muted-foreground/60 font-semibold bg-muted/40 rounded-xl">Your current active role does not matching step parameters.</div>
                  )}
                </>
              )}
              
              {cs.status === "approved" && (
                <>
                  {isAdmin && !erpDone && (
                    <Button className="w-full h-10 text-xs font-semibold" onClick={sendToErp}>
                      <Upload className="h-4 w-4 mr-1.5" /> Push Awards to ERP
                    </Button>
                  )}
                  {erpDone && (
                    <div className="bg-success/[0.04] border border-success/20 rounded-xl p-3.5 flex items-start gap-2.5 shadow-xs">
                      <CheckCircle2 className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-success">ERP Transmitted Successfully</div>
                        <div className="text-[9px] font-mono text-success/80 mt-1">Ref ID: {lastErp?.response_data?.erp_reference}</div>
                      </div>
                    </div>
                  )}
                  <a href={`/app/cs/${cs.id}/pdf`} target="_blank" className="block">
                    <Button className="w-full h-10 text-xs font-semibold" variant="outline">
                      <Download className="h-4 w-4 mr-1.5" /> Download CS Report
                    </Button>
                  </a>
                </>
              )}
              
              {cs.status === "rejected" && (
                <div className="bg-destructive/[0.04] border border-destructive/20 rounded-xl p-4 text-center">
                  <XCircle className="h-7 w-7 text-destructive/60 mx-auto mb-2" />
                  <div className="text-xs font-bold text-destructive">Comparative Statement Declined</div>
                  <div className="text-[10px] text-destructive/60 mt-1 leading-relaxed">Returned to draft status for revision and award corrections.</div>
                </div>
              )}
              
              {cs.status === "re_tendered" && (
                <div className="bg-info/[0.04] border border-info/20 rounded-xl p-4 text-center">
                  <RefreshCw className="h-7 w-7 text-info/60 mx-auto mb-2 animate-spin-slow" />
                  <div className="text-xs font-bold text-info">CS Sent For Re-Tendering</div>
                  <div className="text-[10px] text-info/60 mt-1 leading-relaxed">A new tender invitation is currently active for invited vendors.</div>
                </div>
              )}

              {/* Workflow visual trail */}
              <div className="border-t border-border/30 pt-4 mt-3">
                <div className="flex items-center gap-1.5 mb-3">
                  <Workflow className="h-4 w-4 text-accent/70" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Workflow Steps Progress</span>
                </div>
                {cs.workflow_type ? (
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-foreground">{cs.workflow_type.name}</div>
                    <ol className="space-y-1.5 pl-0.5">
                      {[
                        { label: "Draft & Award Selection", done: !["draft"].includes(cs.status) },
                        ...workflowSteps.map((s: any) => ({ label: s.label, done: approvals.some((a: any) => a.workflow_step_id === s.id && a.decision === "approved"), current: cs.current_step_id === s.id })),
                        { label: "ERP Transmission", done: cs.status === "approved" && erpDone },
                      ].map((s: any, i: number) => (
                        <li key={i} className={`flex items-center gap-2 ${s.done ? "text-success font-semibold" : s.current ? "text-accent font-bold" : "text-muted-foreground/45"}`}>
                          {s.done ? (
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                          )}
                          <span className="text-[10px] truncate">{s.label}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground/60 italic font-medium">No workflow has been mapped yet.</div>
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
