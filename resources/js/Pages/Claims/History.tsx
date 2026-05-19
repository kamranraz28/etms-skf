import { useState } from "react";
import { Link, router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Search } from "lucide-react";

export default function ClaimHistory({ claims, vendors, filters }: any) {
  const [vendorId, setVendorId] = useState(filters.vendor_id);
  const [status, setStatus] = useState(filters.status);

  const filter = () => {
    const params = new URLSearchParams();
    if (vendorId) params.set("vendor_id", vendorId);
    if (status) params.set("status", status);
    router.get(`/app/claims/history?${params.toString()}`);
  };

  const statuses = ["", "submitted", "under_review_procurement", "under_review_approver", "under_review_admin", "approved", "rejected"];

  return (
    <AppShell>
      <Head title="Claim History" />
      <PageHeader title="Claim History" description="Complete bill claiming history report. Filter by vendor and status." />
      <div className="panel p-4 mb-5">
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="w-full sm:flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Vendor</label>
            <select className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">All vendors</option>
              {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.erp_code ?? "—"})</option>)}
            </select>
          </div>
          <div className="w-full sm:flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
            <select className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
            </select>
          </div>
          <Button onClick={filter} className="w-full sm:w-auto"><Search className="h-4 w-4 mr-1" /> Filter</Button>
        </div>
      </div>
      <div className="panel overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Claim #</th><th>Vendor</th><th>ERP</th><th>Tender #</th><th>Title</th><th className="text-right">Amount</th><th>Submitted</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {claims.length === 0 && <tr><td colSpan={9} className="text-center text-muted-foreground py-8">No claims match your filters.</td></tr>}
            {claims.map((c: any) => (
              <tr key={c.id}>
                <td className="font-mono text-xs whitespace-nowrap">{c.claim_number}</td>
                <td className="whitespace-nowrap">{c.vendor?.name}</td>
                <td className="font-mono text-xs whitespace-nowrap">{c.vendor?.erp_code ?? "—"}</td>
                <td className="font-mono text-xs whitespace-nowrap">{c.tender_number}</td>
                <td className="max-w-32 md:max-w-40 truncate">{c.title}</td>
                <td className="text-right font-mono whitespace-nowrap">{Number(c.amount).toLocaleString()}</td>
                <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(c.submitted_at).toLocaleString()}</td>
                <td><StatusBadge status={c.status} /></td>
                <td className="text-right whitespace-nowrap"><Link href={`/app/claims/${c.id}`}><Button size="sm" variant="outline">View <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
