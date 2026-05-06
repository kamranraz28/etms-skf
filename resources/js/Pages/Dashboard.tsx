import { Link, usePage, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Building2, Gavel } from "lucide-react";
import { PageSharedProps } from "@/lib/types";

export default function Dashboard({ stats, recentTenders, recentVendors }: any) {
  const { props } = usePage<PageSharedProps>();
  const primary = props.auth.user?.primary_role;
  const fullName = props.auth.user?.full_name ?? "";

  if (primary === "vendor") {
    return (
      <AppShell>
        <Head title="Dashboard" />
        <PageHeader
          title={`Welcome${fullName ? `, ${fullName}` : ""}`}
          description="Submit your registration and respond to tenders you've been invited to."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/app/profile" className="stat-card hover:border-accent/50 transition-colors">
            <span className="label">Vendor profile</span><span className="value">Manage</span>
            <span className="text-xs text-muted-foreground">Complete your profile to be selected.</span>
          </Link>
          <Link href="/app/my-tenders" className="stat-card hover:border-accent/50 transition-colors">
            <span className="label">My tenders</span><span className="value">View</span>
            <span className="text-xs text-muted-foreground">See tenders you've been invited to.</span>
          </Link>
          <Link href="/app/my-bids" className="stat-card hover:border-accent/50 transition-colors">
            <span className="label">My bids</span><span className="value">Review</span>
            <span className="text-xs text-muted-foreground">Track your submitted bids.</span>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Head title="Dashboard" />
      <PageHeader title="Operations dashboard" description="Live overview of vendors, requisitions, and tenders." />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="stat-card"><span className="label">Vendors</span><span className="value">{stats.vendors}</span></div>
        <div className="stat-card"><span className="label">Pending approval</span><span className="value text-warning">{stats.vendorsPending}</span></div>
        <div className="stat-card"><span className="label">PRs</span><span className="value">{stats.prs}</span></div>
        <div className="stat-card"><span className="label">Tenders</span><span className="value">{stats.tenders}</span></div>
        <div className="stat-card"><span className="label">Open tenders</span><span className="value text-info">{stats.tendersOpen}</span></div>
        <div className="stat-card"><span className="label">Bids received</span><span className="value">{stats.bids}</span></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title flex items-center gap-2"><Gavel className="h-4 w-4" /> Recent tenders</div>
            <Link href="/app/tenders" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          <table className="data-table">
            <thead><tr><th>Number</th><th>Title</th><th>Deadline</th><th>Status</th></tr></thead>
            <tbody>
              {recentTenders.length === 0 && (
                <tr><td colSpan={4} className="text-center text-muted-foreground py-6">No tenders yet</td></tr>
              )}
              {recentTenders.map((t: any) => (
                <tr key={t.id}>
                  <td className="font-mono text-xs">{t.tender_number}</td>
                  <td>{t.title}</td>
                  <td className="text-xs text-muted-foreground">{new Date(t.deadline).toLocaleDateString()}</td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title flex items-center gap-2"><Building2 className="h-4 w-4" /> Recent vendors</div>
            <Link href="/app/vendors" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>ERP code</th><th>Status</th></tr></thead>
            <tbody>
              {recentVendors.length === 0 && (
                <tr><td colSpan={3} className="text-center text-muted-foreground py-6">No vendors yet</td></tr>
              )}
              {recentVendors.map((v: any) => (
                <tr key={v.id}>
                  <td><div>{v.name}</div><div className="text-xs text-muted-foreground">{v.email}</div></td>
                  <td className="font-mono text-xs">{v.erp_code ?? <span className="text-muted-foreground">—</span>}</td>
                  <td><StatusBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
