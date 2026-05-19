import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function ClaimsIndex({ rows }: any) {
  return (
    <AppShell>
      <Head title="Claims" />
      <PageHeader title="Claims" description="Vendor billing claims awaiting review." />
      <div className="panel">
        <table className="data-table">
          <thead><tr><th>Claim #</th><th>Vendor</th><th>Tender #</th><th>Title</th><th className="text-right">Amount</th><th>Submitted</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={8} className="text-center text-muted-foreground py-8">No claims found.</td></tr>}
            {rows.map((r: any) => (
              <tr key={r.id}>
                <td className="font-mono text-xs">{r.claim_number}</td>
                <td className="text-sm">{r.vendor?.name}</td>
                <td className="font-mono text-xs">{r.tender_number}</td>
                <td className="font-medium max-w-48 truncate">{r.title}</td>
                <td className="text-right font-mono">{Number(r.amount).toLocaleString()}</td>
                <td className="text-xs text-muted-foreground">{new Date(r.submitted_at).toLocaleString()}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="text-right"><Link href={`/app/claims/${r.id}`}><Button size="sm" variant="outline">Open <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
