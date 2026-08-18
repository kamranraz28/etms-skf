import { Head, Link } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Handshake } from "lucide-react";

export default function MyBids({ bids }: any) {
  const pendingCount = (r: any) => (r.negotiations ?? []).filter((n: any) => n.status === "pending").length;

  const columns: Column[] = [
    { key: "tender_number", label: "Tender #", sortable: true, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.tender?.tender_number}</span> },
    { key: "title", label: "Title", sortable: true, render: (r) => <span className="min-w-0 max-w-[200px] truncate block font-medium">{r.tender?.title}</span> },
    { key: "total_price", label: "Total", sortable: true, className: "text-right", render: (r) => <span className="font-mono whitespace-nowrap">{Number(r.total_price).toLocaleString()}</span> },
    { key: "currency", label: "Currency", sortable: true, render: (r) => <span className="text-xs whitespace-nowrap">{r.currency}</span> },
    { key: "submitted_at", label: "Submitted", sortable: true, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.submitted_at).toLocaleString()}</span> },
    { key: "tender_status", label: "Tender", sortable: false, render: (r) => r.tender?.status ? <StatusBadge status={r.tender.status} /> : null },
    {
      key: "offers",
      label: "Price offers",
      sortable: false,
      render: (r: any) => {
        const pending = pendingCount(r);
        if (pending === 0) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <Link href={`/app/my-bids/${r.id}?tab=offers`}>
            <span className="inline-flex items-center gap-1 text-[10px] bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
              <Handshake className="h-3 w-3" /> {pending} pending offer{pending > 1 ? "s" : ""}
            </span>
          </Link>
        );
      },
    },
    {
      key: "cs_result",
      label: "CS result",
      sortable: false,
      render: (r: any) => {
        const ci = (r.cs_items ?? [])[0];
        const csApproved = ci?.cs?.status === "approved";
        if (!ci) return <span className="text-xs text-muted-foreground">—</span>;
        if (!csApproved) return <span className="text-xs text-muted-foreground">CS {ci.cs?.status}</span>;
        return ci.selected ? <StatusBadge status="selected" /> : <StatusBadge status="not_selected" />;
      },
    },
    {
      key: "actions" as string,
      label: "Actions",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <Link href={`/app/my-bids/${r.id}`}>
          <span className="text-xs text-accent hover:underline font-medium">View</span>
        </Link>
      ),
    },
  ];

  return (
    <AppShell>
      <Head title="My bids" />
      <PageHeader title="My bids" description="Every bid you've submitted, including settled-price offers from the authority." />
      <DataTable columns={columns} data={bids} exportFilename="my-bids" emptyMessage="No bids submitted yet." searchPlaceholder="Search bids..." />
    </AppShell>
  );
}