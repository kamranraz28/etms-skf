import { Link, usePage, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Building2, Gavel, TrendingUp, Users, FileText, Clock, Activity, ArrowUpRight } from "lucide-react";
import { PageSharedProps } from "@/lib/types";

export default function Dashboard({ stats, recentTenders, recentVendors }: any) {
  const { props } = usePage<PageSharedProps>();
  const primary = props.auth.user?.primary_role;
  const fullName = props.auth.user?.full_name ?? "";

  const tenderColumns: Column[] = [
    { key: "tender_number", label: "Number", sortable: true, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.tender_number}</span> },
    { key: "title", label: "Title", sortable: true, render: (r) => <span className="min-w-0 max-w-[200px] truncate block font-medium">{r.title}</span> },
    { key: "deadline", label: "Deadline", sortable: true, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.deadline).toLocaleDateString()}</span> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  const vendorColumns: Column[] = [
    { key: "name", label: "Name", sortable: true, render: (r) => <div><div className="font-medium truncate max-w-[150px]">{r.name}</div><div className="text-xs text-muted-foreground truncate max-w-[150px]">{r.email}</div></div> },
    { key: "erp_code", label: "ERP code", sortable: true, render: (r) => <span className="font-mono text-xs whitespace-nowrap">{r.erp_code ?? <span className="text-warning">—</span>}</span> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  if (primary === "vendor") {
    return (
      <AppShell>
        <Head title="Dashboard" />
        <PageHeader
          title={`Welcome${fullName ? `, ${fullName}` : ""}`}
          description="Submit your registration and respond to tenders you've been invited to."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 stagger-children">
          <Link href="/app/profile" className="group relative bg-gradient-to-br from-card to-card/80 border border-border/60 rounded-2xl p-6 flex flex-col gap-3 hover-lift cursor-pointer overflow-hidden">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground relative z-[1]">Vendor profile</span>
            <span className="text-2xl font-bold text-foreground relative z-[1]">Manage</span>
            <span className="text-xs text-muted-foreground relative z-[1]">Complete your profile to be selected.</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link href="/app/my-tenders" className="group relative bg-gradient-to-br from-card to-card/80 border border-border/60 rounded-2xl p-6 flex flex-col gap-3 hover-lift cursor-pointer overflow-hidden">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Gavel className="h-6 w-6 text-accent" />
            </div>
            <span className="text-sm font-semibold text-foreground relative z-[1]">My tenders</span>
            <span className="text-2xl font-bold text-foreground relative z-[1]">View</span>
            <span className="text-xs text-muted-foreground relative z-[1]">See tenders you've been invited to.</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <Link href="/app/my-bids" className="group relative bg-gradient-to-br from-card to-card/80 border border-border/60 rounded-2xl p-6 flex flex-col gap-3 hover-lift cursor-pointer overflow-hidden">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success/10 to-success/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-6 w-6 text-success" />
            </div>
            <span className="text-sm font-semibold text-foreground relative z-[1]">My bids</span>
            <span className="text-2xl font-bold text-foreground relative z-[1]">Review</span>
            <span className="text-xs text-muted-foreground relative z-[1]">Track your submitted bids.</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </AppShell>
    );
  }

  const statCards = [
    { label: "Vendors", value: stats.vendors, icon: Users, color: "from-primary/10 to-primary/5", iconColor: "text-primary" },
    { label: "Pending approval", value: stats.vendorsPending, icon: Clock, color: "from-warning/10 to-warning/5", iconColor: "text-warning" },
    { label: "PRs", value: stats.prs, icon: FileText, color: "from-info/10 to-info/5", iconColor: "text-info" },
    { label: "Tenders", value: stats.tenders, icon: Gavel, color: "from-accent/10 to-accent/5", iconColor: "text-accent" },
    { label: "Open tenders", value: stats.tendersOpen, icon: Activity, color: "from-success/10 to-success/5", iconColor: "text-success" },
    { label: "Bids received", value: stats.bids, icon: TrendingUp, color: "from-primary/10 to-primary/5", iconColor: "text-primary" },
  ];

  return (
    <AppShell>
      <Head title="Dashboard" />
      <PageHeader title="Operations dashboard" description="Live overview of vendors, requisitions, and tenders." />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 stagger-children">
        {statCards.map((card, i) => (
          <div key={i} className="group relative bg-card border border-border/60 rounded-2xl p-5 flex flex-col gap-2 hover-lift overflow-hidden">
            <div className="flex items-center justify-between relative z-[1]">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{card.label}</span>
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <span className="text-2xl font-bold text-foreground relative z-[1]">{card.value}</span>
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 group-hover:w-full transition-all duration-500 relative z-[1]" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 stagger-children">
        <div className="panel overflow-hidden">
          <div className="panel-header bg-gradient-to-r from-card to-muted/20">
            <div className="panel-title"><Gavel className="h-4.5 w-4.5 text-accent" /> Recent tenders</div>
            <Link href="/app/tenders" className="text-xs font-medium text-accent hover:text-accent/80 transition-colors">View all →</Link>
          </div>
          <DataTable
            columns={tenderColumns}
            data={recentTenders}
            emptyMessage="No tenders yet"
            searchable={false}
            exportable={false}
            hidePageSize
            pageSize={50}
          />
        </div>

        <div className="panel overflow-hidden">
          <div className="panel-header bg-gradient-to-r from-card to-muted/20">
            <div className="panel-title"><Building2 className="h-4.5 w-4.5 text-primary" /> Recent vendors</div>
            <Link href="/app/vendors" className="text-xs font-medium text-accent hover:text-accent/80 transition-colors">View all →</Link>
          </div>
          <DataTable
            columns={vendorColumns}
            data={recentVendors}
            emptyMessage="No vendors yet"
            searchable={false}
            exportable={false}
            hidePageSize
            pageSize={50}
          />
        </div>
      </div>
    </AppShell>
  );
}
