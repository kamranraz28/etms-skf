import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Head, router } from "@inertiajs/react";
import { ArrowLeft, Gavel, Building2, FileText } from "lucide-react";
import { useState } from "react";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";

export default function SubmitBid({ tender, vendor }: any) {
  const allItems = (tender.pr?.items ?? []) as any[];
  const vendorCategoryIds = (vendor?.categories ?? []).map((c: any) => c.id.toString());

  const itemCategoryMap = useMemo(() => {
    const map: Record<number, string[]> = {};
    (tender.item_categories ?? []).forEach((ic: any) => {
      if (!map[ic.item_index]) map[ic.item_index] = [];
      map[ic.item_index].push(ic.vendor_category_id.toString());
    });
    return map;
  }, [tender.item_categories]);

  const items = useMemo(() => {
    if (vendorCategoryIds.length === 0) return [];
    return allItems.filter((_, idx) => {
      const allowedCats = itemCategoryMap[idx];
      if (!allowedCats || allowedCats.length === 0) return true;
      return allowedCats.some((catId) => vendorCategoryIds.includes(catId));
    });
  }, [allItems, itemCategoryMap, vendorCategoryIds]);

  const [prices, setPrices] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const sa = useSweetAlert();
  const [submitting, setSubmitting] = useState(false);
  const total = items.reduce((s, it, i) => s + Number(prices[`${it.name}_${i}`] || 0) * it.qty, 0);

  if (!vendor)
    return (
      <AppShell>
        <div className="panel p-6">
          <div className="text-destructive font-medium mb-2">No vendor profile linked to your account.</div>
        </div>
      </AppShell>
    );

  const submit = () => {
    setSubmitting(true);
    const fd = new FormData();
    items.forEach((it, i) => {
      fd.append(`item_prices[${i}][name]`, it.name);
      fd.append(`item_prices[${i}][qty]`, String(it.qty));
      fd.append(`item_prices[${i}][unit]`, it.unit);
      fd.append(`item_prices[${i}][unit_price]`, String(Number(prices[`${it.name}_${i}`] || 0)));
      if (remarks[`${it.name}_${i}`]) fd.append(`item_prices[${i}][remarks]`, remarks[`${it.name}_${i}`]);
    });
    if (notes) fd.append("notes", notes);
    if (file) fd.append("document", file);
    router.post(`/app/my-tenders/${tender.id}/bid`, fd, {
      onSuccess: () => sa.alert("Bid submitted", "Your bid has been submitted successfully.", "success"),
      onFinish: () => setSubmitting(false),
      forceFormData: true,
    });
  };

  return (
    <AppShell>
      <Head title={`Submit bid · ${tender.title}`} />
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <PageHeader
        title={`Submit bid · ${tender.title}`}
        description={`${tender.tender_number} · Deadline ${new Date(tender.deadline).toLocaleString()}`}
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 panel p-6 space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Gavel className="h-4.5 w-4.5 text-accent" /> Item-wise pricing
          </div>
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground py-4 bg-muted/20 rounded-lg p-4 border border-border/40">
              Your vendor category has not been invited for any items in this tender.
            </div>
          )}
          {items.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-muted/40 to-muted/20">
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Item</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Qty</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Unit</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Unit price (BDT)</th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Line total</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {items.map((it, i) => (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{it.name}</td>
                        <td className="px-4 py-3">{it.qty}</td>
                        <td className="px-4 py-3">{it.unit}</td>
                        <td className="px-4 py-3">
                          <Input type="number" min="0" step="0.01" className="h-9 w-32"
                            value={prices[`${it.name}_${i}`] ?? ""}
                            onChange={(e) => setPrices({ ...prices, [`${it.name}_${i}`]: e.target.value })} />
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium">
                          {(Number(prices[`${it.name}_${i}`] || 0) * it.qty).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Input type="text" className="h-9 w-36"
                            value={remarks[`${it.name}_${i}`] ?? ""}
                            onChange={(e) => setRemarks({ ...remarks, [`${it.name}_${i}`]: e.target.value })} placeholder="Optional" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-gradient-to-r from-muted/30 to-muted/10">
                      <td colSpan={4} className="text-right px-4 py-3.5 text-sm text-muted-foreground">Total bid value</td>
                      <td className="text-right font-mono px-4 py-3.5 text-lg">{total.toFixed(2)} BDT</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="space-y-1.5">
                <Label>Quotation document (optional, PDF)</Label>
                <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Delivery time, terms, etc." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => history.back()}>Cancel</Button>
                <Button onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit bid"}</Button>
              </div>
            </>
          )}
        </div>
        <div className="panel p-5 h-fit space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="h-4 w-4 text-accent" /> Bidder
          </div>
          <div className="text-sm font-medium">{vendor.name}</div>
          <div className="text-xs text-muted-foreground">{vendor.email}</div>
          {(vendor.categories ?? []).length > 0 && (
            <div className="text-xs">Categories: <span className="font-medium">{(vendor.categories ?? []).map((c: any) => c.name).join(', ')}</span></div>
          )}
          <div className="text-xs mt-1">ERP: <span className="font-mono">{vendor.erp_code ?? <span className="text-warning">not yet assigned</span>}</span></div>
          <div className="text-xs text-muted-foreground leading-relaxed pt-3 border-t border-border/40">
            You are invited to bid on {items.length} of {allItems.length} items based on your vendor categories.
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
