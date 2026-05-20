import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Head, Link, useForm } from "@inertiajs/react";
import { LogIn, ArrowLeft } from "lucide-react";

export default function Auth() {
  const signIn = useForm({ email: "", password: "" });

  return (
    <>
      <Head title="Sign in" />
      <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90">
          <div className="absolute inset-0 bg-[url('/images/skf.png')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="relative z-10 flex flex-col justify-between p-12 text-white">
            <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold">E</div>
                <div>
                  <div className="text-xl font-bold">ETMS</div>
                  <div className="text-xs uppercase tracking-wider text-white/60">E-Tender & Vendor Management</div>
                </div>
              </div>
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 text-white/80 font-semibold text-sm uppercase tracking-wider mb-4 bg-white/10 px-3 py-1.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Eskayef Pharmaceuticals Ltd.
                </div>
                <h1 className="text-4xl font-bold leading-tight text-white">
                  Enterprise Procurement<br />Management System
                </h1>
                <p className="mt-4 text-lg text-white/70">
                  Manage vendors, run tenders, evaluate bids, and push approved purchases back into your ERP.
                </p>
              </div>
            </div>
            <div className="text-sm text-white/40">
              Excellence through Quality — Procurement Suite
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg shadow-primary/20">
                E
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to continue to ETMS.</p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-elevated">
              <form onSubmit={(e) => { e.preventDefault(); signIn.post("/auth/login"); }} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" required value={signIn.data.email} onChange={(e) => signIn.setData("email", e.target.value)} placeholder="you@eskayef.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="si-pwd">Password</Label>
                  <Input id="si-pwd" type="password" required value={signIn.data.password} onChange={(e) => signIn.setData("password", e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" disabled={signIn.processing} className="w-full h-11 text-base">
                  {signIn.processing ? (
                    <span className="flex items-center gap-2"><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in…</span>
                  ) : (
                    <span className="flex items-center gap-2"><LogIn className="h-4 w-4" /> Sign in</span>
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-3 w-3" /> Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
