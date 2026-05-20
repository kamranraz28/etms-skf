import { useState } from "react";
import { router, usePage, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, XCircle, Download, Receipt, FileText, UserCheck } from "lucide-react";
import { PageSharedProps } from "@/lib/types";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";

export default function ClaimsShow({ claim = {} as any }: any) {
  const { props } = usePage<PageSharedProps>();
  const primary = props.auth.user?.primary_role;
  const [comment, setComment] = useState("");
  const sa = useSweetAlert();

  const canDecide =
    (claim.status === "submitted" && primary === "procurement") ||
    (claim.status === "under_review_approver" && primary === "approver") ||
    ((claim.status === "under_review_admin" || claim.status === "under_review_procurement") && primary === "admin");

  const decide = (decision: "approved" | "rejected") => {
    const title = decision === "approved" ? "Approve claim?" : "Reject claim?";
    const desc = decision === "approved" ? "This will approve the claim." : "This will reject the claim.";
    sa.confirmAction(title, desc, decision === "approved" ? "Approve" : "Reject").then(ok => {
      if (ok) router.post(`/app/claims/${claim.id}/decide`, { decision, comment }, {
        onSuccess: () => { setComment(""); sa.alert(decision === "approved" ? "Claim approved" : "Claim rejected", "...", decision === "approved" ? "success" : "warning"); },
      });
    });
  };

  const docUrl = (doc: any) => `/app/claims/${claim.id}/documents/${doc.id}`;

  const statusLabel: Record<string, string> = {
    submitted: "Submitted — awaiting procurement review",
    under_review_procurement: "Under review — procurement panel",
    under_review_approver: "Under review — approver panel",
    under_review_admin: "Under review — admin panel",
    approved: "Approved",
    rejected: "Rejected",
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
              <div><span className="text-muted-foreground text-xs">Tender #</span><div className="font-mono mt-0.5">{claim.tender_number}</div></div>
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
              <div className="panel-title"><UserCheck className="h-4.5 w-4.5 text-accent" /> Claim lifecycle</div>
            </div>
            <ul className="divide-y divide-border/40">
              <li className="px-5 py-4 flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center mt-0.5 shrink-0">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                </div>
                <div className="text-sm min-w-0">
                  <div className="font-medium">Submitted</div>
                  <div className="text-xs text-muted-foreground">{new Date(claim.submitted_at).toLocaleString()}</div>
                </div>
              </li>
              {claim.approvals?.length === 0 && <li className="px-5 py-4 text-sm text-muted-foreground">No decisions yet.</li>}
              {claim.approvals?.map((a: any) => (
                <li key={a.id} className="px-5 py-4 flex items-start gap-3 hover:bg-muted/10 transition-colors">
                  {a.decision === "approved" ? <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />}
                  <div className="text-sm min-w-0">
                    <div><span className="font-bold uppercase text-xs">{a.panel}</span> · {a.decision}
                      <span className="ml-2 text-xs text-muted-foreground">{new Date(a.acted_at).toLocaleString()}</span>
                    </div>
                    {a.comment && <div className="text-xs text-muted-foreground mt-0.5 italic">"{a.comment}"</div>}
                    <div className="text-xs text-muted-foreground">by {a.actor?.full_name}</div>
                  </div>
                </li>
              ))}
              {claim.status === "approved" && (
                <li className="px-5 py-4 flex items-start gap-3 bg-success/5">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <div className="font-bold text-success">Approved</div>
                    <div className="text-xs text-muted-foreground">{new Date(claim.approved_at).toLocaleString()}</div>
                  </div>
                </li>
              )}
              {claim.status === "rejected" && (
                <li className="px-5 py-4 flex items-start gap-3 bg-destructive/5">
                  <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                  <div className="text-sm min-w-0">
                    <div className="font-bold text-destructive">Rejected</div>
                    <div className="text-xs text-muted-foreground">{new Date(claim.rejected_at).toLocaleString()}</div>
                    {claim.rejection_reason && <div className="text-xs text-muted-foreground mt-0.5">Reason: "{claim.rejection_reason}"</div>}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="panel-title">Actions</div>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/40">{statusLabel[claim.status] ?? claim.status}</p>
            {canDecide && (
              <>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment" rows={3} />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="flex-1" onClick={() => decide("approved")}><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</Button>
                  <Button className="flex-1" variant="destructive" onClick={() => decide("rejected")}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                </div>
              </>
            )}
            {!canDecide && !["approved", "rejected"].includes(claim.status) && (
              <p className="text-xs text-muted-foreground">Awaiting action from the appropriate panel.</p>
            )}
          </div>
          <div className="panel p-5 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Receipt className="h-4 w-4 text-accent" /> Workflow
            </div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 1. Vendor submits claim with documents</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 2. Procurement reviews & forwards</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 3. Approver reviews & forwards</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 4. Admin gives final approval</div>
            <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent/50" /> 5. Any panel can reject</div>
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
