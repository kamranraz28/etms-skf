import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Scale, ArrowUpRight } from "lucide-react";

export default function CsIndex({ list = [] }: any) {
  return (
    <AppShell>
      <Head title="Comparative Statements" />
      <PageHeader title="Comparative Statements" description="Evaluated bid comparisons ready for approval." />
      <div className="card-grid stagger-children">
        {list.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-16 bg-card border border-border/60 rounded-2xl">
            <Scale className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">No CS generated yet.</p>
            <p className="text-xs mt-1">Generate a Comparative Statement from a closed tender to get started.</p>
          </div>
        )}
        {list.map((cs: any) => (
          <Link key={cs.id} href={`/app/cs/${cs.id}`} className="group relative bg-card border border-border/60 rounded-2xl p-5 hover-lift overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-xs text-muted-foreground">CS-{cs.id}</span>
              <StatusBadge status={cs.status} />
            </div>
            <div className="font-semibold text-sm line-clamp-2 mb-2">{cs.tender?.title ?? "—"}</div>
            <div className="text-[10px] text-muted-foreground font-mono">Tender: {cs.tender?.tender_number ?? "—"}</div>
            <div className="flex items-center gap-1 text-xs font-medium text-accent mt-3">
              <ExternalLink className="h-3 w-3" /> View details
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
