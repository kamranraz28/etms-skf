import { useState } from "react";
import { Link, router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { ChevronRight, Search, Filter } from "lucide-react";

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

  const columns: Column[] = [
    { key: "claim_number", label: "Claim #", sortable: true, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.claim_number}</span> },
    { key: "vendor", label: "Vendor", sortable: false, render: (r) => <span className="whitespace-nowrap font-medium">{r.vendor?.name}</span> },
    { key: "erp_code", label: "ERP", sortable: false, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.vendor?.erp_code ?? "—"}</span> },
    { key: "tender_number", label: "Tender #", sortable: true, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.tender_number}</span> },
    { key: "title", label: "Title", sortable: true, render: (r) => <span className="max-w-32 md:max-w-40 truncate block">{r.title}</span> },
    { key: "amount", label: "Amount", sortable: true, className: "text-right", render: (r) => <span className="font-mono whitespace-nowrap">{Number(r.amount).toLocaleString()}</span> },
    { key: "submitted_at", label: "Submitted", sortable: true, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.submitted_at).toLocaleString()}</span> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions" as string,
      label: "Actions",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <Link href={`/app/claims/${r.id}`} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline">View <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button>
        </Link>
      ),
    },
  ];

  const filtersEl = (
    <div className="flex flex-col sm:flex-row items-end gap-3">
      <div className="w-full sm:flex-1">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Vendor</label>
        <select className="h-10 w-full rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
          <option value="">All vendors</option>
          {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.erp_code ?? "—"})</option>)}
        </select>
      </div>
      <div className="w-full sm:flex-1">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
        <select className="h-10 w-full rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring" value={status} onChange={(e) => setStatus(e.target.value)}>
          {statuses.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
      </div>
      <Button onClick={filter} className="w-full sm:w-auto"><Search className="h-4 w-4 mr-1" /> Filter</Button>
    </div>
  );

  return (
    <AppShell>
      <Head title="Claim History" />
      <PageHeader title="Claim History" description="Complete bill claiming history report. Filter by vendor and status." />
      <DataTable
        columns={columns}
        data={claims}
        exportFilename="claim-history"
        emptyMessage="No claims match your filters."
        searchPlaceholder="Search claim history..."
        filterable
        filters={filtersEl}
      />
    </AppShell>
  );
}
