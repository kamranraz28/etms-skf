import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TenderIndex({ tenders }: any) {
  return (
    <AppShell>
      <Head title="Tenders" />
      <PageHeader
        title="Tenders"
        description="All tenders created from Purchase Requisitions."
        actions={<Link href="/app/tenders/new"><Button><Plus className="h-4 w-4 mr-1" /> New tender</Button></Link>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenders.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12">No tenders created yet.</div>
        )}
        {tenders.map((t: any) => (
          <Link key={t.id} href={`/app/tenders/${t.id}`} className="panel hover:border-accent/50 transition-colors block">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">{t.tender_number}</span>
                <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${
                  t.status === "open" ? "bg-info/10 text-info" :
                  t.status === "closed" ? "bg-muted text-muted-foreground" :
                  "bg-success/10 text-success"
                }`}>
                  {t.status === "awarded" ? "Awarded" : t.status}
                </span>
              </div>
              <div className="font-medium text-sm line-clamp-2">{t.title}</div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{t.vendor_count} vendor{t.vendor_count !== 1 ? "s" : ""}</span>
                <span>·</span>
                <span>{t.bid_count} bid{t.bid_count !== 1 ? "s" : ""}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{t.pr?.pr_number ?? "—"}</div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
