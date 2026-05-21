import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Plus, X, Receipt, FileText, Building2 } from "lucide-react";
import { useState } from "react";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";

export default function NewClaim({ vendor, pos = [] }: any) {
  const { props } = usePage();
  const errors = (props as any).errors || {};
  const sa = useSweetAlert();
  const [poNumber, setPoNumber] = useState("");
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
    if (!poNumber || !title || !amount || documents.every((d) => !d.file)) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("po_number", poNumber);
    fd.append("title", title);
    if (description) fd.append("description", description);
    fd.append("amount", amount);
    documents.forEach((d, i) => {
      if (d.file) { fd.append(`documents[${i}][type]`, d.type); fd.append(`documents[${i}][file]`, d.file); }
    });
    router.post("/app/claims", fd, { onSuccess: () => sa.alert("Claim created", "Your claim has been submitted successfully.", "success"), onError: () => {}, onFinish: () => setSubmitting(false), forceFormData: true });
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
              <div className="space-y-1.5">
                <Label>Purchase Order <span className="text-destructive">*</span></Label>
                <select className={cn("h-10 w-full rounded-lg border bg-background/80 px-3 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring", errors.po_number && "border-destructive")} value={poNumber} onChange={(e) => setPoNumber(e.target.value)}>
                  <option value="">-- Select PO --</option>
                  {pos.map((p: any) => (
                    <option key={p.id} value={p.po_number}>
                      {p.po_number}
                    </option>
                  ))}
                </select>
                {errors.po_number && <p className="text-xs text-destructive">{errors.po_number}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Claim amount (BDT) <span className="text-destructive">*</span></Label>
                <Input type="number" min="0.01" step="0.01" className={errors.amount && "border-destructive focus-visible:ring-destructive"} value={amount} onChange={(e) => setAmount(e.target.value)} />
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input className={errors.title && "border-destructive focus-visible:ring-destructive"} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title for this claim" />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details about this claim" />
            </div>
          </div>

          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4.5 w-4.5 text-primary" /> Supporting documents
              </div>
              <Button size="sm" variant="outline" onClick={addDoc}><Plus className="h-3.5 w-3.5 mr-1" /> Add document</Button>
            </div>
            {errors.documents && <p className="text-xs text-destructive">{errors.documents}</p>}
            {documents.map((d, i) => {
              const fileErr = errors[`documents.${i}.file`] || errors[`documents.${i}.type`];
              return (
                <div key={i} className={cn("flex items-start gap-3 p-4 border border-border/60 rounded-xl bg-muted/10", fileErr && "border-destructive")}>
                  <div className="flex-1 space-y-2 min-w-0">
                    <select className="h-10 w-full rounded-lg border border-input bg-background/80 px-3 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring" value={d.type} onChange={(e) => setDocType(i, e.target.value)}>
                      {docTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setDocFile(i, e.target.files?.[0] ?? null)} />
                    {fileErr && <p className="text-xs text-destructive">{fileErr}</p>}
                  </div>
                  {documents.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeDoc(i)} className="mt-1 shrink-0 hover:bg-destructive/10"><X className="h-4 w-4 text-destructive" /></Button>}
                </div>
              );
            })}
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
