import { useMemo, useState } from "react";
import { router, usePage, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, CheckCircle2, XCircle, Download, Receipt, FileText,
  UserCheck, Workflow, Monitor, Calendar, ShieldCheck, Tag, Info, User
} from "lucide-react";
import { PageSharedProps } from "@/lib/types";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { cn } from "@/lib/utils";

export default function ClaimsShow({ claim = {} as any }: any) {
  const { props } = usePage<PageSharedProps>();
  const userRoles = props.auth.user?.roles ?? [];
  const isVendor = props.auth.user?.primary_role === "vendor";
  const [comment, setComment] = useState("");
  const sa = useSweetAlert();

  const workflowSteps = claim.workflow_type?.steps ?? [];
  const currentStep = claim.current_step;

  const canActOnCurrentStep = !isVendor &&
    claim.status === "submitted" &&
    currentStep &&
    userRoles.includes(currentStep.role_name);

  const approvalMap = useMemo(() => {
    const m: Record<number, any> = {};
    (claim.approvals || []).forEach((a: any) => {
      if (a.workflow_step_id) m[a.workflow_step_id] = a;
    });
    return m;
  }, [claim.approvals]);

  const decide = (decision: "approved" | "rejected") => {
    const title = decision === "approved" ? "Approve claim?" : "Reject claim?";
    const desc = decision === "approved"
      ? "This will advance the claim to the next approval step."
      : "This will reject the claim.";
    sa.confirmAction(title, desc, decision === "approved" ? "Approve" : "Reject").then(ok => {
      if (ok) router.post(`/app/claims/${claim.id}/decide`, { decision, comment }, {
        onSuccess: () => { setComment(""); sa.alert(decision === "approved" ? "Claim approved" : "Claim rejected", "Your decision has been logged successfully.", decision === "approved" ? "success" : "warning"); },
      });
    });
  };

  const docUrl = (doc: any) => `/app/claims/${claim.id}/documents/${doc.id}`;

  const statusLabel: Record<string, string> = {
    submitted: "Awaiting verification approvals",
    forwarded_to_finance: "Forwarded to Finance for Payment Execution",
    rejected: "Claim Rejected",
  };

  const billTypeLabel: Record<string, string> = {
    plant_other: "Plant / Other Bill",
    ohq_packing: "OHQ Packing Material Bill",
  };

  return (
    <AppShell>
      <Head title={`Claim Details - ${claim.claim_number}`} />
      
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-4 hover:bg-muted/80 gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Claims
      </Button>

      <PageHeader 
        title={`Claim · ${claim.claim_number}`} 
        description={claim.title} 
        actions={<StatusBadge status={claim.status} />} 
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main section */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          
          {/* Claim Details Card */}
          <div className="panel p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
              <Receipt className="h-4.5 w-4.5 text-accent" /> Claim Overview
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Vendor Company</span>
                <div className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                  <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                    {claim.vendor?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  {claim.vendor?.name}
                </div>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">ERP Code</span>
                <div className="font-mono text-xs font-semibold text-foreground mt-1 bg-muted/60 px-2 py-0.5 rounded-md w-fit">{claim.vendor?.erp_code ?? "Not mapped"}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Bill Reference #</span>
                <div className="font-mono text-xs font-semibold text-foreground mt-1 bg-muted/60 px-2 py-0.5 rounded-md w-fit">{claim.bill_number ?? "—"}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Bill Date</span>
                <div className="font-semibold text-foreground mt-0.5">{claim.bill_date ?? "—"}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Bill Type</span>
                <div className="font-semibold text-foreground mt-0.5">{billTypeLabel[claim.bill_type] ?? claim.bill_type ?? "—"}</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Purchase Order #</span>
                <div className="font-mono text-xs font-semibold text-foreground mt-1 bg-muted/60 px-2 py-0.5 rounded-md w-fit">{claim.po_number}</div>
              </div>
              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Claimed Amount (BDT)</span>
                <div className="font-mono font-black text-xl text-foreground mt-1">৳ {Number(claim.amount).toLocaleString()}</div>
              </div>
              <div className="space-y-0.5 sm:col-span-2">
                <span className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Description</span>
                <div className="text-sm text-foreground/80 leading-relaxed mt-1 bg-muted/20 border border-border/40 p-3 rounded-xl whitespace-pre-line">{claim.description ?? "No description remarks provided."}</div>
              </div>
            </div>
          </div>

          {/* Supporting Documents List */}
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <div className="panel-title">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                Attached Documents
              </div>
            </div>
            <ul className="divide-y divide-border/30">
              {claim.documents?.length === 0 && (
                <li className="px-6 py-8 text-center text-xs text-muted-foreground">No supporting documents uploaded for this claim.</li>
              )}
              {claim.documents?.map((doc: any) => (
                <li key={doc.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusBadge status={doc.document_type} className="text-[9px] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{doc.original_name}</div>
                      {doc.file_size && <div className="text-[10px] text-muted-foreground/60 font-medium mt-0.5">{(doc.file_size / 1024).toFixed(1)} KB</div>}
                    </div>
                  </div>
                  <a href={docUrl(doc)} className="shrink-0 self-end sm:self-auto">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Approval trace table */}
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <div className="panel-title">
                <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
                Approval Audit Trace
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/40">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Step</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-28">Decision</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">By User</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Action Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Client Identity</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Remarks / Comment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/25">
                  <tr className="hover:bg-muted/10 transition-colors bg-success/[0.015]">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <span className="font-bold text-xs">Vendor Submission</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-success bg-success/10 px-2 py-0.5 rounded-md">Submitted</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-foreground font-semibold">{claim.vendor?.name || "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{new Date(claim.submitted_at).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground/40">—</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground/45 italic">—</td>
                  </tr>
                  
                  {workflowSteps.map((step: any) => {
                    const approval = approvalMap[step.id];
                    const isCurrent = claim.current_step_id === step.id;
                    const approved = approval?.decision === "approved";
                    const rejected = approval?.decision === "rejected";
                    return (
                      <tr key={step.id} className={cn("hover:bg-muted/10 transition-colors", isCurrent && "bg-accent/[0.015]")}>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {approved ? (
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            ) : rejected ? (
                              <XCircle className="h-4 w-4 text-destructive shrink-0" />
                            ) : isCurrent ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                            ) : (
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/35 shrink-0" />
                            )}
                            <span className={cn("font-bold text-xs", isCurrent ? "text-accent" : "text-foreground")}>{step.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {approval ? (
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md", approved ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
                              {approval.decision}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider bg-muted px-2 py-0.5 rounded-md">Pending</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-foreground font-semibold">{approval?.actor?.full_name || "—"}</td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{approval?.acted_at ? new Date(approval.acted_at).toLocaleString() : "—"}</td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground">
                          {approval?.device_name || approval?.device_ip ? (
                            <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/60">
                              <Monitor className="h-3 w-3 shrink-0" />
                              <span>{approval.device_name ?? "Client"}{approval.device_ip ? ` · ${approval.device_ip}` : ""}</span>
                            </div>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted-foreground/80 italic max-w-[200px] truncate" title={approval?.comment}>{approval?.comment ? `"${approval.comment}"` : "—"}</td>
                      </tr>
                    );
                  })}
                  
                  {claim.status === "forwarded_to_finance" && (
                    <tr className="hover:bg-muted/10 transition-colors bg-success/[0.015]">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                          <span className="font-bold text-xs text-success">Forwarded to Finance for Payment</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-success bg-success/15 px-2 py-0.5 rounded-md">Completed</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">—</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{claim.forwarded_to_finance_at ? new Date(claim.forwarded_to_finance_at).toLocaleString() : "—"}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">—</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground italic">—</td>
                    </tr>
                  )}
                  {claim.status === "rejected" && (
                    <tr className="hover:bg-muted/10 transition-colors bg-destructive/[0.015]">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-destructive shrink-0" />
                          <span className="font-bold text-xs text-destructive">Rejected Claim</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/15 px-2 py-0.5 rounded-md">Rejected</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">—</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{claim.rejected_at ? new Date(claim.rejected_at).toLocaleString() : "—"}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">—</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground font-semibold italic max-w-[200px] truncate" title={claim.rejection_reason}>{claim.rejection_reason ? `"${claim.rejection_reason}"` : "—"}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Panel Column */}
        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1 pb-1 border-b border-border/40">
              <Info className="h-4 w-4 text-accent" /> Control Center
            </div>
            <div className="text-xs font-semibold text-muted-foreground bg-muted/40 px-3 py-2 rounded-lg border border-border/40 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
              {statusLabel[claim.status] ?? claim.status}
            </div>
            {canActOnCurrentStep && (
              <div className="space-y-3 pt-2">
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Decision comment or remarks..." rows={3} className="text-xs rounded-xl" />
                <div className="flex flex-col gap-2">
                  <Button className="w-full h-10 font-bold" onClick={() => decide("approved")}>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve Claim
                  </Button>
                  <Button className="w-full h-10 font-bold" variant="destructive" onClick={() => decide("rejected")}>
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject Claim
                  </Button>
                </div>
              </div>
            )}
            {claim.status === "submitted" && !canActOnCurrentStep && !isVendor && (
              <p className="text-xs text-muted-foreground/60 leading-relaxed font-semibold bg-muted/20 p-3 rounded-lg border border-border/30">
                Awaiting review action by step approver: {currentStep?.label || "authorized reviewer"}. Your assigned roles do not match action parameters.
              </p>
            )}
            {isVendor && (
              <div className="text-xs text-muted-foreground/60 leading-relaxed bg-muted/20 p-3.5 rounded-xl border border-border/30 font-semibold">
                Your claim has been submitted to Eskayef Pharmaceuticals. Live approval timeline is shown below.
              </div>
            )}
          </div>

          <div className="panel p-5 text-xs text-muted-foreground space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1 pb-1 border-b border-border/40">
              <Workflow className="h-4 w-4 text-primary" /> Approval Path Progress
            </div>
            {claim.workflow_type ? (
              <>
                <div className="flex items-center gap-1.5 font-bold text-foreground text-xs bg-muted/40 p-2 rounded-lg">
                  <Workflow className="h-4.5 w-4.5 text-accent" />
                  <span>{claim.workflow_type.name}</span>
                </div>
                <ol className="space-y-2 ml-1 mt-1">
                  <li className="flex items-center gap-2 text-success font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    Vendor submits claim
                  </li>
                  {workflowSteps.map((step: any, i: number) => {
                    const isCurrent = claim.current_step_id === step.id && claim.status === "submitted";
                    const done = (claim.approvals || []).some((a: any) => a.workflow_step_id === step.id && a.decision === "approved");
                    return (
                      <li key={step.id} className={cn("flex items-center gap-2", isCurrent ? "text-accent font-bold" : done ? "text-success font-semibold" : "text-muted-foreground/45")}>
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        ) : isCurrent ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft shrink-0" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                        )}
                        {step.label}
                      </li>
                    );
                  })}
                  <li className={cn("flex items-center gap-2", claim.status === "forwarded_to_finance" ? "text-success font-semibold" : "text-muted-foreground/45")}>
                    {claim.status === "forwarded_to_finance" ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                    )}
                    Forwarded to Finance for Payment
                  </li>
                </ol>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground/50 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" /> No workflow path assigned
              </div>
            )}
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
