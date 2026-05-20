import { useState } from "react";
import { router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";

export default function VendorProfile({ vendor }: any) {
  const sa = useSweetAlert();
  const [form, setForm] = useState({
    name: vendor?.name ?? "",
    email: vendor?.email ?? "",
    phone: vendor?.phone ?? "",
    notes: vendor?.notes ?? "",
  });
  const [pw, setPw] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const [pwOpen, setPwOpen] = useState(false);
  const locked = vendor && vendor.status !== "pending";
  const save = () => router.post("/app/profile", form, { onSuccess: () => sa.alert("Profile updated", "Your vendor profile has been saved.", "success") });
  const changePw = () => {
    router.post("/app/profile/password", pw, {
      onSuccess: () => { setPw({ current_password: "", new_password: "", new_password_confirmation: "" }); setPwOpen(false); },
    });
  };

  return (
    <AppShell>
      <Head title="Vendor profile" />
      <div className="max-w-2xl">
        <PageHeader
          title="Vendor profile"
          description={vendor ? "Your company details on file." : "Submit your registration. An admin will activate your account and assign your ERP code."}
          actions={vendor ? <StatusBadge status={vendor.status} /> : null}
        />
        <div className="panel p-5 space-y-3">
          <div><Label>Company name</Label><Input value={form.name} disabled={locked} onChange={(e)=>setForm({...form, name:e.target.value})} /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} disabled={locked} onChange={(e)=>setForm({...form, email:e.target.value})} /></div>
          <div><Label>Phone</Label><Input value={form.phone} disabled={locked} onChange={(e)=>setForm({...form, phone:e.target.value})} /></div>
          <div><Label>About / capabilities</Label><Textarea rows={4} value={form.notes} disabled={locked} onChange={(e)=>setForm({...form, notes:e.target.value})} /></div>
          {vendor && (
            <div className="text-xs bg-muted/50 rounded p-3 border border-border">
              <div className="flex justify-between"><span className="text-muted-foreground">ERP Vendor Code</span>
                <span className="font-mono">{vendor.erp_code ?? <span className="text-warning">Not assigned yet</span>}</span></div>
              <div className="flex justify-between mt-1"><span className="text-muted-foreground">Registered</span>
                <span>{new Date(vendor.created_at).toLocaleDateString()}</span></div>
            </div>
          )}
          {!locked && (
            <div className="pt-2 flex justify-end">
              <Button onClick={save}>{vendor ? "Save changes" : "Submit registration"}</Button>
            </div>
          )}
        </div>

        {vendor && (
          <div className="panel p-5 mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="panel-title mb-0">Password</div>
              <Button variant="outline" size="sm" onClick={() => setPwOpen(!pwOpen)}>
                {pwOpen ? "Cancel" : "Change password"}
              </Button>
            </div>
            {pwOpen && (
              <div className="space-y-3 pt-2">
                <div>
                  <Label>Current password</Label>
                  <Input type="password" value={pw.current_password}
                    onChange={(e) => setPw({...pw, current_password: e.target.value})} />
                </div>
                <div>
                  <Label>New password</Label>
                  <Input type="password" value={pw.new_password}
                    onChange={(e) => setPw({...pw, new_password: e.target.value})} />
                </div>
                <div>
                  <Label>Confirm new password</Label>
                  <Input type="password" value={pw.new_password_confirmation}
                    onChange={(e) => setPw({...pw, new_password_confirmation: e.target.value})} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={changePw} disabled={!pw.current_password || !pw.new_password || !pw.new_password_confirmation}>
                    Update password
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
