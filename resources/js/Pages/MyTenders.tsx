import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function MyTenders({ rows }: any) {
  return (
    <AppShell>
      <Head title="My tenders" />
      <PageHeader title="My tenders" description="Tenders you've been invited to bid on." />
      <div className="panel overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Tender #</th><th>Title</th><th>Deadline</th><th>Status</th><th>My bid</th><th className="text-right">Action</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No tenders assigned yet.</td></tr>}
            {rows.map((t: any) => {
              const past = new Date(t.deadline) < new Date();
              const canBid = t.status === "open" && !past && !t.hasBid && t.vendorStatus === "active";
              return (
                <tr key={t.id}>
                  <td className="font-mono text-xs whitespace-nowrap">{t.tender_number}</td>
                  <td className="font-medium min-w-0 max-w-[200px] truncate">{t.title}</td>
                  <td className="text-xs whitespace-nowrap">{new Date(t.deadline).toLocaleString()}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="whitespace-nowrap">{t.hasBid ? <span className="text-success text-xs">Submitted</span> : <span className="text-muted-foreground text-xs">—</span>}</td>
                  <td className="text-right whitespace-nowrap">
                    {canBid ? (
                      <Link href={`/app/my-tenders/${t.id}/bid`}><Button size="sm">Submit bid <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button></Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">{past ? "Deadline passed" : t.hasBid ? "Already bid" : t.vendorStatus !== "active" ? "Profile not active" : "Closed"}</span>
                    )}
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
