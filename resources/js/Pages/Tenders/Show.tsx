import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { PageSharedProps } from "@/lib/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, ExternalLink, Lock, Scale, Gavel, Users, FileText, UserPlus, X, Edit3, Check, Handshake, MessageSquare, Calendar, Layers, ShieldCheck, Mail, DollarSign } from "lucide-react";
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
  const [settleBid, setSettleBid] = useState<any>(null);
  const [offerInputs, setOfferInputs] = useState<Record<string, string>>({});
  const [sendingOffers, setSendingOffers] = useState(false);

  const openSettle = (bid: any) => {
    setSettleBid(bid);
    const prefill: Record<string, string> = {};
    (bid.item_prices ?? []).forEach((it: any) => {
      const neg = (bid.negotiations ?? []).filter((n: any) => n.item_name === it.name);
      const last = neg[neg.length - 1];
      if (last && last.status === "pending") prefill[it.name] = String(last.offered_price);
    });
    setOfferInputs(prefill);
  };

  const sendOffers = () => {
    if (!settleBid) return;
    const offers = Object.entries(offerInputs)
      .filter(([, v]) => Number(v) > 0)
      .map(([item_name, offered_price]) => ({ item_name, offered_price: Number(offered_price) }));
    if (offers.length === 0) { sa.alert("No offers", "Enter a settled price for at least one item.", "warning"); return; }
    sa.confirmAction("Send settled prices?", "The vendor will be notified and can accept, deny, or counter each price.", "Send offers").then((ok) => {
      if (!ok) return;
      setSendingOffers(true);
      router.post(`/app/tenders/${tender.id}/bids/${settleBid.id}/offer`, { offers }, {
        onSuccess: () => { setSettleBid(null); setOfferInputs({}); sa.alert("Sent", "Settled price offers sent to vendor.", "success"); },
        onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
        onFinish: () => setSendingOffers(false),
      });
    });
  };

  const negotiationBadge = (bid: any) => {
    const negs = bid.negotiations ?? [];
    if (negs.length === 0) return null;
    const pending = negs.filter((n: any) => n.status === "pending").length;
    const accepted = negs.filter((n: any) => n.status === "accepted").length;
    const countered = negs.filter((n: any) => n.status === "counter").length;
    const rejected = negs.filter((n: any) => n.status === "rejected").length;
    return (
      <div className="flex flex-wrap gap-1">
        {pending > 0 && <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{pending} pending</span>}
        {accepted > 0 && <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{accepted} accepted</span>}
        {countered > 0 && <span className="text-[10px] bg-info/10 text-info px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{countered} countered</span>}
        {rejected > 0 && <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{rejected} denied</span>}
      </div>
    );
  };

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
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {r.vendor?.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="font-semibold text-foreground whitespace-nowrap">
            {r.vendor?.name}
            {tender.status !== "open" && lowest?.id === r.id && <StatusBadge status="lowest" className="ml-2 text-[9px]" />}
          </span>
        </div>
      ),
    },
    { key: "erp_code", label: "ERP Code", sortable: false, render: (r: any) => <span className="font-mono text-xs whitespace-nowrap bg-muted/60 px-2 py-0.5 rounded-md">{r.vendor?.erp_code ?? <span className="text-warning font-semibold">Not mapped</span>}</span> },
    { key: "total_price", label: "Total Bid Value", sortable: true, className: "text-right", render: (r) => <span className="font-mono text-xs whitespace-nowrap font-bold text-foreground">৳ {Number(r.total_price).toLocaleString()}</span> },
    { key: "negotiations", label: "Negotiation Status", sortable: false, render: (r: any) => negotiationBadge(r) },
    { key: "submitted_at", label: "Submitted Date", sortable: true, render: (r) => <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.submitted_at).toLocaleString()}</span> },
    {
      key: "actions" as string,
      label: "Actions",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <div className="flex items-center justify-end gap-1.5">
          {tender.status !== "awarded" && (primary === "admin" || primary === "procurement") && (
            <Button size="sm" variant="outline" className="h-8 py-0 px-2.5 text-xs gap-1" onClick={(e) => { e.stopPropagation(); openSettle(r); }}>
              <Handshake className="h-3.5 w-3.5" /> Settle Price
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-8 py-0 px-2.5 text-xs" onClick={(e) => { e.stopPropagation(); setViewBidItems(r); }}>
            Line Prices
          </Button>
        </div>
      ),
    },
  ];

  const itemColumns: Column[] = [
    { key: "name", label: "Item Details", sortable: false, render: (r: any, i?: number) => <span className="min-w-0 max-w-[200px] truncate font-semibold text-foreground">{r.name}</span> },
    { key: "qty", label: "Quantity", sortable: false, render: (r) => <span className="whitespace-nowrap font-bold bg-muted/60 px-2 py-0.5 rounded-md text-xs">{r.qty} {r.unit}</span> },
    {
      key: "categories",
      label: "Invited Vendor Categories",
      sortable: false,
      render: (r: any, i?: number) => {
        const idx = (tender.pr.items ?? []).indexOf(r);
        const cats = (tender.item_categories ?? []).filter((ic: any) => ic.item_index === idx);
        return cats.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {cats.map((ic: any) => (
              <span key={ic.id} className="text-[10px] bg-accent/10 text-accent px-2.5 py-0.5 rounded-full font-bold border border-accent/15 uppercase tracking-wider">
                {ic.vendor_category?.name ?? 'Cat #'+ic.vendor_category_id}
              </span>
            ))}
          </div>
        ) : <span className="text-xs text-muted-foreground/50">No categories invited</span>;
      },
    },
  ];

  return (
    <AppShell>
      <Head title={`${tender.tender_number} - Tender Details`} />
      
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-4 hover:bg-muted/80 gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Tenders
      </Button>

      <PageHeader
        title={tender.title}
        description={
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground/80 mt-1">
            <span className="font-mono bg-muted/60 px-2.5 py-0.5 rounded-md text-foreground font-semibold">{tender.tender_number}</span>
            <span>·</span>
            {editingDeadline ? (
              <span className="flex items-center gap-1.5 bg-background border border-border/60 rounded-lg p-1">
                <input type="datetime-local" value={deadlineVal} onChange={(e) => setDeadlineVal(e.target.value)}
                  className="h-6 rounded-md bg-transparent px-2 text-xs font-semibold focus:outline-none" />
                <button onClick={saveDeadline} className="text-success hover:text-success/80 p-0.5"><Check className="h-4 w-4" /></button>
                <button onClick={() => setEditingDeadline(false)} className="text-muted-foreground hover:text-foreground p-0.5"><X className="h-4 w-4" /></button>
              </span>
            ) : (
              <span className="flex items-center gap-1 font-medium text-foreground/70">
                Deadline: {new Date(tender.deadline).toLocaleString()}
                {tender.status === "open" && <button onClick={startEditDeadline} className="text-muted-foreground hover:text-accent ml-1 p-0.5 hover:bg-muted rounded transition-colors"><Edit3 className="h-3 w-3" /></button>}
              </span>
            )}
          </div>
        }
        actions={
          <div className="flex gap-2 items-center flex-wrap">
            <StatusBadge status={tender.status} />
            {tender.status === "open" && (
              <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={closeTender}>
                <Lock className="h-4 w-4" /> Close Tender
              </Button>
            )}
            {tender.status !== "open" && bids.length > 0 && !cs && (primary === "admin" || primary === "procurement") && (
              <Button size="sm" className="gap-1.5 h-9" onClick={generateCS}>
                <Scale className="h-4 w-4" /> Generate CS
              </Button>
            )}
            {cs && (
              <Link href={`/app/cs/${cs.id}`}>
                <Button size="sm" variant="outline" className="gap-1.5 h-9">
                  <ExternalLink className="h-4 w-4" /> View Comparison Statement
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Bids Panel */}
          <div className="panel overflow-hidden">
            <div className="panel-header">
              <div className="panel-title">
                <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                  <Gavel className="h-3.5 w-3.5" />
                </div>
                Bids Received ({bids.length})
              </div>
            </div>
            <DataTable
              columns={bidColumns}
              data={bids}
              searchable={false}
              exportable={false}
              hidePageSize
              pageSize={50}
              compact
              emptyMessage="No bids received for this tender yet."
            />
          </div>

          {/* Items Panel */}
          {tender.pr && (
            <div className="panel overflow-hidden">
              <div className="panel-header">
                <div className="panel-title">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  Requisition items · {tender.pr.pr_number}
                </div>
              </div>
              <DataTable
                columns={itemColumns}
                data={tender.pr.items ?? []}
                searchable={false}
                exportable={false}
                hidePageSize
                pageSize={50}
                compact
                emptyMessage="No items listed in requisition."
              />
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="space-y-6 min-w-0">
          {/* Invited Vendors list */}
          <div className="panel overflow-hidden flex flex-col max-h-[480px]">
            <div className="panel-header shrink-0">
              <div className="panel-title">
                <div className="h-7 w-7 rounded-lg bg-accent/15 flex items-center justify-center text-accent">
                  <Users className="h-3.5 w-3.5" />
                </div>
                Invited Vendors ({vendors.length})
              </div>
              {tender.status === "open" && (
                <Button size="sm" variant="outline" className="gap-1 h-8" onClick={openInvite}>
                  <UserPlus className="h-3.5 w-3.5" /> Invite
                  </Button>
              )}
            </div>
            <ul className="divide-y divide-border/30 overflow-y-auto no-scrollbar">
              {vendors.length === 0 && (
                <li className="px-5 py-8 text-center text-xs text-muted-foreground">No vendors invited.</li>
              )}
              {vendors.map((v: any) => (
                <li key={v.id} className="px-5 py-4 hover:bg-muted/10 transition-colors">
                  <div className="text-sm font-semibold text-foreground truncate">{v.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{v.email}</div>
                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <StatusBadge status={v.status} className="text-[9px]" />
                    {(v.categories ?? []).map((c: any) => (
                      <span key={c.id} className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                        {c.name}
                      </span>
                    ))}
                    {v.erp_code ? (
                      <span className="text-[10px] font-mono text-muted-foreground/60">ERP: {v.erp_code}</span>
                    ) : (
                      <span className="text-[10px] text-warning font-semibold bg-warning/10 px-2 py-0.5 rounded-md">No ERP Code</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Description Scope */}
          {tender.description && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Layers className="h-4 w-4 text-primary" /> Scope description
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{tender.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Bid Items Price Breakdown Modal */}
      {viewBidItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setViewBidItems(null)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-dialog w-full max-w-3xl max-h-[85vh] overflow-hidden m-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border/40 bg-gradient-to-r from-card to-muted/20">
              <div className="flex items-center gap-2.5 font-bold text-sm text-foreground">
                <FileText className="h-4.5 w-4.5 text-accent" /> Bid Details · {viewBidItems.vendor?.name}
              </div>
              <button onClick={() => setViewBidItems(null)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto max-h-[55vh]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/40">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Item</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-24">Qty</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-36">Unit price</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-36">Line total</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {(viewBidItems.item_prices ?? []).map((it: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-4 font-semibold text-foreground">{it.name}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                          {it.qty} {it.unit}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-xs font-bold text-foreground">৳ {Number(it.unit_price).toLocaleString()}</td>
                      <td className="px-5 py-4 text-right font-mono text-xs font-bold text-foreground">৳ {(Number(it.unit_price) * Number(it.qty)).toLocaleString()}</td>
                      <td className="px-5 py-4 text-xs text-muted-foreground italic max-w-[200px] truncate" title={it.remarks}>{it.remarks || "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-gradient-to-r from-muted/30 to-muted/10">
                    <td colSpan={3} className="text-right px-5 py-4 text-xs uppercase text-muted-foreground">Grand Total Bid Value</td>
                    <td className="text-right font-mono text-sm px-5 py-4 text-foreground font-black">৳ {Number(viewBidItems.total_price).toLocaleString()}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Invite Vendors Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setInviteModal(false)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-dialog w-full max-w-2xl max-h-[85vh] overflow-hidden m-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border/40 bg-gradient-to-r from-card to-muted/20">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <UserPlus className="h-4.5 w-4.5 text-accent animate-pulse-soft" /> Invite Vendors by Item Category
              </div>
              <button onClick={() => setInviteModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[55vh] p-6 space-y-4">
              {(tender.pr?.items ?? []).map((item: any, idx: number) => (
                <div key={idx} className="border border-border/40 rounded-xl p-4 bg-gradient-to-br from-card to-muted/5">
                  <div className="text-xs font-bold text-foreground mb-3 flex items-center justify-between">
                    <span>Item {idx+1}: {item.name}</span>
                    <span className="bg-muted px-2 py-0.5 rounded-md font-semibold text-[10px] text-muted-foreground">{item.qty} {item.unit}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat: any) => {
                      const selected = (inviteItemCats[idx] ?? []).includes(cat.id);
                      return (
                        <label key={cat.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all duration-150 ${selected ? "bg-primary/10 border-primary/30 text-primary font-bold" : "bg-card border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"}`}>
                          <input type="checkbox" checked={selected} onChange={() => toggleInviteCat(idx, cat.id)} className="sr-only" />
                          {cat.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              {Object.values(inviteItemCats).every((ids) => ids.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-6">Please select at least one vendor category above to invite.</p>
              )}
            </div>
            <div className="flex gap-2 justify-between items-center px-6 py-4 border-t border-border/40 bg-muted/10 shrink-0">
              <span className="text-[11px] text-muted-foreground font-medium">Matching vendor accounts will receive access instantly.</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setInviteModal(false)}>Cancel</Button>
                <Button size="sm" onClick={sendInvites} className="gap-1"><UserPlus className="h-3.5 w-3.5" /> Send Invitations</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settle Bid Price Negotiation Modal */}
      {settleBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSettleBid(null)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-dialog w-full max-w-3xl max-h-[85vh] overflow-hidden m-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border/40 bg-gradient-to-r from-card to-muted/20">
              <div className="flex items-center gap-2.5 font-bold text-sm text-foreground">
                <Handshake className="h-4.5 w-4.5 text-accent animate-pulse-soft" /> Settle Price · {settleBid.vendor?.name}
              </div>
              <button onClick={() => setSettleBid(null)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto max-h-[55vh]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/40 to-muted/20 border-b border-border/40">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Item</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-36">Current Bid Price</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Vendor Response</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-44">Target Settle Price (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {(settleBid.item_prices ?? []).map((it: any, i: number) => {
                    const negs = (settleBid.negotiations ?? []).filter((n: any) => n.item_name === it.name);
                    const last = negs[negs.length - 1];
                    const status = last?.status;
                    return (
                      <tr key={i} className="hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-foreground text-sm">{it.name}</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">{it.qty} {it.unit}</div>
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-xs font-bold text-foreground">৳ {Number(it.unit_price).toLocaleString()}</td>
                        <td className="px-5 py-4 text-xs font-medium">
                          {!last ? (
                            <span className="text-muted-foreground/50">No negotiation history</span>
                          ) : status === "pending" ? (
                            <span className="inline-flex items-center gap-1 text-warning bg-warning/10 px-2 py-0.5 rounded-md font-semibold">
                              <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse-soft" /> Offered ৳ {Number(last.offered_price).toLocaleString()}
                            </span>
                          ) : status === "accepted" ? (
                            <span className="text-success bg-success/10 px-2 py-0.5 rounded-md font-bold">Accepted ৳ {Number(last.offered_price).toLocaleString()}</span>
                          ) : status === "counter" ? (
                            <span className="text-info bg-info/10 px-2 py-0.5 rounded-md font-bold block max-w-[200px] truncate" title={last.vendor_comment}>
                              Counter ৳ {Number(last.counter_price).toLocaleString()}{last.vendor_comment ? ` ("${last.vendor_comment}")` : ""}
                            </span>
                          ) : (
                            <span className="text-destructive bg-destructive/10 px-2 py-0.5 rounded-md font-bold block max-w-[200px] truncate" title={last.vendor_comment}>
                              Denied{last.vendor_comment ? ` ("${last.vendor_comment}")` : ""}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="relative inline-flex items-center">
                            <span className="absolute left-2.5 text-xs text-muted-foreground/60 font-semibold font-mono">৳</span>
                            <input type="number" min="0" step="0.01" className="h-9 w-32 rounded-lg border border-border/80 bg-background pl-6 pr-2.5 text-xs font-mono text-right focus:outline-none focus:ring-2 focus:ring-accent/20"
                              value={offerInputs[it.name] ?? ""}
                              onChange={(e) => setOfferInputs({ ...offerInputs, [it.name]: e.target.value })} placeholder="Target price" />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 justify-between items-center px-6 py-4 border-t border-border/40 bg-muted/10 shrink-0">
              <span className="text-[11px] text-muted-foreground font-medium">Vendor will be notified. They can accept, counter, or reject target prices.</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSettleBid(null)}>Cancel</Button>
                <Button size="sm" onClick={sendOffers} disabled={sendingOffers} className="gap-1"><Handshake className="h-3.5 w-3.5" /> {sendingOffers ? "Sending Offer…" : "Send Offer"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sa.SweetAlert}
    </AppShell>
  );
}
