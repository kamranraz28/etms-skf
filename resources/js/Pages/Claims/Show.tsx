import { useMemo, useState } from "react";
import { router, usePage, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, CheckCircle2, XCircle, Download, Receipt, FileText,
  UserCheck, Workflow,
} from "lucide-react";
import { PageSharedProps } from "@/lib/types";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";

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
        onSuccess: () => { setComment(""); sa.alert(decision === "approved" ? "Claim approved" : "Claim rejected", "...", decision === "approved" ? "success" : "warning"); },
      });
    });
  };

  const docUrl = (doc: any) => `/app/claims/${claim.id}/documents/${doc.id}`;

  const statusLabel: Record<string, string> = {
    submitted: "Submitted — pending review",
    forwarded_to_finance: "Forwarded to Finance for Payment",
    rejected: "Rejected",
  };

  const billTypeLabel: Record<string, string> = {
    plant_other: "Plant / Other Bill",
    ohq_packing: "OHQ Packing Material Bill",
  };

  return (
    <AppShell>
      <Head title={`Claim · ${claim.claim_number}`} />
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-3"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
      <PageHeader title={`Claim · ${claim.claim_number}`} description={claim.title} actions={<StatusBadge status={claim.status} />} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="panel p-5 space-y-4">
            <div className="panel-title"><Receipt className="h-4.5 w-4.5 text-accent" /> Claim details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><span className="text-muted-foreground text-xs">Vendor</span><div className="font-medium mt-0.5">{claim.vendor?.name}</div></div>
              <div><span className="text-muted-foreground text-xs">ERP code</span><div className="font-mono mt-0.5">{claim.vendor?.erp_code ?? "—"}</div></div>
              <div><span className="text-muted-foreground text-xs">Bill #</span><div className="font-mono mt-0.5">{claim.bill_number ?? "—"}</div></div>
              <div><span className="text-muted-foreground text-xs">Bill Date</span><div className="mt-0.5">{claim.bill_date ?? "—"}</div></div>
              <div><span className="text-muted-foreground text-xs">Bill Type</span><div className="mt-0.5">{billTypeLabel[claim.bill_type] ?? claim.bill_type ?? "—"}</div></div>
              <div><span className="text-muted-foreground text-xs">PO #</span><div className="font-mono mt-0.5">{claim.po_number}</div></div>
              <div><span className="text-muted-foreground text-xs">Amount</span><div className="font-mono font-bold text-lg mt-0.5">{Number(claim.amount).toLocaleString()} BDT</div></div>
              <div><span className="text-muted-foreground text-xs">Submitted</span><div className="mt-0.5">{new Date(claim.submitted_at).toLocaleString()}</div></div>
              <div className="sm:col-span-2"><span className="text-muted-foreground text-xs">Description</span><div className="text-sm mt-0.5">{claim.description ?? "—"}</div></div>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="panel-header bg-gradient-to-r from-card to-muted/20">
              <div className="panel-title"><FileText className="h-4.5 w-4.5 text-primary" /> Supporting documents</div>
            </div>
            <ul className="divide-y divide-border/40">
              {claim.documents?.length === 0 && <li className="px-5 py-4 text-sm text-muted-foreground">No documents uploaded.</li>}
              {claim.documents?.map((doc: any) => (
                <li key={doc.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusBadge status={doc.document_type} className="capitalize shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{doc.original_name}</div>
                      {doc.file_size && <div className="text-xs text-muted-foreground">{(doc.file_size / 1024).toFixed(1)} KB</div>}
                    </div>
                  </div>
                  <a href={docUrl(doc)}><Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" /> Download</Button></a>
                </li>
              ))}
            </ul>
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
                  <tr className="hover:bg-muted/20 transition-colors bg-success/5">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <span className="font-semibold text-xs">Vendor Submission</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-success">Submitted</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{claim.vendor?.name || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(claim.submitted_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground italic">—</td>
                  </tr>
                  {workflowSteps.map((step: any) => {
                    const approval = approvalMap[step.id];
                    const isCurrent = claim.current_step_id === step.id;
                    return (
                      <tr key={step.id} className={`hover:bg-muted/20 transition-colors ${isCurrent ? "bg-accent/5" : ""}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {approval?.decision === "approved" ? (
                              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                            ) : approval?.decision === "rejected" ? (
                              <XCircle className="h-4 w-4 text-destructive shrink-0" />
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
                            <span className={`text-xs font-medium ${approval.decision === "approved" ? "text-success" : "text-destructive"}`}>
                              {approval.decision}
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
                  {claim.status === "forwarded_to_finance" && (
                    <tr className="hover:bg-muted/20 transition-colors bg-success/5">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                          <span className="font-semibold text-xs text-success">Forwarded to Finance for Payment</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-success">Completed</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{claim.forwarded_to_finance_at ? new Date(claim.forwarded_to_finance_at).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground italic">—</td>
                    </tr>
                  )}
                  {claim.status === "rejected" && (
                    <tr className="hover:bg-muted/20 transition-colors bg-destructive/5">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-destructive shrink-0" />
                          <span className="font-semibold text-xs text-destructive">Rejected</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-destructive">Rejected</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{claim.rejected_at ? new Date(claim.rejected_at).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground italic max-w-[200px] truncate">{claim.rejection_reason ? `"${claim.rejection_reason}"` : "—"}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="panel-title">Actions</div>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40">{statusLabel[claim.status] ?? claim.status}</p>
            {canActOnCurrentStep && (
              <>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment" rows={3} />
                <div className="flex flex-col gap-2">
                  <Button className="w-full" onClick={() => decide("approved")}><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</Button>
                  <Button className="w-full" variant="destructive" onClick={() => decide("rejected")}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                </div>
              </>
            )}
            {claim.status === "submitted" && !canActOnCurrentStep && !isVendor && (
              <p className="text-xs text-muted-foreground">
                Awaiting {currentStep?.label || "approver"} action. Your role does not match the current step.
              </p>
            )}
            {isVendor && (
              <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/40">
                You can track the live approval progress of your claim here.
              </div>
            )}
          </div>

          <div className="panel p-5 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Workflow className="h-4 w-4 text-accent" /> Workflow
            </div>
            {claim.workflow_type ? (
              <>
                <div className="flex items-center gap-1.5 mb-2">
                  <Workflow className="h-3.5 w-3.5 text-accent" />
                  <span className="font-semibold text-foreground text-xs">{claim.workflow_type.name}</span>
                </div>
                <ol className="space-y-1.5 ml-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    0. Vendor submits claim
                  </li>
                  {workflowSteps.map((step: any, i: number) => {
                    const isCurrent = claim.current_step_id === step.id;
                    const done = (claim.approvals || []).some((a: any) => a.workflow_step_id === step.id && a.decision === "approved");
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
                    {claim.status === "forwarded_to_finance" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                    )}
                    {workflowSteps.length + 1}. Forwarded to Finance for Payment
                  </li>
                </ol>
              </>
            ) : (
              <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> Workflow not assigned</div>
            )}
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
