import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { PageSharedProps } from "@/lib/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, ExternalLink, Lock, Scale, Gavel, Users, FileText } from "lucide-react";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";

export default function TenderShow({ tender, vendors, bids, cs }: any) {
  const { props } = usePage<PageSharedProps>();
  const sa = useSweetAlert();
  const primary = props.auth.user?.primary_role;
  const lowest = bids[0];
  const closeTender = async () => {
    const confirmed = await sa.confirmAction("Close tender?", "This will prevent new bids.", "Close tender");
    if (confirmed) {
      router.post(`/app/tenders/${tender.id}/close`, {}, {
        onSuccess: () => sa.alert("Tender closed", "Tender has been closed successfully.", "success"),
      });
    }
  };
  const generateCS = async () => {
    const confirmed = await sa.confirmAction("Generate Comparison Statement?", "Create CS from winning bid?", "Generate");
    if (confirmed) {
      router.post(`/app/tenders/${tender.id}/generate-cs`, {}, {
        onSuccess: () => sa.alert("CS generated", "Comparison statement has been generated.", "success"),
      });
    }
  };

  const bidColumns: Column[] = [
    {
      key: "vendor",
      label: "Vendor",
      sortable: false,
      render: (r: any) => (
        <span className="font-medium whitespace-nowrap">
          {r.vendor?.name}
          {lowest?.id === r.id && <StatusBadge status="selected" className="ml-2 text-[10px]" />}
        </span>
      ),
    },
    { key: "erp_code", label: "ERP", sortable: false, render: (r: any) => <span className="font-mono text-xs whitespace-nowrap">{r.vendor?.erp_code ?? <span className="text-warning">—</span>}</span> },
    { key: "submitted_at", label: "Submitted", sortable: true, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.submitted_at).toLocaleString()}</span> },
  ];

  const itemColumns: Column[] = [
    { key: "name", label: "Item", sortable: false, render: (r: any, i?: number) => {
      const idx = (tender.pr.items ?? []).indexOf(r);
      return <span className="min-w-0 max-w-[150px] truncate font-medium">{r.name}</span>;
    }},
    { key: "qty", label: "Qty", sortable: false, render: (r) => <span className="whitespace-nowrap">{r.qty}</span> },
    { key: "unit", label: "Unit", sortable: false, render: (r) => <span className="whitespace-nowrap">{r.unit}</span> },
    {
      key: "categories",
      label: "Invited categories",
      sortable: false,
      render: (r: any, i?: number) => {
        const idx = (tender.pr.items ?? []).indexOf(r);
        const cats = (tender.item_categories ?? []).filter((ic: any) => ic.item_index === idx);
        return cats.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {cats.map((ic: any) => (
              <span key={ic.id} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                {ic.vendor_category?.name ?? 'Cat #'+ic.vendor_category_id}
              </span>
            ))}
          </div>
        ) : <span className="text-xs text-muted-foreground">—</span>;
      },
    },
  ];

  return (
    <AppShell>
      <Head title={tender.title} />
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <PageHeader
        title={tender.title}
        description={`${tender.tender_number} · Deadline ${new Date(tender.deadline).toLocaleString()}`}
        actions={
          <div className="flex gap-2 items-center flex-wrap">
            <StatusBadge status={tender.status} />
            {tender.status === "open" && (
              <Button variant="outline" size="sm" onClick={closeTender}><Lock className="h-4 w-4 mr-1" /> Close tender</Button>
            )}
            {tender.status !== "open" && bids.length > 0 && !cs && (primary === "admin" || primary === "procurement") && (
              <Button size="sm" onClick={generateCS}><Scale className="h-4 w-4 mr-1" /> Generate CS</Button>
            )}
            {cs && (
              <Link href={`/app/cs/${cs.id}`}><Button size="sm" variant="outline"><ExternalLink className="h-4 w-4 mr-1" /> Open CS</Button></Link>
            )}
          </div>
        }
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="panel overflow-hidden">
            <div className="panel-header bg-gradient-to-r from-card to-muted/20">
              <div className="panel-title"><Gavel className="h-4.5 w-4.5 text-accent" /> Bids received ({bids.length})</div>
            </div>
            <DataTable
              columns={bidColumns}
              data={bids}
              searchable={false}
              exportable={false}
              hidePageSize
              pageSize={50}
              compact
              emptyMessage="No bids yet."
            />
          </div>

          {tender.pr && (
            <div className="panel overflow-hidden">
              <div className="panel-header bg-gradient-to-r from-card to-muted/20">
                <div className="panel-title"><FileText className="h-4.5 w-4.5 text-primary" /> Requisition items · {tender.pr.pr_number}</div>
              </div>
              <DataTable
                columns={itemColumns}
                data={tender.pr.items ?? []}
                searchable={false}
                exportable={false}
                hidePageSize
                pageSize={50}
                compact
                emptyMessage="No items."
              />
            </div>
          )}
        </div>

        <div className="space-y-6 min-w-0">
          <div className="panel overflow-hidden">
            <div className="panel-header bg-gradient-to-r from-card to-muted/20">
              <div className="panel-title"><Users className="h-4.5 w-4.5 text-accent" /> Invited vendors ({vendors.length})</div>
            </div>
            <ul className="divide-y divide-border/40 max-h-[400px] overflow-y-auto">
              {vendors.map((v: any) => (
                <li key={v.id} className="px-5 py-3 hover:bg-muted/20 transition-colors">
                  <div className="text-sm font-medium truncate">{v.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{v.email}</div>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <StatusBadge status={v.status} />
                    {v.vendor_category_id && <span className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full">{v.vendor_category?.name ?? ''}</span>}
                    {v.erp_code ? <span className="text-[10px] font-mono text-muted-foreground">ERP: {v.erp_code}</span> : <span className="text-[10px] text-warning font-medium">No ERP code</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {tender.description && (
            <div className="panel p-5">
              <div className="panel-title mb-2">Scope</div>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{tender.description}</p>
            </div>
          )}
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
