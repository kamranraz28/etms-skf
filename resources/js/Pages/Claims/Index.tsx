import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Receipt } from "lucide-react";

export default function ClaimsIndex({ rows }: any) {
  return (
    <AppShell>
      <Head title="Claims" />
      <PageHeader title="Claims" description="Vendor billing claims awaiting review." />
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Claim #</th><th>Vendor</th><th>Tender #</th><th>Title</th><th className="text-right">Amount</th><th>Submitted</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={8} className="text-center text-muted-foreground py-12">No claims found.</td></tr>}
              {rows.map((r: any) => (
                <tr key={r.id} className="group">
                  <td className="font-mono text-xs whitespace-nowrap">{r.claim_number}</td>
                  <td className="text-sm whitespace-nowrap font-medium">{r.vendor?.name}</td>
                  <td className="font-mono text-xs whitespace-nowrap">{r.tender_number}</td>
                  <td className="font-medium max-w-32 md:max-w-48 truncate">{r.title}</td>
                  <td className="text-right font-mono whitespace-nowrap">{Number(r.amount).toLocaleString()}</td>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.submitted_at).toLocaleString()}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="text-right whitespace-nowrap"><Link href={`/app/claims/${r.id}`}><Button size="sm" variant="outline">Open <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
