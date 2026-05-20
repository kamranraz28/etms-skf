import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { PageSharedProps } from "@/lib/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, ExternalLink, Lock, Scale } from "lucide-react";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";

export default function TenderShow({ tender, vendors, bids, cs }: any) {
  const { props } = usePage<PageSharedProps>();
  const sa = useSweetAlert();
  const primary = props.auth.user?.primary_role;
  const lowest = bids[0];
  const closeTender = async () => {
    const confirmed = await sa.confirmAction("Close tender?", "This will prevent new bids.", "Close tender");
    if (confirmed) {
      router.post(`/app/tenders/${tender.id}/close`, {}, {
        onSuccess: () => sa.alert("Tender closed", "Tender has been closed successfully.", "success"),
      });
    }
  };
  const generateCS = async () => {
    const confirmed = await sa.confirmAction("Generate Comparison Statement?", "Create CS from winning bid?", "Generate");
    if (confirmed) {
      router.post(`/app/tenders/${tender.id}/generate-cs`, {}, {
        onSuccess: () => sa.alert("CS generated", "Comparison statement has been generated.", "success"),
      });
    }
  };

  return (
    <AppShell>
      <Head title={tender.title} />
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <PageHeader
        title={tender.title}
        description={`${tender.tender_number} · Deadline ${new Date(tender.deadline).toLocaleString()}`}
        actions={
          <div className="flex gap-2 items-center flex-wrap">
            <StatusBadge status={tender.status} />
            {tender.status === "open" && (
              <Button variant="outline" size="sm" onClick={closeTender}><Lock className="h-4 w-4 mr-1" /> Close tender</Button>
            )}
            {tender.status !== "open" && bids.length > 0 && !cs && (primary === "admin" || primary === "procurement") && (
              <Button size="sm" onClick={generateCS}><Scale className="h-4 w-4 mr-1" /> Generate CS</Button>
            )}
            {cs && (
              <Link href={`/app/cs/${cs.id}`}><Button size="sm" variant="outline"><ExternalLink className="h-4 w-4 mr-1" /> Open CS</Button></Link>
            )}
          </div>
        }
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="panel overflow-x-auto">
            <div className="panel-header"><div className="panel-title">Bids received ({bids.length})</div></div>
            <table className="data-table">
              <thead><tr><th>Vendor</th><th>ERP</th><th>Submitted</th></tr></thead>
              <tbody>
                {bids.length === 0 && <tr><td colSpan={3} className="text-center text-muted-foreground py-6">No bids yet.</td></tr>}
                {bids.map((b: any) => (
                  <tr key={b.id} className={lowest?.id === b.id ? "bg-success/5" : ""}>
                    <td className="font-medium whitespace-nowrap">
                      {b.vendor?.name}
                      {lowest?.id === b.id && <span className="ml-2 text-[10px] uppercase tracking-wider text-success">L1</span>}
                    </td>
                    <td className="font-mono text-xs whitespace-nowrap">{b.vendor?.erp_code ?? <span className="text-warning">—</span>}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(b.submitted_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tender.pr && (
            <div className="panel overflow-x-auto">
              <div className="panel-header"><div className="panel-title">Requisition items · {tender.pr.pr_number}</div></div>
              <table className="data-table">
                <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Invited categories</th></tr></thead>
                <tbody>
                  {(tender.pr.items ?? []).map((it: any, i: number) => {
                    const cats = (tender.item_categories ?? []).filter((ic: any) => ic.item_index === i);
                    return (
                      <tr key={i}>
                        <td className="min-w-0 max-w-[150px] truncate">{it.name}</td>
                        <td className="whitespace-nowrap">{it.qty}</td>
                        <td className="whitespace-nowrap">{it.unit}</td>
                        <td>
                          {cats.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {cats.map((ic: any) => (
                                <span key={ic.id} className="text-[10px] bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {ic.vendor_category?.name ?? 'Cat #'+ic.vendor_category_id}
                                </span>
                              ))}
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6 min-w-0">
          <div className="panel">
            <div className="panel-header"><div className="panel-title">Invited vendors ({vendors.length})</div></div>
            <ul className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {vendors.map((v: any) => (
                <li key={v.id} className="px-4 py-2.5">
                  <div className="text-sm font-medium truncate">{v.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{v.email}</div>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <StatusBadge status={v.status} />
                    {v.vendor_category_id && <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{v.vendor_category?.name ?? ''}</span>}
                    {v.erp_code ? <span className="text-[10px] font-mono text-muted-foreground">ERP: {v.erp_code}</span> : <span className="text-[10px] text-warning">No ERP code</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {tender.description && (
            <div className="panel p-4">
              <div className="panel-title mb-2">Scope</div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{tender.description}</p>
            </div>
          )}
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
