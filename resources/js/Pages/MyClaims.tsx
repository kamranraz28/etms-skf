import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";

export default function MyClaims({ claims }: any) {
  return (
    <AppShell>
      <Head title="My Claims" />
      <PageHeader
        title="My Claims"
        description="Track your billing claims and their lifecycle status."
        actions={<Link href="/app/claims/new"><Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Claim</Button></Link>}
      />
      <div className="panel overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Claim #</th><th>Tender #</th><th>Title</th><th className="text-right">Amount</th><th>Submitted</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {claims.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No claims submitted yet.</td></tr>}
            {claims.map((c: any) => (
              <tr key={c.id}>
                <td className="font-mono text-xs whitespace-nowrap">{c.claim_number}</td>
                <td className="font-mono text-xs whitespace-nowrap">{c.tender_number}</td>
                <td className="font-medium max-w-32 md:max-w-48 truncate">{c.title}</td>
                <td className="text-right font-mono whitespace-nowrap">{Number(c.amount).toLocaleString()}</td>
                <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(c.submitted_at).toLocaleString()}</td>
                <td><StatusBadge status={c.status} /></td>
                <td className="text-right whitespace-nowrap"><Link href={`/app/my-claims/${c.id}`}><Button size="sm" variant="outline">Track <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
