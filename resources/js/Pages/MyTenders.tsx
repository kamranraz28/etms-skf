import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { ChevronRight } from "lucide-react";

export default function MyTenders({ rows }: any) {
  const columns: Column[] = [
    { key: "tender_number", label: "Tender #", sortable: true, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.tender_number}</span> },
    { key: "title", label: "Title", sortable: true, render: (r) => <span className="font-medium min-w-0 max-w-[200px] truncate block">{r.title}</span> },
    { key: "deadline", label: "Deadline", sortable: true, render: (r) => <span className="text-xs whitespace-nowrap">{new Date(r.deadline).toLocaleString()}</span> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "hasBid",
      label: "My bid",
      sortable: false,
      render: (r) => r.hasBid ? <span className="text-success text-xs font-semibold">Submitted</span> : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: "actions" as string,
      label: "Action",
      className: "text-right",
      exportable: false,
      render: (r: any) => {
        const past = new Date(r.deadline) < new Date();
        const canBid = r.status === "open" && !past && !r.hasBid && r.vendorStatus === "active";
        return canBid ? (
          <Link href={`/app/my-tenders/${r.id}/bid`} onClick={(e) => e.stopPropagation()}>
            <Button size="sm">Submit bid <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button>
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground">{past ? "Deadline passed" : r.hasBid ? "Already bid" : r.vendorStatus !== "active" ? "Profile not active" : "Closed"}</span>
        );
      },
    },
  ];

  return (
    <AppShell>
      <Head title="My tenders" />
      <PageHeader title="My tenders" description="Tenders you've been invited to bid on." />
      <DataTable columns={columns} data={rows} exportFilename="my-tenders" emptyMessage="No tenders assigned yet." searchPlaceholder="Search tenders..." />
    </AppShell>
  );
}
