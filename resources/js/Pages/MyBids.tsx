import { Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

export default function MyBids({ bids }: any) {
  return (
    <AppShell>
      <Head title="My bids" />
      <PageHeader title="My bids" description="Every bid you've submitted." />
      <div className="panel overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Tender #</th><th>Title</th><th className="text-right">Total</th><th>Currency</th><th>Submitted</th><th>Tender</th><th>CS result</th></tr></thead>
          <tbody>
            {bids.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No bids submitted yet.</td></tr>}
            {bids.map((b: any) => {
              const ci = (b.cs_items ?? [])[0];
              const csApproved = ci?.cs?.status === "approved";
              return (
                <tr key={b.id}>
                  <td className="font-mono text-xs whitespace-nowrap">{b.tender?.tender_number}</td>
                  <td className="min-w-0 max-w-[200px] truncate">{b.tender?.title}</td>
                  <td className="text-right font-mono whitespace-nowrap">{Number(b.total_price).toLocaleString()}</td>
                  <td className="text-xs whitespace-nowrap">{b.currency}</td>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(b.submitted_at).toLocaleString()}</td>
                  <td>{b.tender?.status && <StatusBadge status={b.tender.status} />}</td>
                  <td className="whitespace-nowrap">
                    {!ci ? <span className="text-xs text-muted-foreground">—</span>
                      : !csApproved ? <span className="text-xs text-muted-foreground">CS {ci.cs?.status}</span>
                      : ci.selected ? <StatusBadge status="selected" /> : <StatusBadge status="not_selected" />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
