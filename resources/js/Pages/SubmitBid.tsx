import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Head, router } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function SubmitBid({ tender, vendor }: any) {
  const allItems = (tender.pr?.items ?? []) as any[];
  const vendorCategoryId = vendor?.vendor_category_id?.toString();

  // Determine which items this vendor can bid on based on per-item category assignments
  const itemCategoryMap = useMemo(() => {
    const map: Record<number, string[]> = {};
    (tender.item_categories ?? []).forEach((ic: any) => {
      if (!map[ic.item_index]) map[ic.item_index] = [];
      map[ic.item_index].push(ic.vendor_category_id.toString());
    });
    return map;
  }, [tender.item_categories]);

  const items = useMemo(() => {
    if (!vendorCategoryId) return [];
    return allItems.filter((_, idx) => {
      const allowedCats = itemCategoryMap[idx];
      if (!allowedCats || allowedCats.length === 0) return true; // no restriction = all vendors
      return allowedCats.includes(vendorCategoryId);
    });
  }, [allItems, itemCategoryMap, vendorCategoryId]);

  const [prices, setPrices] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const total = items.reduce(
    (s, it, i) => s + Number(prices[`${it.name}_${i}`] || 0) * it.qty,
    0,
  );

  if (!vendor)
    return (
      <AppShell>
        <div className="panel p-6">
          <div className="text-destructive font-medium mb-2">
            No vendor profile linked to your account.
          </div>
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
      fd.append(
        `item_prices[${i}][unit_price]`,
        String(Number(prices[`${it.name}_${i}`] || 0)),
      );
    });
    if (notes) fd.append("notes", notes);
    if (file) fd.append("document", file);
    router.post(`/app/my-tenders/${tender.id}/bid`, fd, {
      onFinish: () => setSubmitting(false),
      forceFormData: true,
    });
  };

  return (
    <AppShell>
      <Head title={`Submit bid · ${tender.title}`} />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => history.back()}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <PageHeader
        title={`Submit bid · ${tender.title}`}
        description={`${tender.tender_number} · Deadline ${new Date(tender.deadline).toLocaleString()}`}
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 panel p-5 space-y-4">
          <div>
            <div className="panel-title mb-2">Item-wise pricing</div>
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground py-4">
                Your vendor category has not been invited for any items in this tender.
              </div>
            )}
            {items.length > 0 && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Unit price (BDT)</th>
                    <th className="text-right">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td>{it.name}</td>
                      <td>{it.qty}</td>
                      <td>{it.unit}</td>
                      <td>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="h-8"
                          value={prices[`${it.name}_${i}`] ?? ""}
                          onChange={(e) =>
                            setPrices({ ...prices, [`${it.name}_${i}`]: e.target.value })
                          }
                        />
                      </td>
                      <td className="text-right font-mono">
                        {(Number(prices[`${it.name}_${i}`] || 0) * it.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold bg-muted/40">
                    <td colSpan={4} className="text-right px-3 py-2">
                      Total bid value
                    </td>
                    <td className="text-right font-mono px-3 py-2">
                      {total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
          {items.length > 0 && (
            <>
              <div>
                <Label>Quotation document (optional, PDF)</Label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Delivery time, terms, etc."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => history.back()}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit bid"}
                </Button>
              </div>
            </>
          )}
        </div>
        <div className="panel p-4 h-fit space-y-2">
          <div className="panel-title mb-2">Bidder</div>
          <div className="text-sm font-medium">{vendor.name}</div>
          <div className="text-xs text-muted-foreground">{vendor.email}</div>
          {vendor.vendor_category && (
            <div className="text-xs">
              Category: <span className="font-medium">{vendor.vendor_category.name}</span>
            </div>
          )}
          <div className="text-xs mt-1">
            ERP:{" "}
            <span className="font-mono">
              {vendor.erp_code ?? (
                <span className="text-warning">not yet assigned</span>
              )}
            </span>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed pt-2">
            You are invited to bid on {items.length} of {allItems.length} items based on your vendor category.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
