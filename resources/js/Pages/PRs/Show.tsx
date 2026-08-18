import { useState, useMemo } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { ArrowLeft, Gavel, Scale, ExternalLink, FileText, CheckCircle2, X, Building, Layers } from "lucide-react";

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
    if (csModalItem === null) return;
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

  // Derived counts
  const totalItems = items.length;
  const completedItems = items.filter((_: any, idx: number) => !isPending(idx)).length;

  return (
    <AppShell>
      <Head title={`${pr.pr_number} - Purchase Requisition`} />
      
      <Button variant="ghost" size="sm" onClick={() => router.get("/app/prs")} className="mb-4 hover:bg-muted/80 gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to PRs
      </Button>

      <PageHeader
        title={`${pr.pr_number}`}
        description={pr.title}
        actions={<StatusBadge status={pr.derived_status ?? pr.status} />}
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Requisition Info Panel */}
        <div className="panel lg:col-span-1 h-fit">
          <div className="panel-header">
            <div className="panel-title">
              <Building className="h-4 w-4 text-primary" />
              Requisition Info
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border/40">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</span>
              <span className="text-sm font-semibold text-foreground">{pr.department ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border/40">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Items Synced</span>
              <span className="text-sm font-semibold text-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border/40">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Overview</span>
              <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-md">
                {completedItems} of {totalItems} completed
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sync Date</span>
              <span className="text-xs font-medium text-muted-foreground">{new Date(pr.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Item List Panel */}
        <div className="panel lg:col-span-2 overflow-hidden">
          <div className="panel-header">
            <div className="panel-title">
              <Layers className="h-4 w-4 text-accent" />
              Line Items & Procurement Actions
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/40">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-12">#</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Item</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-24">Qty</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-32">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Reference</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-44">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {items.map((item: any, idx: number) => {
                  const assignment = getAssignment(idx);
                  const pending = isPending(idx);
                  const itemStatus = assignment?.status ?? "pending";
                  return (
                    <tr key={idx} className="hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground/60">{idx + 1}</td>
                      <td className="px-5 py-4 font-semibold text-foreground">{item.name}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-bold bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-md">
                          {item.qty} {item.unit}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={itemStatus} className="text-[10px]" />
                      </td>
                      <td className="px-5 py-4">
                        {itemStatus === "in_tender" && assignment?.tender && (
                          <Link href={`/app/tenders/${assignment.tender_id}`} className="inline-flex items-center gap-1 text-xs text-accent font-semibold hover:underline">
                            <ExternalLink className="h-3 w-3" /> {assignment.tender.tender_number}
                          </Link>
                        )}
                        {itemStatus === "cs_assigned" && assignment?.cs && (
                          <Link href={`/app/cs/${assignment.cs_id}`} className="inline-flex items-center gap-1 text-xs text-accent font-semibold hover:underline">
                            <ExternalLink className="h-3 w-3" /> CS-{assignment.cs_id}
                          </Link>
                        )}
                        {pending && <span className="text-xs text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {pending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/app/tenders/new?pr=${pr.id}`}>
                              <Button size="sm" variant="outline" className="h-8 py-0 px-2.5 text-xs gap-1">
                                <Gavel className="h-3 w-3" /> Tender
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" className="h-8 py-0 px-2.5 text-xs gap-1" onClick={() => setCsModalItem(idx)}>
                              <Scale className="h-3 w-3" /> Link CS
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-success font-semibold flex items-center justify-end gap-1 select-none">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Handled
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
      </div>

      {/* Link CS Modal */}
      {csModalItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setCsModalItem(null)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-dialog w-full max-w-2xl max-h-[80vh] overflow-hidden m-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border/40 bg-gradient-to-r from-card to-muted/20">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Scale className="h-4 w-4 text-accent animate-pulse-soft" /> Link CS for Item {csModalItem + 1}: {items[csModalItem]?.name}
              </div>
              <button onClick={() => setCsModalItem(null)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[55vh] p-6 space-y-4">
              {approvedCsList.length === 0 && (
                <div className="flex flex-col items-center py-10 px-4 text-center">
                  <div className="h-12 w-12 rounded-2xl bg-muted/40 flex items-center justify-center mb-3">
                    <Scale className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No approved comparative statements</p>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    No approved CS records are available. Create a tender, collect bids, and approve the comparison statement first.
                  </p>
                </div>
              )}
              {approvedCsList.map((cs: any) => (
                <div key={cs.id} className="border border-border/60 hover:border-accent/40 rounded-xl p-4 transition-all duration-200 bg-gradient-to-br from-card to-muted/10 hover:shadow-sm flex items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="font-bold text-sm text-foreground">Comparative Statement #{cs.id}</div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div className="truncate font-medium">Tender: {cs.tender?.tender_number} · {cs.tender?.title}</div>
                      <div>Approved: {new Date(cs.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Button size="sm" className="h-9 px-4 shrink-0" onClick={() => assignCs(cs.id)} disabled={assigning}>
                    {assigning ? "Linking…" : "Link Statement"}
                  </Button>
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
