import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Head, Link, useForm } from "@inertiajs/react";
import { Building2 } from "lucide-react";

export default function Auth() {
  const signIn = useForm({ email: "", password: "" });

  return (
    <>
      <Head title="Sign in" />
      <div className="min-h-screen grid lg:grid-cols-2 bg-background">
        <div className="hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
              E
            </div>
            <div>
              <div className="text-lg font-semibold">ETMS</div>
              <div className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
                E-Tender & Vendor Management
              </div>
            </div>
          </div>
          <div className="space-y-4 max-w-md">
            <h1 className="text-3xl font-semibold leading-tight">
              Enterprise Procure-to-Pay,
              <br />
              engineered for ERP.
            </h1>
            <p className="text-sm text-sidebar-foreground/70">
              Manage vendors, run tenders, evaluate bids, and push approved
              purchases back into your ERP — all from one audit-ready workspace.
            </p>
            <ul className="text-sm text-sidebar-foreground/80 space-y-2 pt-2">
              <li className="flex gap-2">
                <Building2 className="h-4 w-4 mt-0.5 text-sidebar-primary" />{" "}
                Vendor lifecycle with ERP code mapping
              </li>
              <li className="flex gap-2">
                <Building2 className="h-4 w-4 mt-0.5 text-sidebar-primary" />{" "}
                Mock ERP PR sync, ready to wire to SAP/Oracle
              </li>
              <li className="flex gap-2">
                <Building2 className="h-4 w-4 mt-0.5 text-sidebar-primary" />{" "}
                Sealed bidding with deadline enforcement
              </li>
            </ul>
          </div>
          <div className="text-xs text-sidebar-foreground/50">
            © ETMS Procurement Suite
          </div>
        </div>

        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-md panel p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Welcome back</h2>
              <p className="text-sm text-muted-foreground">
                Sign in to continue, or create a new account.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                signIn.post("/auth/login");
              }}
              className="space-y-3 mt-4"
            >
              <div>
                <Label htmlFor="si-email">Email</Label>
                <Input
                  id="si-email"
                  type="email"
                  required
                  value={signIn.data.email}
                  onChange={(e) => signIn.setData("email", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="si-pwd">Password</Label>
                <Input
                  id="si-pwd"
                  type="password"
                  required
                  value={signIn.data.password}
                  onChange={(e) => signIn.setData("password", e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={signIn.processing}
                className="w-full"
              >
                {signIn.processing ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 text-center text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
