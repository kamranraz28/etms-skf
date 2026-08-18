import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { ChevronRight, Calendar, AlertCircle } from "lucide-react";

export default function MyTenders({ rows }: any) {
  const columns: Column[] = [
    {
      key: "tender_number",
      label: "Tender #",
      sortable: true,
      render: (r) => <span className="font-mono text-xs font-semibold bg-muted/60 px-2 py-0.5 rounded-md whitespace-nowrap">{r.tender_number}</span>
    },
    { key: "title", label: "Title", sortable: true, render: (r) => <span className="font-semibold text-sm text-foreground min-w-0 max-w-[240px] truncate block">{r.title}</span> },
    {
      key: "deadline",
      label: "Bid Deadline",
      sortable: true,
      render: (r) => {
        const past = new Date(r.deadline) < new Date();
        return (
          <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className={past ? "text-destructive font-medium" : "text-muted-foreground"}>
              {new Date(r.deadline).toLocaleString()}
            </span>
          </div>
        );
      }
    },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "hasBid",
      label: "Submission Status",
      sortable: false,
      render: (r) => r.hasBid 
        ? <span className="text-[10px] bg-success/10 text-success border border-success/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Submitted</span> 
        : <span className="text-muted-foreground/40 text-xs font-medium">—</span>,
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
            <Button size="sm" className="h-8 py-0 px-3 text-xs gap-1">
              Submit Bid <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground/65 font-medium">
            {past ? (
              <span className="text-destructive/80 font-bold flex items-center justify-end gap-1"><AlertCircle className="h-3.5 w-3.5" /> Closed</span>
            ) : r.hasBid ? (
              "Already Submitted"
            ) : r.vendorStatus !== "active" ? (
              "Profile Not Activated"
            ) : (
              "Evaluation Stage"
            )}
          </span>
        );
      },
    },
  ];

  return (
    <AppShell>
      <Head title="My Invited Tenders" />
      <PageHeader title="My Invited Tenders" description="Active business tenders and request for proposals you have been invited to participate in." />
      <DataTable columns={columns} data={rows} exportFilename="my-tenders" emptyMessage="You have not been invited to any active tenders yet." searchPlaceholder="Search tenders..." />
    </AppShell>
  );
}
