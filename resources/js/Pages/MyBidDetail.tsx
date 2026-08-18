import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { ArrowLeft, CheckCircle2, XCircle, Handshake, Send, FileText } from "lucide-react";

export default function MyBidDetail({ bid }: any) {
  const sa = useSweetAlert();
  const [counterPrices, setCounterPrices] = useState<Record<number, string>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [pending, setPending] = useState<Record<number, string | null>>({});

  const bidsTotal = bid?.total_price ?? 0;
  const negotiations = bid?.negotiations ?? [];

  const respond = (n: any, action: "accept" | "reject" | "counter") => {
    const confused = () => setPending((p) => ({ ...p, [n.id]: null }));
    const ok = (label: string) => {
      sa.alert("Done", label, "success");
      confused();
    };

    if (action === "accept") {
      sa.confirmAction(
        "Accept settled price?",
        `Your unit price for "${n.item_name}" will be updated to ${Number(n.offered_price).toLocaleString()} BDT.`,
        "Accept",
      ).then((yes) => {
        if (!yes) return;
        setPending((p) => ({ ...p, [n.id]: "accept" }));
        router.post(`/app/offers/${n.id}/accept`, {}, {
          onSuccess: () => ok("Offer accepted. Your bid price was updated."),
          onError: (e) => { sa.alert("Error", Object.values(e).join(", "), "error"); confused(); },
        });
      });
      return;
    }

    if (action === "reject") {
      sa.confirmAction(
        "Deny settled price?",
        "Your original bid price will stay unchanged.",
        "Deny",
      ).then((yes) => {
        if (!yes) return;
        setPending((p) => ({ ...p, [n.id]: "reject" }));
        router.post(`/app/offers/${n.id}/reject`, { vendor_comment: comments[n.id] ?? "" }, {
          onSuccess: () => ok("Offer denied. Original price kept."),
          onError: (e) => { sa.alert("Error", Object.values(e).join(", "), "error"); confused(); },
        });
      });
      return;
    }

    const price = Number(counterPrices[n.id]);
    if (!price || price <= 0) {
      sa.alert("Enter a price", "Provide your counter offer price.", "warning");
      return;
    }
    sa.confirmAction(
      "Send counter offer?",
      `Your unit price for "${n.item_name}" will be updated to ${price.toLocaleString()} BDT.`,
      "Send",
    ).then((yes) => {
      if (!yes) return;
      setPending((p) => ({ ...p, [n.id]: "counter" }));
      router.post(`/app/offers/${n.id}/counter`, { counter_price: price, vendor_comment: comments[n.id] ?? "" }, {
        onSuccess: () => ok("Counter offer submitted. Your bid price was updated."),
        onError: (e) => { sa.alert("Error", Object.values(e).join(", "), "error"); confused(); },
      });
    });
  };

  if (!bid) {
    return (
      <AppShell>
        <div className="panel p-6 text-sm text-muted-foreground">Bid not found.</div>
      </AppShell>
    );
  }

  const statusLabel: Record<string, { text: string; cls: string }> = {
    pending: { text: "Awaiting your response", cls: "bg-accent/10 text-accent" },
    accepted: { text: "Accepted", cls: "bg-success/10 text-success" },
    rejected: { text: "Denied", cls: "bg-destructive/10 text-destructive" },
    counter: { text: "Counter offer sent", cls: "bg-info/10 text-info" },
  };

  return (
    <AppShell>
      <Head title={`Bid · ${bid.tender?.tender_number ?? ""}`} />
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <PageHeader
        title={bid.tender?.title ?? "Bid"}
        description={`${bid.tender?.tender_number ?? ""} · Total bid ${Number(bidsTotal).toLocaleString()} BDT`}
        actions={<StatusBadge status={bid.tender?.status ?? "open"} />}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="panel overflow-hidden">
            <div className="panel-header bg-gradient-to-r from-card to-muted/20">
              <div className="panel-title"><FileText className="h-4.5 w-4.5 text-primary" /> Your bid prices</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/40 to-muted/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Unit price (BDT)</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {(bid.item_prices ?? []).map((it: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{it.name}</td>
                      <td className="px-4 py-3">{it.qty}</td>
                      <td className="px-4 py-3 text-right font-mono">{Number(it.unit_price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono">{(Number(it.unit_price) * Number(it.qty)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-gradient-to-r from-muted/30 to-muted/10">
                    <td colSpan={3} className="text-right px-4 py-3 text-sm text-muted-foreground">Total bid value</td>
                    <td className="text-right font-mono px-4 py-3">{Number(bidsTotal).toLocaleString()} BDT</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="panel-header bg-gradient-to-r from-card to-muted/20">
              <div className="panel-title"><Handshake className="h-4.5 w-4.5 text-accent" /> Settled price offers ({negotiations.length})</div>
            </div>
            {negotiations.length === 0 && (
              <div className="px-5 py-6 text-center text-xs text-muted-foreground">
                No settled-price offers from the authority yet.
              </div>
            )}
            <div className="divide-y divide-border/40">
              {negotiations.map((n: any) => {
                const st = statusLabel[n.status] ?? statusLabel.pending;
                return (
                  <div key={n.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{n.item_name}</div>
                        <div className="text-xs text-muted-foreground mt-1 space-x-2">
                          <span>Your price: <span className="font-mono">{Number(n.old_price).toLocaleString()}</span></span>
                          <span className="text-muted-foreground/50">→</span>
                          <span>Authority offers: <span className="font-mono font-semibold">{Number(n.offered_price).toLocaleString()}</span></span>
                        </div>
                        {n.status === "counter" && n.counter_price != null && (
                          <div className="text-xs text-info mt-0.5">Your counter: <span className="font-mono font-semibold">{Number(n.counter_price).toLocaleString()}</span></div>
                        )}
                        {n.vendor_comment && <div className="text-xs text-muted-foreground italic mt-0.5">"{(n as any).vendor_comment}"</div>}
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${st.cls}`}>{st.text}</span>
                    </div>

                    {n.status === "pending" && (
                      <div className="mt-3 space-y-2.5 border-t border-border/40 pt-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Input
                            type="number" min="0" step="0.01"
                            className="h-8 w-32 font-mono"
                            placeholder="Counter price"
                            value={counterPrices[n.id] ?? ""}
                            onChange={(e) => setCounterPrices({ ...counterPrices, [n.id]: e.target.value })}
                          />
                          <Input
                            className="h-8 flex-1 min-w-[160px]"
                            placeholder="Comment (optional)"
                            value={comments[n.id] ?? ""}
                            onChange={(e) => setComments({ ...comments, [n.id]: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => respond(n, "accept")} disabled={pending[n.id] === "accept"}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept {pending[n.id] === "accept" ? "…" : ""}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => respond(n, "reject")} disabled={!!pending[n.id]}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Deny
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => respond(n, "counter")} disabled={!!pending[n.id]}>
                            <Send className="h-3.5 w-3.5 mr-1" /> Send counter {pending[n.id] === "counter" ? "…" : ""}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-5 text-xs text-muted-foreground space-y-1.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <Handshake className="h-4 w-4 text-accent" /> How offers work
            </div>
            <p className="leading-relaxed">
              The authority may propose a settled price lower than your bid. You can <span className="text-success font-medium">accept</span> it,
              <span className="text-destructive font-medium"> deny</span> it (your original price stays), or
              <span className="text-info font-medium"> send a counter offer</span>. Accepted or countered prices replace your bid price in the comparison.
            </p>
            <p className="leading-relaxed">You must respond before the authority closes the tender.</p>
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}