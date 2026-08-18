import { Link, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Scale, ArrowUpRight, Workflow, Hash, Calendar, Layers } from "lucide-react";
import { useMemo, useState } from "react";

export default function CsIndex({ rows = [] }: any) {
  const [filter, setFilter] = useState("all");

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r: any) => r.status?.toLowerCase() === "pending" || r.status?.toLowerCase().includes("review")).length;
    const approved = rows.filter((r: any) => r.status?.toLowerCase() === "approved").length;
    const rejected = rows.filter((r: any) => r.status?.toLowerCase() === "rejected").length;
    return { total, pending, approved, rejected };
  }, [rows]);

  const filteredCS = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "pending") {
      return rows.filter((r: any) => r.status?.toLowerCase() === "pending" || r.status?.toLowerCase().includes("review"));
    }
    return rows.filter((r: any) => r.status?.toLowerCase() === filter);
  }, [rows, filter]);

  return (
    <AppShell>
      <Head title="Comparative Statements" />
      <PageHeader title="Comparative Statements" description="Evaluated bid comparison statements prepared for multi-level approval workflows." />

      {/* Summary counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger-children">
        <button
          onClick={() => setFilter("all")}
          className={`text-left relative bg-card border rounded-2xl p-4 overflow-hidden transition-all duration-200 ${filter === "all" ? "border-primary shadow-md ring-2 ring-primary/10" : "border-border/60 hover-lift"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">All Statements</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-display">{stats.total}</div>
        </button>

        <button
          onClick={() => setFilter("pending")}
          className={`text-left relative bg-card border rounded-2xl p-4 overflow-hidden transition-all duration-200 ${filter === "pending" ? "border-warning shadow-md ring-2 ring-warning/10" : "border-border/60 hover-lift"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Review</span>
            <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <Workflow className="h-4 w-4 animate-pulse-soft" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-display">{stats.pending}</div>
        </button>

        <button
          onClick={() => setFilter("approved")}
          className={`text-left relative bg-card border rounded-2xl p-4 overflow-hidden transition-all duration-200 ${filter === "approved" ? "border-success shadow-md ring-2 ring-success/10" : "border-border/60 hover-lift"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Approved</span>
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-display">{stats.approved}</div>
        </button>

        <button
          onClick={() => setFilter("rejected")}
          className={`text-left relative bg-card border rounded-2xl p-4 overflow-hidden transition-all duration-200 ${filter === "rejected" ? "border-destructive shadow-md ring-2 ring-destructive/10" : "border-border/60 hover-lift"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rejected</span>
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-display">{stats.rejected}</div>
        </button>
      </div>

      {/* Grid List */}
      <div className="card-grid stagger-children">
        {filteredCS.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 text-center text-muted-foreground py-16 bg-card border border-border/60 rounded-2xl">
            <Scale className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30 animate-float" />
            <p className="font-semibold text-foreground text-sm">No comparative statements found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === "all"
                ? "Close a tender and generate a comparative statement to compare bids."
                : `No statements match status '${filter}'.`}
            </p>
          </div>
        )}
        {filteredCS.map((cs: any) => (
          <Link key={cs.id} href={`/app/cs/${cs.id}`} className="group relative bg-card border border-border/60 hover:border-primary/30 rounded-2xl p-5 hover-lift overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3.5">
                <span className="font-mono text-xs font-semibold bg-muted/60 text-foreground px-2 py-0.5 rounded-md">
                  CS-{cs.id}
                </span>
                <StatusBadge status={cs.status} className="text-[10px]" />
              </div>
              <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                {cs.tender?.title ?? "Untitled statement"}
              </h3>
              <div className="text-xs text-muted-foreground space-y-1.5 mb-4">
                <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground/70">
                  <Hash className="h-3.5 w-3.5" /> {cs.tender?.tender_number ?? "No tender ref"}
                </div>
                {cs.workflow_type && (
                  <div className="flex items-center gap-1.5 text-xs text-accent font-semibold bg-accent/5 w-fit px-2.5 py-1 rounded-lg border border-accent/10">
                    <Workflow className="h-3.5 w-3.5" /> {cs.workflow_type.name}
                  </div>
                )}
              </div>
            </div>
            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {new Date(cs.created_at).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1 font-bold text-accent group-hover:underline">
                View CS <ExternalLink className="h-3 w-3" />
              </span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

// Icon fallbacks for layout
function CheckCircle2(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
}
function XCircle(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
}
