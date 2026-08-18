import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Head, useForm } from "@inertiajs/react";
import { Eye, EyeOff, LogIn, ShieldCheck, Zap, Globe } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: ShieldCheck, title: "Secure Procurement", desc: "Role-based approval workflows with audit trails" },
  { icon: Zap, title: "ERP Integration", desc: "Seamless sync of PRs and POs from your ERP system" },
  { icon: Globe, title: "Vendor Portal", desc: "Invite vendors, receive bids, and award contracts" },
];

export default function Auth() {
  const signIn = useForm({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Head title="Sign in" />
      <div className="min-h-screen flex bg-background">
        {/* ─── Left Panel ─── */}
        <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden flex-col">
          {/* Background gradient */}
          <div className="absolute inset-0 gradient-hero" />
          {/* Pattern */}
          <div className="absolute inset-0 pattern-dots-light opacity-60" />
          {/* Radial glow */}
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-accent/20 blur-3xl" />
          {/* SKF background image overlay */}
          <div className="absolute inset-0 bg-[url('/images/skf.png')] bg-cover bg-center opacity-10 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-auto">
              <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center p-1.5 shadow-lg">
                <img src="/images/logo.png" alt="ETMS" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="text-lg font-bold text-white tracking-tight">ETMS</div>
                <div className="text-[11px] text-white/50 uppercase tracking-widest">Procurement</div>
              </div>
            </div>

            {/* Hero text */}
            <div className="mt-16 mb-12">
              <div className="inline-flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-widest mb-5 bg-white/10 border border-white/15 px-4 py-1.5 rounded-full backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
                Eskayef Pharmaceuticals Ltd.
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] text-white tracking-tight font-display">
                Enterprise
                <br />
                Procurement
                <br />
                <span className="text-accent/90">Management</span>
              </h1>
              <p className="mt-5 text-base text-white/60 leading-relaxed max-w-sm">
                Manage vendors, run tenders, evaluate bids, and push approved
                purchases back into your ERP—all in one platform.
              </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-3 mb-auto">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white/8 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <f.icon className="h-4 w-4 text-white/80" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/90">{f.title}</div>
                    <div className="text-xs text-white/50 mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 text-xs text-white/30">
              &copy; {new Date().getFullYear()} Designed &amp; Developed by{" "}
              <a
                href="https://synergyinterface.com/web/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
              >
                Synergy Interface Ltd
              </a>
              . All rights reserved.
            </div>
          </div>
        </div>

        {/* ─── Right Panel ─── */}
        <div className="flex-1 flex items-center justify-center p-6 bg-background relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03]" />
          <div className="absolute inset-0 pattern-dots opacity-[0.4]" />

          <div className="relative w-full max-w-[400px]">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5">
                <img src="/images/logo.png" alt="ETMS" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="text-base font-bold text-foreground">ETMS</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Procurement</div>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground tracking-tight font-display">
                Welcome back
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Sign in to access the procurement platform.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-elevated relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  signIn.post("/auth/login");
                }}
                className="space-y-5"
              >
                {/* Email */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="si-email"
                    className="text-xs font-semibold text-foreground/70 uppercase tracking-wide"
                  >
                    Email address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="si-email"
                    type="email"
                    required
                    value={signIn.data.email}
                    onChange={(e) => signIn.setData("email", e.target.value)}
                    placeholder="you@eskayef.com"
                    className={cn(
                      "h-11 bg-muted/30 border-border/60 focus:bg-background",
                      signIn.errors.email && "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                  {signIn.errors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <span>⚠</span> {signIn.errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="si-pwd"
                    className="text-xs font-semibold text-foreground/70 uppercase tracking-wide"
                  >
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="si-pwd"
                      type={showPassword ? "text" : "password"}
                      required
                      value={signIn.data.password}
                      onChange={(e) => signIn.setData("password", e.target.value)}
                      placeholder="••••••••••"
                      className={cn(
                        "h-11 bg-muted/30 border-border/60 pr-11 focus:bg-background",
                        signIn.errors.password && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {signIn.errors.password && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <span>⚠</span> {signIn.errors.password}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={signIn.processing}
                  className="w-full h-11 text-sm font-semibold mt-1"
                >
                  {signIn.processing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign in to ETMS
                    </span>
                  )}
                </Button>
              </form>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-muted-foreground/50">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Secure connection
              </span>
              <span className="h-3 w-px bg-border/50" />
              <span>Role-based access control</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
