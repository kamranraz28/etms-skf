import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function CSIndex({ rows }: any) {
  return (
    <AppShell>
      <Head title="Comparative Statements" />
      <PageHeader title="Comparative Statements" description="Bid comparisons generated from closed tenders, awaiting approval and ERP push." />
      <div className="panel">
        <table className="data-table">
          <thead><tr><th>Tender #</th><th>Title</th><th>Created</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No comparative statements yet. Generate one from a closed tender.</td></tr>}
            {rows.map((r: any) => (
              <tr key={r.id}>
                <td className="font-mono text-xs">{r.tender?.tender_number}</td>
                <td className="font-medium">{r.tender?.title}</td>
                <td className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="text-right"><Link href={`/app/cs/${r.id}`}><Button size="sm" variant="outline">Open <ChevronRight className="h-3.5 w-3.5 ml-0.5" /></Button></Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
