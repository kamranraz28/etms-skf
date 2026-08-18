import { useState } from "react";
import { Link, router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { ChevronRight, Search, Filter, Calendar } from "lucide-react";

export default function ClaimHistory({ claims, vendors, filters }: any) {
  const [vendorId, setVendorId] = useState(filters.vendor_id);
  const [status, setStatus] = useState(filters.status);

  const filter = () => {
    const params = new URLSearchParams();
    if (vendorId) params.set("vendor_id", vendorId);
    if (status) params.set("status", status);
    router.get(`/app/claims/history?${params.toString()}`);
  };

  const statuses = ["", "submitted", "forwarded_to_finance", "rejected"];

  const columns: Column[] = [
    {
      key: "claim_number",
      label: "Claim #",
      sortable: true,
      render: (r) => <span className="font-mono text-xs font-semibold bg-muted/60 px-2 py-0.5 rounded-md whitespace-nowrap">{r.claim_number}</span>
    },
    {
      key: "vendor",
      label: "Vendor",
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {r.vendor?.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">{r.vendor?.name}</span>
        </div>
      )
    },
    { key: "erp_code", label: "ERP Code", sortable: false, render: (r) => <span className="font-mono text-xs whitespace-nowrap bg-muted/60 px-2 py-0.5 rounded-md">{r.vendor?.erp_code ?? <span className="text-warning font-semibold">—</span>}</span> },
    { key: "bill_number", label: "Bill Reference", sortable: true, render: (r) => <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{r.bill_number ?? "—"}</span> },
    { key: "po_number", label: "PO Reference", sortable: true, render: (r) => <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{r.po_number}</span> },
    { key: "title", label: "Claim Title", sortable: true, render: (r) => <span className="font-medium text-foreground max-w-40 truncate block">{r.title}</span> },
    {
      key: "amount",
      label: "Claim Amount",
      sortable: true,
      className: "text-right",
      render: (r) => <span className="font-mono text-xs font-bold text-foreground whitespace-nowrap">৳ {Number(r.amount).toLocaleString()}</span>
    },
    {
      key: "submitted_at",
      label: "Submitted Date",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
          <Calendar className="h-3.5 w-3.5" />
          <span>{new Date(r.submitted_at).toLocaleDateString()}</span>
        </div>
      )
    },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions" as string,
      label: "Action",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <Link href={`/app/claims/${r.id}`} onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" className="h-8 py-0 px-3 text-xs gap-1">
            Open <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      ),
    },
  ];

  const filtersEl = (
    <div className="flex flex-col sm:flex-row items-end gap-3.5">
      <div className="w-full sm:flex-1 space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Vendor Account</label>
        <select className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/25 transition-all" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
          <option value="">All vendors</option>
          {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name} ({v.erp_code ?? "—"})</option>)}
        </select>
      </div>
      <div className="w-full sm:flex-1 space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Approval Status</label>
        <select className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/25 transition-all" value={status} onChange={(e) => setStatus(e.target.value)}>
          {statuses.map((s) => <option key={s} value={s}>{s ? s.replace(/_/g, " ").toUpperCase() : "ALL STATUSES"}</option>)}
        </select>
      </div>
      <Button onClick={filter} className="w-full sm:w-auto h-10 px-5 gap-2 shrink-0">
        <Search className="h-4 w-4" /> Apply Filters
      </Button>
    </div>
  );

  return (
    <AppShell>
      <Head title="Claim History Reports" />
      <PageHeader title="Claim History Reports" description="Complete audit reports of vendor invoice billing claims. Filter records by status or supplier." />
      <DataTable
        columns={columns}
        data={claims}
        exportFilename="claim-history"
        emptyMessage="No claims matched the filter query parameters."
        searchPlaceholder="Search claim history..."
        filterable
        filters={filtersEl}
      />
    </AppShell>
  );
}
