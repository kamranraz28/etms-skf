import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Head, Link } from "@inertiajs/react";
import { ArrowUpRight, FileText, Gavel, Plus, Users } from "lucide-react";

const statusColors: Record<string, string> = {
  open: "bg-gradient-to-r from-info/10 to-info/5 text-info border-info/20",
  closed: "bg-muted/50 text-muted-foreground border-border/30",
  awarded:
    "bg-gradient-to-r from-success/10 to-success/5 text-success border-success/20",
};

export default function TenderIndex({ tenders }: any) {
  const sa = useSweetAlert();
  return (
    <AppShell>
      <Head title="Tenders" />
      <PageHeader
        title="Tenders"
        description="All tenders created from Purchase Requisitions."
        actions={
          <Link href="/app/tenders/new">
            <Button>
              <Plus className="h-4 w-4" /> New tender
            </Button>
          </Link>
        }
      />
      <div className="card-grid stagger-children">
        {tenders.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-16 bg-card border border-border/60 rounded-2xl">
            <Gavel className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">No tenders created yet.</p>
            <p className="text-xs mt-1">
              Create a tender from a Purchase Requisition to get started.
            </p>
          </div>
        )}
        {tenders.map((t: any) => (
          <Link
            key={t.id}
            href={`/app/tenders/${t.id}`}
            className="group relative bg-card border border-border/60 rounded-2xl p-5 hover-lift overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-xs text-muted-foreground">
                {t.tender_number}
              </span>
              <span
                className={`text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full border ${statusColors[t.status] || "bg-muted/50 text-muted-foreground"}`}
              >
                {t.status === "awarded" ? "Awarded" : t.status}
              </span>
            </div>
            <div className="font-semibold text-sm line-clamp-2 mb-3">
              {t.title}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {t.vendor_count} vendor{t.vendor_count !== 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {t.bid_count} bid{t.bid_count !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                Created: {new Date(t.created_at).toLocaleDateString()}
              </span>
              <span>
                Submission Deadline: {new Date(t.deadline).toLocaleDateString()}
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
