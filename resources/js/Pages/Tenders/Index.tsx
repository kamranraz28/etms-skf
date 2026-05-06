import { Link, router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Lock } from "lucide-react";

export default function TendersIndex({ tenders }: any) {
  const closeTender = (t: any) => router.post(`/app/tenders/${t.id}/close`);
  return (
    <AppShell>
      <Head title="Tenders" />
      <PageHeader title="Tenders" description="Tenders generated from PRs. Vendors invited here submit bids before the deadline."
        actions={<Link href="/app/tenders/new"><Button>New tender</Button></Link>} />
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr><th>Tender #</th><th>Title</th><th>From PR</th><th>Deadline</th><th>Vendors</th><th>Bids</th><th>Status</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {tenders.length === 0 && (
              <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No tenders yet. Create one from a PR.</td></tr>
            )}
            {tenders.map((t: any) => {
              const past = new Date(t.deadline) < new Date();
              return (
                <tr key={t.id}>
                  <td className="font-mono text-xs">{t.tender_number}</td>
                  <td className="font-medium">{t.title}</td>
                  <td className="font-mono text-xs">{t.pr?.pr_number ?? "—"}</td>
                  <td className="text-xs">{new Date(t.deadline).toLocaleString()}{past && t.status==="open" && <span className="ml-2 text-warning">(deadline passed)</span>}</td>
                  <td>{t.vendor_count}</td>
                  <td>{t.bid_count}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      {t.status === "open" && <Button size="sm" variant="ghost" onClick={()=>closeTender(t)}><Lock className="h-4 w-4" /></Button>}
                      <Link href={`/app/tenders/${t.id}`}><Button size="sm" variant="outline">Open <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button></Link>
                    </div>
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
