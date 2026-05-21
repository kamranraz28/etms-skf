import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export default function Settings({ login_alert_enabled, login_alert_email }: any) {
  const [enabled, setEnabled] = useState(login_alert_enabled);
  const [email, setEmail] = useState(login_alert_email);

  const save = () => {
    router.put("/app/settings", { login_alert_enabled: enabled, login_alert_email: email });
  };

  return (
    <AppShell>
      <Head title="Settings" />
      <PageHeader title="Settings" description="Manage application settings." />
      <div className="max-w-lg space-y-6">
        <div className="panel p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <div>
              <div className="font-semibold text-foreground">Login Alert</div>
              <div className="text-xs text-muted-foreground">Notify when an account is locked after 5 failed attempts</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable login alert</Label>
              <p className="text-xs text-muted-foreground mt-0.5">When disabled, accounts lock and unlock normally but no email is sent</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${enabled ? "bg-primary" : "bg-input"}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="space-y-1.5">
            <Label>Alert email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
            <p className="text-xs text-muted-foreground">This email receives the lockout notification with an unlock link</p>
          </div>

          <Button onClick={save}>Save settings</Button>
        </div>
      </div>
    </AppShell>
  );
}
