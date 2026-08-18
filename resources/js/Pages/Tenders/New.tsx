import { useEffect, useMemo, useState } from "react";
import { router, Head, usePage } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { ArrowLeft, Gavel, FileText, CheckSquare, Square, Info } from "lucide-react";

export default function TenderNew({ prs, categories, preselect_pr }: any) {
  const { props } = usePage();
  const errors = (props as any).errors || {};
  const sa = useSweetAlert();
  const [prId, setPrId] = useState(preselect_pr ?? "");
  const [tenderNumber, setTenderNumber] = useState(`TND-${new Date().getFullYear()}-${Math.floor(100+Math.random()*900)}`);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(() => { const d = new Date(); d.setDate(d.getDate()+7); return d.toISOString().slice(0,16); });
  const [itemCategoryMap, setItemCategoryMap] = useState<Record<number, Set<string>>>({});
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const selectedPr = useMemo(() => prs.find((p: any) => p.id.toString() === prId.toString()), [prId, prs]);
  const items: any[] = selectedPr?.items ?? [];
  const assignments = selectedPr?.assignments ?? [];
  const pendingIndices = useMemo(() => {
    const assigned = new Set(assignments.filter((a: any) => a.status !== "pending").map((a: any) => a.item_index));
    return items.map((_: any, idx: number) => idx).filter((idx: number) => !assigned.has(idx));
  }, [items, assignments]);

  useEffect(() => { if (prId && !title) { const pr = prs.find((p: any) => p.id === prId); if (pr) setTitle(pr.title); } }, [prId]);
  useEffect(() => { setItemCategoryMap({}); setSelectedItems(new Set(pendingIndices)); }, [prId, pendingIndices]);

  const toggleItemSelection = (idx: number) => {
    if (!pendingIndices.includes(idx)) return;
    setSelectedItems(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
    setItemCategoryMap(prev => {
      if (selectedItems.has(idx)) {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      }
      return prev;
    });
  };

  const toggleItemCategory = (itemIndex: number, catId: string) => {
    setItemCategoryMap(prev => {
      const current = prev[itemIndex] ?? new Set<string>();
      const next = new Set(current);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return { ...prev, [itemIndex]: next };
    });
  };

  const allSelectedCategoryIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(itemCategoryMap).forEach(set => set.forEach(id => ids.add(id)));
    return ids;
  }, [itemCategoryMap]);

  const hasSelection = Object.values(itemCategoryMap).some(s => s.size > 0);

  const submit = () => {
    if (!hasSelection) return;
    setSaving(true);
    const itemCategories = Object.entries(itemCategoryMap)
      .filter(([, cats]) => cats.size > 0)
      .map(([idx, cats]) => ({ item_index: Number(idx), category_ids: Array.from(cats).map(Number) }));
    router.post("/app/tenders", { tender_number: tenderNumber, pr_id: prId, title, description, deadline, item_categories: itemCategories }, {
      onSuccess: () => { sa.alert("Tender created", "Tender has been created successfully.", "success"); setSaving(false); },
      onError: () => setSaving(false),
    });
  };

  return (
    <AppShell>
      <Head title="Create Tender" />
      
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-4 hover:bg-muted/80 gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <PageHeader title="Create Tender" description="Convert a Purchase Requisition into a tender and invite vendor categories for specific items." />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2 pb-2 border-b border-border/40">
              <Gavel className="h-4.5 w-4.5 text-accent" /> Requisition & Details
            </div>
            
            {preselect_pr ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Selected Purchase Requisition</Label>
                <div className="text-sm font-semibold py-2.5 px-4 bg-muted/40 rounded-xl border border-border/50 text-foreground">
                  {selectedPr?.pr_number} · {selectedPr?.title}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Purchase Requisition <span className="text-destructive">*</span></Label>
                <select value={prId} onChange={(e)=>setPrId(e.target.value)}
                  className={cn("w-full h-11 rounded-xl border bg-background px-4 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/25", errors.pr_id && "border-destructive")}>
                  <option value="">— Select Requisition —</option>
                  {prs.filter((p: any) => p.derived_status !== "tendered").map((p: any) => <option key={p.id} value={p.id}>{p.pr_number} · {p.title}</option>)}
                </select>
                {errors.pr_id && <p className="text-xs text-destructive">{errors.pr_id}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Tender number <span className="text-destructive">*</span></Label>
                <Input className={cn("h-11", errors.tender_number && "border-destructive focus-visible:ring-destructive")} value={tenderNumber} onChange={(e)=>setTenderNumber(e.target.value)} />
                {errors.tender_number && <p className="text-xs text-destructive">{errors.tender_number}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Submission deadline <span className="text-destructive">*</span></Label>
                <Input type="datetime-local" className={cn("h-11", errors.deadline && "border-destructive focus-visible:ring-destructive")} value={deadline} onChange={(e)=>setDeadline(e.target.value)} />
                {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Tender Title <span className="text-destructive">*</span></Label>
              <Input className={cn("h-11", errors.title && "border-destructive focus-visible:ring-destructive")} value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g. Procurement of Laptop Equipment" />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Description / Scope of Work</Label>
              <Textarea rows={4} className={cn(errors.description && "border-destructive focus-visible:ring-destructive")} value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Specify details, warranty information, delivery parameters..." />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            {items.length > 0 && (
              <div className="pt-4 border-t border-border/40 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4.5 w-4.5 text-accent" /> Requisition Items & Vendor Invitation
                </div>
                <div className="space-y-3">
                  {items.map((it: any, idx: number) => {
                    const isPending = pendingIndices.includes(idx);
                    const isSelected = selectedItems.has(idx);
                    return (
                      <div key={idx} className={cn(
                        "border rounded-xl p-4 transition-all duration-200",
                        isSelected && isPending
                          ? "border-accent/40 bg-accent/[0.02]"
                          : isPending
                            ? "border-border/60 bg-card"
                            : "border-border/20 bg-muted/10 opacity-50 select-none"
                      )}>
                        <div className="flex items-start gap-3">
                          <button type="button" onClick={() => toggleItemSelection(idx)}
                            className={cn(
                              "mt-0.5 shrink-0 h-5 w-5 rounded-md flex items-center justify-center border transition-all duration-150",
                              isSelected && isPending
                                ? "bg-accent border-accent text-white"
                                : isPending
                                  ? "border-border/80 text-transparent hover:border-accent"
                                  : "border-border/30 bg-muted text-transparent"
                            )}
                            disabled={!isPending}>
                            {isSelected && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">Line {idx + 1}: {it.name}</span>
                                {!isPending && (
                                  <StatusBadge status={assignments.find((a: any) => a.item_index === idx)?.status ?? "assigned"} className="text-[9px]" />
                                )}
                              </div>
                              <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md self-start sm:self-auto">
                                {it.qty} {it.unit}
                              </span>
                            </div>
                            
                            {isPending && isSelected && (
                              <div className="mt-3.5 space-y-2">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Select Vendor Category Invitations:</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {categories.map((cat: any) => {
                                    const selected = itemCategoryMap[idx]?.has(cat.id.toString());
                                    return (
                                      <button key={cat.id} type="button" onClick={() => toggleItemCategory(idx, cat.id.toString())}
                                        className={cn(
                                          "text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all duration-150",
                                          selected 
                                            ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                                            : 'bg-card border-border/85 hover:bg-muted/40 hover:border-muted-foreground/30 text-muted-foreground hover:text-foreground'
                                        )}>
                                        {cat.name}
                                      </button>
                                    );
                                  })}
                                  {categories.length === 0 && <span className="text-xs text-muted-foreground">No categories defined.</span>}
                                </div>
                              </div>
                            )}
                            
                            {!isPending && (
                              <div className="text-xs text-muted-foreground mt-1">Already handled. Cannot be included in new tenders.</div>
                            )}
                            {isPending && !isSelected && (
                              <div className="text-xs text-muted-foreground/50 mt-1">Check to select this item and invite supplier categories.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" onClick={()=>history.back()}>Cancel</Button>
              <Button onClick={submit} disabled={saving || !hasSelection}>{saving ? "Creating…" : "Create Tender"}</Button>
            </div>
          </div>
        </div>

        {/* Side Panel: Invitation Summary */}
        <div className="space-y-6">
          <div className="panel p-5 h-fit">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border/40">
              <Info className="h-4 w-4 text-accent" /> Invitation Summary
            </div>
            {!prId && <p className="text-sm text-muted-foreground">Select a Purchase Requisition to summarize invites.</p>}
            {prId && items.length === 0 && <p className="text-sm text-muted-foreground">No items detected in requisition.</p>}
            {items.length > 0 && (
              <div className="space-y-3.5">
                {items.map((it: any, idx: number) => {
                  const cats = itemCategoryMap[idx];
                  const isPending = pendingIndices.includes(idx);
                  const isSelected = selectedItems.has(idx);
                  return (
                    <div key={idx} className={cn("text-xs border-b border-border/30 pb-3 last:border-0 last:pb-0", !isSelected && "opacity-40")}>
                      <div className="font-semibold text-foreground truncate flex items-center gap-1.5">
                        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isSelected ? "bg-accent" : "bg-muted-foreground/30")} />
                        {it.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{it.qty} {it.unit}</div>
                      {isSelected && cats && cats.size > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {Array.from(cats).map(cid => {
                            const cat = categories.find((c: any) => c.id.toString() === cid);
                            return <span key={cid} className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{cat?.name ?? cid}</span>;
                          })}
                        </div>
                      ) : isSelected ? (
                        <div className="text-[10px] text-warning mt-1 font-bold">Select category invitations</div>
                      ) : (
                        <div className="text-[10px] text-muted-foreground/60 mt-1">{isPending ? "Not selected" : "Handled"}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
