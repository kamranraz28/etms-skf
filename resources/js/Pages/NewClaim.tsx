import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Plus, X, Receipt, FileText, Building2, UploadCloud, Info } from "lucide-react";
import { useState } from "react";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";

export default function NewClaim({ vendor, pos = [], billTypes = [] }: any) {
  const { props } = usePage();
  const errors = (props as any).errors || {};
  const sa = useSweetAlert();
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [billType, setBillType] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [documents, setDocuments] = useState<{ type: string; file: File | null }[]>([{ type: "invoice", file: null }]);
  const [submitting, setSubmitting] = useState(false);

  if (!vendor)
    return (
      <AppShell>
        <div className="panel p-6 max-w-xl mx-auto mt-8">
          <div className="text-destructive font-bold mb-2 flex items-center gap-2">
            <XCircle className="h-5 w-5" /> Account Registration Incomplete
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No active vendor profile is linked to your user account. Please navigate to the vendor profile section or contact the administration team.
          </p>
        </div>
      </AppShell>
    );

  const addDoc = () => setDocuments([...documents, { type: "other", file: null }]);
  const removeDoc = (i: number) => setDocuments(documents.filter((_, idx) => idx !== i));
  const setDocType = (i: number, type: string) => { const copy = [...documents]; copy[i].type = type; setDocuments(copy); };
  const setDocFile = (i: number, file: File | null) => { const copy = [...documents]; copy[i].file = file; setDocuments(copy); };

  const submit = () => {
    if (!billNumber || !billDate || !billType || !poNumber || !title || !amount || documents.every((d) => !d.file)) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("bill_number", billNumber);
    fd.append("bill_date", billDate);
    fd.append("bill_type", billType);
    fd.append("po_number", poNumber);
    fd.append("title", title);
    if (description) fd.append("description", description);
    fd.append("amount", amount);
    documents.forEach((d, i) => {
      if (d.file) { fd.append(`documents[${i}][type]`, d.type); fd.append(`documents[${i}][file]`, d.file); }
    });
    router.post("/app/claims", fd, { 
      onSuccess: () => sa.alert("Claim created", "Your claim has been submitted successfully.", "success"), 
      onError: () => {}, 
      onFinish: () => setSubmitting(false), 
      forceFormData: true 
    });
  };

  const docTypes = [
    { value: "invoice", label: "Invoice" },
    { value: "delivery_challan", label: "Delivery Challan" },
    { value: "payment_receipt", label: "Payment Receipt" },
    { value: "other", label: "Other" },
  ];

  return (
    <AppShell>
      <Head title="Submit New Claim" />
      <Button variant="ghost" size="sm" onClick={() => history.back()} className="mb-4 hover:bg-muted/80 gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      
      <PageHeader title="Submit New Claim" description="Create and submit a new invoice billing claim for processing approvals." />
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Bill Info Card */}
          <div className="panel p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1 pb-1 border-b border-border/40">
              <Receipt className="h-4.5 w-4.5 text-accent" /> Bill & Invoice Details
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Bill Reference Number <span className="text-destructive">*</span></Label>
                <Input className={cn("h-11", errors.bill_number && "border-destructive")} value={billNumber} onChange={(e) => setBillNumber(e.target.value)} placeholder="e.g. INV-2026-009" />
                {errors.bill_number && <p className="text-xs text-destructive">{errors.bill_number}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Bill / Invoice Date <span className="text-destructive">*</span></Label>
                <Input type="date" className={cn("h-11", errors.bill_date && "border-destructive")} value={billDate} onChange={(e) => setBillDate(e.target.value)} />
                {errors.bill_date && <p className="text-xs text-destructive">{errors.bill_date}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Bill Classification Type <span className="text-destructive">*</span></Label>
                <select className={cn("h-11 w-full rounded-xl border bg-background px-4 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20", errors.bill_type && "border-destructive")} value={billType} onChange={(e) => setBillType(e.target.value)}>
                  <option value="">-- Select Category --</option>
                  {billTypes.map((bt: any) => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
                {errors.bill_type && <p className="text-xs text-destructive">{errors.bill_type}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Purchase Order (PO) <span className="text-destructive">*</span></Label>
                <select className={cn("h-11 w-full rounded-xl border bg-background px-4 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/20", errors.po_number && "border-destructive")} value={poNumber} onChange={(e) => setPoNumber(e.target.value)}>
                  <option value="">-- Select Linked PO --</option>
                  {pos.map((p: any) => (
                    <option key={p.id} value={p.po_number}>
                      {p.po_number}
                    </option>
                  ))}
                </select>
                {errors.po_number && <p className="text-xs text-destructive">{errors.po_number}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Claim Amount (BDT) <span className="text-destructive">*</span></Label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-semibold font-mono text-muted-foreground/60">৳</span>
                  <Input type="number" min="0.01" step="0.01" className={cn("h-11 pl-7", errors.amount && "border-destructive")} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Claim Title / Header <span className="text-destructive">*</span></Label>
              <Input className={cn("h-11", errors.title && "border-destructive")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Supply of office laptops - final invoice payment" />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Detailed Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide additional details or transaction remarks..." />
            </div>
          </div>

          {/* Supporting Documents Card */}
          <div className="panel p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-border/40">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4.5 w-4.5 text-primary" /> Supporting Documents Upload
              </div>
              <Button size="sm" variant="outline" onClick={addDoc} className="gap-1 h-8"><Plus className="h-3.5 w-3.5" /> Add Doc</Button>
            </div>
            {errors.documents && <p className="text-xs text-destructive">{errors.documents}</p>}
            
            <div className="space-y-3">
              {documents.map((d, i) => {
                const fileErr = errors[`documents.${i}.file`] || errors[`documents.${i}.type`];
                return (
                  <div key={i} className={cn("flex gap-3 p-4 border border-border/60 rounded-xl bg-gradient-to-br from-card to-muted/20 relative", fileErr && "border-destructive")}>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Doc Classification</Label>
                        <select className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-xs focus:outline-none" value={d.type} onChange={(e) => setDocType(i, e.target.value)}>
                          {docTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Choose File</Label>
                        <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="h-10 text-xs px-2.5 pt-1.5" onChange={(e) => setDocFile(i, e.target.files?.[0] ?? null)} />
                        {fileErr && <p className="text-xs text-destructive mt-1">{fileErr}</p>}
                      </div>
                    </div>
                    {documents.length > 1 && (
                      <Button size="sm" variant="ghost" onClick={() => removeDoc(i)} className="h-8 w-8 p-0 shrink-0 hover:bg-destructive/10 self-end">
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => history.back()}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>{submitting ? "Submitting…" : "Submit Claim"}</Button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="panel p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1 pb-1 border-b border-border/40">
              <Building2 className="h-4.5 w-4.5 text-accent" /> Vendor Entity
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {vendor.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{vendor.name}</div>
                <div className="text-xs text-muted-foreground truncate">{vendor.email}</div>
              </div>
            </div>
            
            <div className="text-xs space-y-1.5 pt-3 border-t border-border/30">
              <div className="flex justify-between"><span className="text-muted-foreground">ERP Code</span> <span className="font-mono font-semibold">{vendor.erp_code ?? "—"}</span></div>
            </div>
            
            <div className="bg-info/[0.04] border border-info/20 rounded-xl p-3.5 flex items-start gap-2 leading-relaxed">
              <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
              <div className="text-[10px] text-info/80 font-medium">Selecting a bill classification defines the specific multi-step approval path. Ensure all files are uploaded before submission.</div>
            </div>
          </div>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}

function XCircle(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
}
