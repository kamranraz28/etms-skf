import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Bell, Save, Settings2 } from "lucide-react";

export default function Settings({ login_alert_enabled, login_alert_email }: any) {
  const [enabled, setEnabled] = useState(login_alert_enabled);
  const [email, setEmail] = useState(login_alert_email);

  const save = () => {
    router.put("/app/settings", { login_alert_enabled: enabled, login_alert_email: email });
  };

  return (
    <AppShell>
      <Head title="Settings" />
      <PageHeader
        title="Settings"
        description="Configure application-level settings and security options."
      />

      <div className="max-w-2xl space-y-6">
        {/* Security Section */}
        <div className="panel overflow-hidden">
          <div className="panel-header">
            <div className="panel-title">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings2 className="h-3.5 w-3.5 text-primary" />
              </div>
              Security Settings
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Login Alert Card */}
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-muted/30 to-transparent border-b border-border/40">
                <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4.5 w-4.5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Login Alert</div>
                  <div className="text-xs text-muted-foreground">Notify when an account is locked after 5 failed attempts</div>
                </div>
              </div>

              <div className="px-5 py-5 space-y-5">
                {/* Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Enable login alert emails</div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      When disabled, accounts lock normally but no email notification is sent.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnabled(!enabled)}
                    className={`relative h-6 w-11 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${enabled ? "bg-primary" : "bg-muted-foreground/30"}`}
                    role="switch"
                    aria-checked={enabled}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
                  </button>
                </div>

                {/* Email field */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70 flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5" /> Alert email address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@eskayef.com"
                    className="h-10"
                    disabled={!enabled}
                  />
                  <p className="text-xs text-muted-foreground">
                    This email receives the lockout notification with an unlock link.
                  </p>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end pt-2">
              <Button onClick={save} className="gap-2">
                <Save className="h-4 w-4" />
                Save settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
