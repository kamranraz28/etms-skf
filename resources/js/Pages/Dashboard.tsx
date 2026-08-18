import { Link, usePage, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { DataTable, Column } from "@/components/ui/DataTable";
import {
  Building2, Gavel, TrendingUp, Users, FileText, Clock, Activity,
  ArrowUpRight, ClipboardList, Receipt, BarChart3, Sparkles,
} from "lucide-react";
import { PageSharedProps } from "@/lib/types";

export default function Dashboard({ stats, recentTenders, recentVendors }: any) {
  const { props } = usePage<PageSharedProps>();
  const primary = props.auth.user?.primary_role;
  const fullName = props.auth.user?.full_name ?? "";
  const firstName = fullName.split(" ")[0] || "";

  const tenderColumns: Column[] = [
    {
      key: "tender_number", label: "Tender #", sortable: true,
      render: (r) => <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded-md whitespace-nowrap">{r.tender_number}</span>,
    },
    {
      key: "title", label: "Title", sortable: true,
      render: (r) => <span className="font-medium text-sm max-w-[180px] truncate block">{r.title}</span>,
    },
    {
      key: "deadline", label: "Deadline", sortable: true,
      render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.deadline).toLocaleDateString()}</span>,
    },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  const vendorColumns: Column[] = [
    {
      key: "name", label: "Vendor", sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {r.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-sm truncate max-w-[120px]">{r.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[120px]">{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "erp_code", label: "ERP Code", sortable: true,
      render: (r) => (
        <span className="font-mono text-xs">
          {r.erp_code ?? <span className="text-warning font-medium">Not mapped</span>}
        </span>
      ),
    },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  // ─── Vendor Dashboard ───────────────────────────────────────────
  if (primary === "vendor") {
    const vendorCards = [
      {
        href: "/app/profile",
        icon: Building2,
        title: "Vendor Profile",
        subtitle: "Manage your company details",
        color: "from-primary/15 to-primary/5",
        iconColor: "text-primary",
        border: "border-primary/15",
      },
      {
        href: "/app/my-tenders",
        icon: Gavel,
        title: "My Tenders",
        subtitle: "View tender invitations",
        color: "from-accent/15 to-accent/5",
        iconColor: "text-accent",
        border: "border-accent/15",
      },
      {
        href: "/app/my-bids",
        icon: FileText,
        title: "My Bids",
        subtitle: "Track submitted bids",
        color: "from-success/15 to-success/5",
        iconColor: "text-success",
        border: "border-success/15",
      },
      {
        href: "/app/my-claims",
        icon: Receipt,
        title: "My Claims",
        subtitle: "View claim history",
        color: "from-info/15 to-info/5",
        iconColor: "text-info",
        border: "border-info/15",
      },
    ];

    return (
      <AppShell>
        <Head title="Dashboard" />
        {/* Welcome hero */}
        <div className="relative rounded-2xl overflow-hidden mb-8 border border-border/50">
          <div className="absolute inset-0 gradient-hero opacity-90" />
          <div className="absolute inset-0 pattern-dots-light" />
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
          <div className="relative z-10 px-8 py-10 text-white">
            <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Vendor Portal
            </div>
            <h2 className="text-3xl font-bold tracking-tight font-display">
              {firstName ? `Welcome back, ${firstName}!` : "Welcome to ETMS"}
            </h2>
            <p className="mt-2 text-white/65 text-sm max-w-md">
              Submit your registration and respond to tenders you've been invited to.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger-children">
          {vendorCards.map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className={`group relative bg-card border ${card.border} rounded-2xl p-6 flex items-start gap-5 hover-lift cursor-pointer overflow-hidden transition-all duration-300`}
            >
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-foreground">{card.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{card.subtitle}</div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 shrink-0 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
            </Link>
          ))}
        </div>
      </AppShell>
    );
  }

  // ─── Admin/Procurement Dashboard ────────────────────────────────
  const statCards = [
    { label: "Total Vendors", value: stats.vendors, icon: Users, color: "from-primary/15 to-primary/5", iconColor: "text-primary", bg: "bg-primary/8" },
    { label: "Pending Approval", value: stats.vendorsPending, icon: Clock, color: "from-warning/15 to-warning/5", iconColor: "text-warning", bg: "bg-warning/8" },
    { label: "Purchase Reqs", value: stats.prs, icon: FileText, color: "from-info/15 to-info/5", iconColor: "text-info", bg: "bg-info/8" },
    { label: "Purchase Orders", value: stats.pos ?? 0, icon: ClipboardList, color: "from-accent/15 to-accent/5", iconColor: "text-accent", bg: "bg-accent/8" },
    { label: "Active Tenders", value: stats.tendersOpen, icon: Activity, color: "from-success/15 to-success/5", iconColor: "text-success", bg: "bg-success/8" },
    { label: "Bids Received", value: stats.bids, icon: TrendingUp, color: "from-primary/15 to-primary/5", iconColor: "text-primary", bg: "bg-primary/8" },
  ];

  const totalTenders = stats.tenders || 1;

  return (
    <AppShell>
      <Head title="Dashboard" />

      {/* Welcome hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-border/50">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 pattern-dots-light" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute right-16 bottom-0 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
        <div className="relative z-10 px-8 py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="text-white">
            <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">
              <BarChart3 className="h-3.5 w-3.5" />
              Operations Dashboard
            </div>
            <h2 className="text-2xl font-bold tracking-tight font-display">
              {firstName ? `Good to see you, ${firstName}` : "Operations Dashboard"}
            </h2>
            <p className="mt-1.5 text-white/60 text-sm">
              Live overview of vendors, requisitions, and tenders.
            </p>
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.tenders}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider mt-0.5">Total Tenders</div>
            </div>
            <div className="h-10 w-px bg-white/15" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.vendors}</div>
              <div className="text-xs text-white/50 uppercase tracking-wider mt-0.5">Vendors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 stagger-children">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card group">
            <div className="flex items-center justify-between">
              <span className="stat-label">{card.label}</span>
              <div className={`stat-icon ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
            <span className="stat-value animate-count-up">{card.value ?? 0}</span>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${Math.min(100, ((card.value ?? 0) / (stats.vendors || 1)) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="panel overflow-hidden">
          <div className="panel-header">
            <div className="panel-title">
              <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <Gavel className="h-3.5 w-3.5 text-accent" />
              </div>
              Recent Tenders
            </div>
            <Link href="/app/tenders" className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
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
          <div className="panel-header">
            <div className="panel-title">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-3.5 w-3.5 text-primary" />
              </div>
              Recent Vendors
            </div>
            <Link href="/app/vendors" className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
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
