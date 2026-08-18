import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Head, Link } from "@inertiajs/react";
import { ArrowUpRight, FileText, Gavel, Plus, Users, Calendar, AlertCircle, Award } from "lucide-react";
import { useMemo, useState } from "react";

export default function TenderIndex({ tenders }: any) {
  const sa = useSweetAlert();
  const [filter, setFilter] = useState("all");

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = tenders.length;
    const open = tenders.filter((t: any) => t.status === "open").length;
    const closed = tenders.filter((t: any) => t.status === "closed").length;
    const awarded = tenders.filter((t: any) => t.status === "awarded").length;
    return { total, open, closed, awarded };
  }, [tenders]);

  // Filter tenders based on tab selection
  const filteredTenders = useMemo(() => {
    if (filter === "all") return tenders;
    return tenders.filter((t: any) => t.status === filter);
  }, [tenders, filter]);

  return (
    <AppShell>
      <Head title="Tenders" />
      <PageHeader
        title="Tenders"
        description="All tenders created from Purchase Requisitions. Manage vendor invitations and bids."
        actions={
          <Link href="/app/tenders/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> New Tender
            </Button>
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-children">
        <button
          onClick={() => setFilter("all")}
          className={`text-left relative bg-card border rounded-2xl p-4 overflow-hidden transition-all duration-200 ${filter === "all" ? "border-primary shadow-md ring-2 ring-primary/10" : "border-border/60 hover-lift"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">All Tenders</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Gavel className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-display">{stats.total}</div>
        </button>

        <button
          onClick={() => setFilter("open")}
          className={`text-left relative bg-card border rounded-2xl p-4 overflow-hidden transition-all duration-200 ${filter === "open" ? "border-info shadow-md ring-2 ring-info/10" : "border-border/60 hover-lift"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open</span>
            <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-display">{stats.open}</div>
        </button>

        <button
          onClick={() => setFilter("closed")}
          className={`text-left relative bg-card border rounded-2xl p-4 overflow-hidden transition-all duration-200 ${filter === "closed" ? "border-muted-foreground shadow-md ring-2 ring-muted/10" : "border-border/60 hover-lift"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Closed</span>
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-display">{stats.closed}</div>
        </button>

        <button
          onClick={() => setFilter("awarded")}
          className={`text-left relative bg-card border rounded-2xl p-4 overflow-hidden transition-all duration-200 ${filter === "awarded" ? "border-success shadow-md ring-2 ring-success/10" : "border-border/60 hover-lift"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Awarded</span>
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-display">{stats.awarded}</div>
        </button>
      </div>

      {/* Tender List */}
      <div className="card-grid stagger-children">
        {filteredTenders.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-16 bg-card border border-border/60 rounded-2xl">
            <Gavel className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30 animate-float" />
            <p className="font-semibold text-foreground text-sm">No tenders found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === "all"
                ? "Create a new tender from a Purchase Requisition to get started."
                : `No tenders have a status of '${filter}' currently.`}
            </p>
          </div>
        )}
        {filteredTenders.map((t: any) => (
          <Link
            key={t.id}
            href={`/app/tenders/${t.id}`}
            className="group relative bg-card border border-border/60 hover:border-primary/30 rounded-2xl p-5 hover-lift overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                  {t.tender_number}
                </span>
                <StatusBadge status={t.status} className="text-[10px]" />
              </div>
              <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                {t.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {t.vendor_count} vendor{t.vendor_count !== 1 ? "s" : ""} invited
                </span>
                <span className="text-muted-foreground/30">·</span>
                <span className="flex items-center gap-1 font-semibold text-foreground/80">
                  <FileText className="h-3.5 w-3.5 text-accent" />
                  {t.bid_count} bid{t.bid_count !== 1 ? "s" : ""} received
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-muted-foreground">
              <span>
                Created: {new Date(t.created_at).toLocaleDateString()}
              </span>
              <span className="font-medium text-foreground/70">
                Deadline: {new Date(t.deadline).toLocaleDateString()}
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
