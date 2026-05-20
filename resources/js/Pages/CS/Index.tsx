import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function CsIndex({ list = [] }: any) {
  return (
    <AppShell>
      <Head title="Comparative Statements" />
      <PageHeader title="Comparative Statements" description="Evaluated bid comparisons ready for approval." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12">No CS generated yet.</div>
        )}
        {list.map((cs: any) => (
          <Link key={cs.id} href={`/app/cs/${cs.id}`} className="panel hover:border-accent/50 transition-colors block">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">CS-{cs.id}</span>
                <StatusBadge status={cs.status} />
              </div>
              <div className="font-medium text-sm line-clamp-2">{cs.tender?.title ?? "—"}</div>
              <div className="text-[10px] text-muted-foreground">Tender: {cs.tender?.tender_number ?? "—"}</div>
              <div className="flex items-center gap-1 text-xs text-accent">
                <ExternalLink className="h-3 w-3" /> View details
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
