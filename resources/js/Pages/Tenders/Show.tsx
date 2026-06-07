import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { PageSharedProps } from "@/lib/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, ExternalLink, Lock, Scale, Gavel, Users, FileText, UserPlus, X, Edit3, Check } from "lucide-react";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { useMemo, useState } from "react";

export default function TenderShow({ tender, vendors, bids, cs, categories }: any) {
  const { props } = usePage<PageSharedProps>();
  const sa = useSweetAlert();
  const primary = props.auth.user?.primary_role;
  const lowest = bids[0];
  const [inviteModal, setInviteModal] = useState(false);
  const [viewBidItems, setViewBidItems] = useState<any>(null);
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [deadlineVal, setDeadlineVal] = useState("");

  // Build item-category map from existing item_categories
  const initialItemCats = useMemo(() => {
    const map: Record<number, number[]> = {};
    (tender.item_categories ?? []).forEach((ic: any) => {
      (map[ic.item_index] ??= []).push(ic.vendor_category_id);
    });
    return map;
  }, [tender.item_categories]);

  const [inviteItemCats, setInviteItemCats] = useState<Record<number, number[]>>({});

  const openInvite = () => {
    setInviteItemCats({ ...initialItemCats });
    setInviteModal(true);
  };

  const toggleInviteCat = (itemIdx: number, catId: number) => {
    setInviteItemCats((prev) => {
      const current = prev[itemIdx] ?? [];
      const next = current.includes(catId)
        ? current.filter((id) => id !== catId)
        : [...current, catId];
      if (next.length > 0) return { ...prev, [itemIdx]: next };
      const copy = { ...prev };
      delete copy[itemIdx];
      return copy;
    });
  };

  const sendInvites = () => {
    const itemCategories = Object.entries(inviteItemCats)
      .filter(([, ids]) => ids.length > 0)
      .map(([idx, ids]) => ({ item_index: parseInt(idx), category_ids: ids }));
    if (itemCategories.length === 0) { sa.alert("Select categories", "Choose at least one category for an item.", "warning"); return; }
    sa.confirmAction("Invite vendors?", "Vendors matching selected categories will be added.", "Invite").then((ok) => {
      if (ok) router.post(`/app/tenders/${tender.id}/invite`, { item_categories: itemCategories }, {
        onSuccess: () => { setInviteModal(false); sa.alert("Invited", "Vendors added to tender.", "success"); },
      });
    });
  };

  const startEditDeadline = () => {
    setDeadlineVal(new Date(tender.deadline).toISOString().slice(0, 16));
    setEditingDeadline(true);
  };
  const saveDeadline = () => {
    if (!deadlineVal) return;
    router.post(`/app/tenders/${tender.id}/deadline`, { deadline: deadlineVal }, {
      onSuccess: () => setEditingDeadline(false),
    });
  };
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
          {tender.status !== "open" && lowest?.id === r.id && <StatusBadge status="selected" className="ml-2 text-[10px]" />}
        </span>
      ),
    },
    { key: "erp_code", label: "ERP", sortable: false, render: (r: any) => <span className="font-mono text-xs whitespace-nowrap">{r.vendor?.erp_code ?? <span className="text-warning">—</span>}</span> },
    { key: "submitted_at", label: "Submitted", sortable: true, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.submitted_at).toLocaleString()}</span> },
    {
      key: "actions" as string,
      label: "Items",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setViewBidItems(r); }}>
          View Items
        </Button>
      ),
    },
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
        description={
          <span className="flex items-center gap-2 flex-wrap">
            <span>{tender.tender_number}</span>
            <span className="text-muted-foreground">·</span>
            {editingDeadline ? (
              <span className="flex items-center gap-1">
                <input type="datetime-local" value={deadlineVal} onChange={(e) => setDeadlineVal(e.target.value)}
                  className="h-7 rounded-md border border-border/60 bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-accent/30" />
                <button onClick={saveDeadline} className="text-success hover:text-success/80"><Check className="h-3.5 w-3.5" /></button>
                <button onClick={() => setEditingDeadline(false)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Deadline {new Date(tender.deadline).toLocaleString()}
                {tender.status === "open" && <button onClick={startEditDeadline} className="text-muted-foreground hover:text-accent ml-1"><Edit3 className="h-3 w-3" /></button>}
              </span>
            )}
          </span>
        }
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
              {tender.status === "open" && (
                <Button size="sm" variant="outline" onClick={openInvite}><UserPlus className="h-3.5 w-3.5 mr-1" /> Invite</Button>
              )}
            </div>
            <ul className="divide-y divide-border/40 max-h-[400px] overflow-y-auto">
              {vendors.map((v: any) => (
                <li key={v.id} className="px-5 py-3 hover:bg-muted/20 transition-colors">
                  <div className="text-sm font-medium truncate">{v.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{v.email}</div>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <StatusBadge status={v.status} />
                    {(v.categories ?? []).map((c: any) => <span key={c.id} className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full">{c.name}</span>)}
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

      {viewBidItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setViewBidItems(null)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <FileText className="h-4 w-4 text-accent" /> {viewBidItems.vendor?.name} — Item prices
              </div>
              <button onClick={() => setViewBidItems(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/40 to-muted/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Unit</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Unit price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Line total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {(viewBidItems.item_prices ?? []).map((it: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{it.name}</td>
                      <td className="px-4 py-3">{it.qty}</td>
                      <td className="px-4 py-3">{it.unit}</td>
                      <td className="px-4 py-3 text-right font-mono">{Number(it.unit_price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono">{(Number(it.unit_price) * Number(it.qty)).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground italic max-w-[200px]">{it.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-gradient-to-r from-muted/30 to-muted/10">
                    <td colSpan={4} className="text-right px-4 py-3 text-sm text-muted-foreground">Total bid value</td>
                    <td className="text-right font-mono px-4 py-3">{Number(viewBidItems.total_price).toLocaleString()} BDT</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setInviteModal(false)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-2 font-semibold text-sm"><UserPlus className="h-4 w-4 text-accent" /> Invite vendors — select categories per item</div>
              <button onClick={() => setInviteModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-4">
              {(tender.pr?.items ?? []).map((item: any, idx: number) => (
                <div key={idx} className="border border-border/40 rounded-xl p-3">
                  <div className="text-sm font-semibold mb-2">{item.name} <span className="text-xs font-normal text-muted-foreground">({item.qty} {item.unit})</span></div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat: any) => {
                      const selected = (inviteItemCats[idx] ?? []).includes(cat.id);
                      return (
                        <label key={cat.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-colors ${selected ? "bg-accent/10 border-accent/40 text-accent font-medium" : "bg-background border-border/60 hover:border-accent/30"}`}>
                          <input type="checkbox" checked={selected} onChange={() => toggleInviteCat(idx, cat.id)} className="h-3.5 w-3.5 accent-primary rounded" />
                          {cat.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              {Object.values(inviteItemCats).every((ids) => ids.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-6">Select at least one category for an item to invite vendors.</p>
              )}
            </div>
            <div className="flex gap-2 justify-between items-center px-5 py-3 border-t border-border/40 bg-muted/10">
              <span className="text-xs text-muted-foreground">Vendors matching selected categories will be invited.</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setInviteModal(false)}>Cancel</Button>
                <Button size="sm" onClick={sendInvites}><UserPlus className="h-3.5 w-3.5 mr-1" /> Invite vendors</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sa.SweetAlert}
    </AppShell>
  );
}
