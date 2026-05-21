import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { ChevronRight } from "lucide-react";

export default function ClaimsIndex({ rows }: any) {
  const columns: Column[] = [
    { key: "claim_number", label: "Claim #", sortable: true, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.claim_number}</span> },
    { key: "vendor", label: "Vendor", sortable: false, render: (r) => <span className="text-sm whitespace-nowrap font-medium">{r.vendor?.name}</span> },
    { key: "po_number", label: "PO #", sortable: true, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.po_number}</span> },
    { key: "title", label: "Title", sortable: true, render: (r) => <span className="font-medium max-w-32 md:max-w-48 truncate block">{r.title}</span> },
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
          <Button size="sm" variant="outline">Open <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button>
        </Link>
      ),
    },
  ];

  return (
    <AppShell>
      <Head title="Claims" />
      <PageHeader title="Claims" description="Vendor billing claims awaiting review." />
      <DataTable columns={columns} data={rows} exportFilename="claims" emptyMessage="No claims found." searchPlaceholder="Search claims..." />
    </AppShell>
  );
}
