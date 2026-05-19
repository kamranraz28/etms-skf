import { useEffect, useMemo, useState } from "react";
import { router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TenderNew({ prs, categories, preselect_pr }: any) {
  const [prId, setPrId] = useState(preselect_pr ?? "");
  const [tenderNumber, setTenderNumber] = useState(`TND-${new Date().getFullYear()}-${Math.floor(100+Math.random()*900)}`);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(() => { const d = new Date(); d.setDate(d.getDate()+7); return d.toISOString().slice(0,16); });
  // per-item category selections: { [itemIndex]: Set<categoryId> }
  const [itemCategoryMap, setItemCategoryMap] = useState<Record<number, Set<string>>>({});
  const [saving, setSaving] = useState(false);

  const selectedPr = useMemo(() => prs.find((p: any) => p.id.toString() === prId.toString()), [prId, prs]);
  const items: any[] = selectedPr?.items ?? [];

  useEffect(() => { if (prId && !title) { const pr = prs.find((p: any) => p.id === prId); if (pr) setTitle(pr.title); } }, [prId]);

  // When PR changes, reset item selections
  useEffect(() => {
    setItemCategoryMap({});
  }, [prId]);

  const toggleItemCategory = (itemIndex: number, catId: string) => {
    setItemCategoryMap(prev => {
      const current = prev[itemIndex] ?? new Set<string>();
      const next = new Set(current);
      next.has(catId) ? next.delete(catId) : next.add(catId);
      return { ...prev, [itemIndex]: next };
    });
  };

  // aggregate all selected category IDs across all items
  const allSelectedCategoryIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(itemCategoryMap).forEach(set => set.forEach(id => ids.add(id)));
    return ids;
  }, [itemCategoryMap]);

  // compute eligible vendors count (for info only)
  const eligibleVendorCount = useMemo(() => {
    // We don't have the vendors list anymore, but we can just show the category count
    return allSelectedCategoryIds.size;
  }, [allSelectedCategoryIds]);

  const hasSelection = Object.values(itemCategoryMap).some(s => s.size > 0);

  const submit = () => {
    if (!hasSelection) { return; }
    setSaving(true);
    const itemCategories = Object.entries(itemCategoryMap)
      .filter(([, cats]) => cats.size > 0)
      .map(([idx, cats]) => ({
        item_index: Number(idx),
        category_ids: Array.from(cats).map(Number),
      }));
    router.post("/app/tenders", {
      tender_number: tenderNumber,
      pr_id: prId,
      title,
      description,
      deadline,
      item_categories: itemCategories,
    }, { onFinish: () => setSaving(false) });
  };

  return (
    <AppShell>
      <Head title="Create tender" />
      <PageHeader title="Create tender" description="Convert a PR into a tender and invite vendor categories per item." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 panel p-5 space-y-4">
          <div>
            <Label>From Purchase Requisition</Label>
            <select value={prId} onChange={(e)=>setPrId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">— Select PR —</option>
              {prs.map((p: any) => <option key={p.id} value={p.id}>{p.pr_number} · {p.title}{p.status==="tendered"?" (already tendered)":""}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Tender number</Label><Input value={tenderNumber} onChange={(e)=>setTenderNumber(e.target.value)} /></div>
            <div><Label>Submission deadline</Label><Input type="datetime-local" value={deadline} onChange={(e)=>setDeadline(e.target.value)} /></div>
          </div>
          <div><Label>Title</Label><Input value={title} onChange={(e)=>setTitle(e.target.value)} /></div>
          <div><Label>Description / scope</Label><Textarea rows={4} value={description} onChange={(e)=>setDescription(e.target.value)} /></div>

          {items.length > 0 && (
            <div>
              <div className="panel-title mb-3">Item-wise vendor category selection</div>
              <div className="space-y-4">
                {items.map((it: any, idx: number) => (
                  <div key={idx} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium">Item {idx + 1}: {it.name}</div>
                      <div className="text-xs text-muted-foreground">{it.qty} × {it.unit}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat: any) => {
                        const selected = itemCategoryMap[idx]?.has(cat.id.toString());
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleItemCategory(idx, cat.id.toString())}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                              selected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background border-input hover:bg-muted'
                            }`}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                      {categories.length === 0 && (
                        <span className="text-xs text-muted-foreground">No categories defined. Create vendor categories first.</span>
                      )}
                    </div>
                    {itemCategoryMap[idx]?.size > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {itemCategoryMap[idx].size} categor{itemCategoryMap[idx].size === 1 ? 'y' : 'ies'} selected for this item
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={()=>history.back()}>Cancel</Button>
            <Button onClick={submit} disabled={saving || !hasSelection}>
              {saving ? "Creating…" : "Create tender"}
            </Button>
          </div>
        </div>

        <div className="panel p-4 h-fit">
          <div className="panel-title mb-3">Invitation summary</div>
          {!prId && <p className="text-sm text-muted-foreground">Select a PR to get started.</p>}
          {prId && items.length === 0 && <p className="text-sm text-muted-foreground">No items in this PR.</p>}
          {items.length > 0 && (
            <div className="space-y-3">
              {items.map((it: any, idx: number) => {
                const cats = itemCategoryMap[idx];
                return (
                  <div key={idx} className="text-sm border-b border-border pb-2">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.qty} {it.unit}</div>
                    {cats && cats.size > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Array.from(cats).map(cid => {
                          const cat = categories.find((c: any) => c.id.toString() === cid);
                          return <span key={cid} className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{cat?.name ?? cid}</span>;
                        })}
                      </div>
                    ) : (
                      <div className="text-[10px] text-warning mt-1">No categories selected</div>
                    )}
                  </div>
                );
              })}
              <div className="text-xs text-muted-foreground pt-1">
                {allSelectedCategoryIds.size} categor{allSelectedCategoryIds.size === 1 ? 'y' : 'ies'} selected in total
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
