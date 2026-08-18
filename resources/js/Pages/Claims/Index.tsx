import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { ChevronRight, Receipt, DollarSign, Clock, CheckCircle } from "lucide-react";
import { useMemo } from "react";

export default function ClaimsIndex({ rows = [] }: any) {
  // Claims summary stats
  const stats = useMemo(() => {
    const totalCount = rows.length;
    const totalAmt = rows.reduce((s: number, r: any) => s + Number(r.amount || 0), 0);
    const pendingCount = rows.filter((r: any) => r.status?.toLowerCase() === "pending" || r.status?.toLowerCase().includes("review") || r.status?.toLowerCase().includes("pending")).length;
    const approvedCount = rows.filter((r: any) => r.status?.toLowerCase() === "approved").length;
    return { totalCount, totalAmt, pendingCount, approvedCount };
  }, [rows]);

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
    { key: "bill_number", label: "Bill Reference", sortable: true, render: (r) => <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{r.bill_number ?? "—"}</span> },
    { key: "po_number", label: "PO Reference", sortable: true, render: (r) => <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{r.po_number}</span> },
    { key: "title", label: "Claim Title", sortable: true, render: (r) => <span className="font-medium text-foreground max-w-48 truncate block">{r.title}</span> },
    {
      key: "amount",
      label: "Claim Amount",
      sortable: true,
      className: "text-right",
      render: (r) => <span className="font-mono text-xs font-bold text-foreground whitespace-nowrap">৳ {Number(r.amount).toLocaleString()}</span>
    },
    { key: "current_step", label: "Current workflow step", sortable: false, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">{r.current_step?.label ?? "—"}</span> },
    { key: "submitted_at", label: "Submitted", sortable: true, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.submitted_at).toLocaleString()}</span> },
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

  const summaryCards = [
    { label: "Total Claims", value: stats.totalCount, icon: Receipt, color: "from-primary/15 to-primary/5", iconColor: "text-primary" },
    { label: "Total Amount", value: `৳${stats.totalAmt.toLocaleString()}`, icon: DollarSign, color: "from-accent/15 to-accent/5", iconColor: "text-accent" },
    { label: "Pending Review", value: stats.pendingCount, icon: Clock, color: "from-warning/15 to-warning/5", iconColor: "text-warning" },
    { label: "Approved Claims", value: stats.approvedCount, icon: CheckCircle, color: "from-success/15 to-success/5", iconColor: "text-success" },
  ];

  return (
    <AppShell>
      <Head title="Claims" />
      <PageHeader title="Claims" description="Vendor billing claims and invoices submitted for multi-level review and payment execution." />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger-children">
        {summaryCards.map((card, i) => (
          <div key={i} className="relative bg-card border border-border/50 rounded-2xl p-4 overflow-hidden hover-lift">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</span>
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground font-display truncate">{card.value}</div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={rows} exportFilename="claims" emptyMessage="No billing claims found." searchPlaceholder="Search claims..." />
    </AppShell>
  );
}
