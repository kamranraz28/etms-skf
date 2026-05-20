import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Head, router } from "@inertiajs/react";
import { ArrowLeft, Plus, X, Receipt, FileText } from "lucide-react";
import { useState } from "react";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";

export default function NewClaim({ vendor, tenders = [] }: any) {
  const sa = useSweetAlert();
  const [tenderNumber, setTenderNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [documents, setDocuments] = useState<{ type: string; file: File | null }[]>([{ type: "invoice", file: null }]);
  const [submitting, setSubmitting] = useState(false);

  if (!vendor)
    return (
      <AppShell>
        <div className="panel p-6">
          <div className="text-destructive font-medium mb-2">No vendor profile linked to your account.</div>
        </div>
      </AppShell>
    );

  const addDoc = () => setDocuments([...documents, { type: "other", file: null }]);
  const removeDoc = (i: number) => setDocuments(documents.filter((_, idx) => idx !== i));
  const setDocType = (i: number, type: string) => { const copy = [...documents]; copy[i].type = type; setDocuments(copy); };
  const setDocFile = (i: number, file: File | null) => { const copy = [...documents]; copy[i].file = file; setDocuments(copy); };

  const submit = () => {
    if (!tenderNumber || !title || !amount || documents.every((d) => !d.file)) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("tender_number", tenderNumber);
    fd.append("title", title);
    if (description) fd.append("description", description);
    fd.append("amount", amount);
    documents.forEach((d, i) => {
      if (d.file) { fd.append(`documents[${i}][type]`, d.type); fd.append(`documents[${i}][file]`, d.file); }
    });
    router.post("/app/claims", fd, { onSuccess: () => sa.alert("Claim created", "Your claim has been submitted successfully.", "success"), onFinish: () => setSubmitting(false), forceFormData: true });
  };

  const docTypes = [
    { value: "invoice", label: "Invoice" },
    { value: "delivery_challan", label: "Delivery Challan" },
    { value: "payment_receipt", label: "Payment Receipt" },
    { value: "other", label: "Other" },
  ];

  return (
    <AppShell>
      <Head title="New Claim" />
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <PageHeader title="New Claim" description="Submit a billing claim with supporting documents." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Receipt className="h-4.5 w-4.5 text-accent" /> Claim information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Tender</Label>
                <select className="h-10 w-full rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring" value={tenderNumber} onChange={(e) => setTenderNumber(e.target.value)}>
                  <option value="">-- Select tender --</option>
                  {tenders.map((t: any) => (<option key={t.id} value={t.tender_number}>{t.tender_number} — {t.title}</option>))}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Claim amount (BDT)</Label><Input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title for this claim" /></div>
            <div className="space-y-1.5"><Label>Description (optional)</Label><Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details about this claim" /></div>
          </div>

          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4.5 w-4.5 text-primary" /> Supporting documents
              </div>
              <Button size="sm" variant="outline" onClick={addDoc}><Plus className="h-3.5 w-3.5 mr-1" /> Add document</Button>
            </div>
            {documents.map((d, i) => (
              <div key={i} className="flex items-start gap-3 p-4 border border-border/60 rounded-xl bg-muted/10">
                <div className="flex-1 space-y-2 min-w-0">
                  <select className="h-10 w-full rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring" value={d.type} onChange={(e) => setDocType(i, e.target.value)}>
                    {docTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setDocFile(i, e.target.files?.[0] ?? null)} />
                </div>
                {documents.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeDoc(i)} className="mt-1 shrink-0 hover:bg-destructive/10"><X className="h-4 w-4 text-destructive" /></Button>}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => history.back()}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit claim"}</Button>
          </div>
        </div>

        <div className="panel p-5 h-fit space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Building2 className="h-4 w-4 text-accent" /> Vendor
          </div>
          <div className="text-sm font-medium">{vendor.name}</div>
          <div className="text-xs text-muted-foreground">{vendor.email}</div>
          <div className="text-xs">ERP: <span className="font-mono">{vendor.erp_code ?? "—"}</span></div>
          <div className="text-xs text-muted-foreground leading-relaxed pt-3 border-t border-border/40">
            Your claim will be reviewed by the procurement panel, then approver panel, then admin for final approval.
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
