import { useEffect, useMemo, useState } from "react";
import { router, Head, usePage } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { ArrowLeft, Gavel, FileText } from "lucide-react";

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
  const [saving, setSaving] = useState(false);

  const selectedPr = useMemo(() => prs.find((p: any) => p.id.toString() === prId.toString()), [prId, prs]);
  const items: any[] = selectedPr?.items ?? [];

  useEffect(() => { if (prId && !title) { const pr = prs.find((p: any) => p.id === prId); if (pr) setTitle(pr.title); } }, [prId]);
  useEffect(() => { setItemCategoryMap({}); }, [prId]);

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
      <Head title="Create tender" />
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <PageHeader title="Create tender" description="Convert a PR into a tender and invite vendor categories per item." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
              <Gavel className="h-4.5 w-4.5 text-accent" /> Tender details
            </div>
            {preselect_pr ? (
              <div className="space-y-1.5">
                <Label>Purchase Requisition</Label>
                <div className="text-sm font-medium py-2 px-3 bg-muted/30 rounded-lg border border-border/40">{selectedPr?.pr_number} · {selectedPr?.title}</div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>From Purchase Requisition <span className="text-destructive">*</span></Label>
                <select value={prId} onChange={(e)=>setPrId(e.target.value)}
                  className={cn("w-full h-10 rounded-lg border bg-background/80 px-3 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring", errors.pr_id && "border-destructive")}>
                  <option value="">— Select PR —</option>
                  {prs.filter((p: any) => p.status !== "tendered").map((p: any) => <option key={p.id} value={p.id}>{p.pr_number} · {p.title}</option>)}
                </select>
                {errors.pr_id && <p className="text-xs text-destructive">{errors.pr_id}</p>}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tender number <span className="text-destructive">*</span></Label>
                <Input className={errors.tender_number && "border-destructive focus-visible:ring-destructive"} value={tenderNumber} onChange={(e)=>setTenderNumber(e.target.value)} />
                {errors.tender_number && <p className="text-xs text-destructive">{errors.tender_number}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Submission deadline <span className="text-destructive">*</span></Label>
                <Input type="datetime-local" className={errors.deadline && "border-destructive focus-visible:ring-destructive"} value={deadline} onChange={(e)=>setDeadline(e.target.value)} />
                {errors.deadline && <p className="text-xs text-destructive">{errors.deadline}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input className={errors.title && "border-destructive focus-visible:ring-destructive"} value={title} onChange={(e)=>setTitle(e.target.value)} />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description / scope</Label>
              <Textarea rows={4} className={errors.description && "border-destructive focus-visible:ring-destructive"} value={description} onChange={(e)=>setDescription(e.target.value)} />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>

            {items.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                  <FileText className="h-4 w-4 text-accent" /> Item-wise vendor category selection
                </div>
                <div className="space-y-4">
                  {items.map((it: any, idx: number) => (
                    <div key={idx} className="border border-border/60 rounded-xl p-5 bg-muted/10 hover-limit">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                        <div className="text-sm font-semibold">Item {idx + 1}: {it.name}</div>
                        <div className="text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-full">{it.qty} × {it.unit}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat: any) => {
                          const selected = itemCategoryMap[idx]?.has(cat.id.toString());
                          return (
                            <button key={cat.id} type="button" onClick={() => toggleItemCategory(idx, cat.id.toString())}
                              className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all duration-200 ${
                                selected ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20' : 'bg-background border-input hover:bg-muted hover:border-muted-foreground/30'
                              }`}>
                              {cat.name}
                            </button>
                          );
                        })}
                        {categories.length === 0 && <span className="text-xs text-muted-foreground">No categories defined.</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" onClick={()=>history.back()}>Cancel</Button>
              <Button onClick={submit} disabled={saving || !hasSelection}>{saving ? "Creating…" : "Create tender"}</Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-5 h-fit">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
              <FileText className="h-4 w-4 text-accent" /> Invitation summary
            </div>
            {!prId && <p className="text-sm text-muted-foreground">Select a PR to get started.</p>}
            {prId && items.length === 0 && <p className="text-sm text-muted-foreground">No items in this PR.</p>}
            {items.length > 0 && (
              <div className="space-y-3">
                {items.map((it: any, idx: number) => {
                  const cats = itemCategoryMap[idx];
                  return (
                    <div key={idx} className="text-sm border-b border-border/40 pb-3 last:border-0 last:pb-0">
                      <div className="font-medium truncate">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{it.qty} {it.unit}</div>
                      {cats && cats.size > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {Array.from(cats).map(cid => {
                            const cat = categories.find((c: any) => c.id.toString() === cid);
                            return <span key={cid} className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">{cat?.name ?? cid}</span>;
                          })}
                        </div>
                      ) : (
                        <div className="text-[10px] text-warning mt-1 font-medium">No categories selected</div>
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
