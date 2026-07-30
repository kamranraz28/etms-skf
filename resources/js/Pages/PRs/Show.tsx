import { useState, useMemo } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { ArrowLeft, Gavel, Scale, ExternalLink, FileText, CheckCircle2, X } from "lucide-react";

export default function PrShow({ pr, approvedCsList }: any) {
  const sa = useSweetAlert();
  const [csModalItem, setCsModalItem] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  const items = pr.items ?? [];
  const assignments = pr.assignments ?? [];

  const getAssignment = (idx: number) => assignments.find((a: any) => a.item_index === idx);
  const isPending = (idx: number) => {
    const a = getAssignment(idx);
    return !a || a.status === "pending";
  };

  const assignCs = (csId: string) => {
    if (!csModalItem === null) return;
    setAssigning(true);
    router.post(`/app/prs/${pr.id}/assign-cs`, {
      item_index: csModalItem,
      cs_id: csId,
    }, {
      onSuccess: () => {
        setCsModalItem(null);
        setAssigning(false);
        sa.alert("CS assigned", "CS record has been linked to this item.", "success");
      },
      onError: () => setAssigning(false),
    });
  };

  return (
    <AppShell>
      <Head title={pr.pr_number} />
      <Button variant="ghost" size="sm" onClick={() => router.get("/app/prs")} className="mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to PRs
      </Button>
      <PageHeader
        title={`${pr.pr_number} · ${pr.title}`}
        description={`${pr.department ?? "No department"} · ${items.length} item${items.length !== 1 ? "s" : ""}`}
        actions={<StatusBadge status={pr.derived_status ?? pr.status} />}
      />

      <div className="panel overflow-hidden">
        <div className="panel-header bg-gradient-to-r from-card to-muted/20">
          <div className="panel-title"><FileText className="h-4 w-4 text-primary" /> Items & procurement status</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-muted/40 to-muted/20">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Reference</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {items.map((item: any, idx: number) => {
                const assignment = getAssignment(idx);
                const pending = isPending(idx);
                const itemStatus = assignment?.status ?? "pending";
                return (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.qty} {item.unit}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={itemStatus} />
                    </td>
                    <td className="px-4 py-3">
                      {itemStatus === "in_tender" && assignment?.tender && (
                        <Link href={`/app/tenders/${assignment.tender_id}`} className="flex items-center gap-1 text-xs text-accent hover:underline">
                          <ExternalLink className="h-3 w-3" /> {assignment.tender.tender_number}
                        </Link>
                      )}
                      {itemStatus === "cs_assigned" && assignment?.cs && (
                        <Link href={`/app/cs/${assignment.cs_id}`} className="flex items-center gap-1 text-xs text-accent hover:underline">
                          <ExternalLink className="h-3 w-3" /> CS-{assignment.cs_id}
                        </Link>
                      )}
                      {pending && <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {pending ? (
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/app/tenders/new?pr=${pr.id}`}>
                            <Button size="sm" variant="outline">
                              <Gavel className="h-3.5 w-3.5 mr-1" /> Tender
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" onClick={() => setCsModalItem(idx)}>
                            <Scale className="h-3.5 w-3.5 mr-1" /> Assign CS
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-success flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {csModalItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setCsModalItem(null)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Scale className="h-4 w-4 text-accent" /> Assign existing CS · Item {csModalItem + 1}: {items[csModalItem]?.name}
              </div>
              <button onClick={() => setCsModalItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-3">
              {approvedCsList.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No approved CS records available. Generate a CS from a tender first.
                </p>
              )}
              {approvedCsList.map((cs: any) => (
                <div key={cs.id} className="border border-border/40 rounded-xl p-4 hover:border-accent/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm">CS-{cs.id}</div>
                    <Button size="sm" onClick={() => assignCs(cs.id)} disabled={assigning}>
                      {assigning ? "Assigning…" : "Assign"}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>Tender: {cs.tender?.tender_number} · {cs.tender?.title}</div>
                    <div>Created: {new Date(cs.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sa.SweetAlert}
    </AppShell>
  );
}
