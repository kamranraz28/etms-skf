import { Button } from "@/components/ui/button";
import { Head, Link } from "@inertiajs/react";
import {
  ArrowRight,
  Building2,
  FileStack,
  Gavel,
  ShieldCheck,
} from "lucide-react";

export default function Index() {
  return (
    <>
      <Head title="" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
                E
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">ETMS</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Procurement Suite
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="sm">
                  Get started <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="container py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted px-2 py-0.5 text-xs uppercase tracking-wider text-muted-foreground mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              ERP-integrated · Production-ready foundation
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              E-Tender & Vendor Management
            </h1>
            <div className="mt-6 flex gap-3">
              <Link href="/auth">
                <Button size="lg">
                  Open the workspace <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline">
                  Vendor self-registration
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Building2,
                title: "Vendor Management",
                desc: "Lifecycle from registration to ERP code mapping. Active / Inactive / Blacklisted.",
              },
              {
                icon: FileStack,
                title: "PR Sync",
                desc: "Mock ERP feed; convert requisitions into tenders in one click.",
              },
              {
                icon: Gavel,
                title: "Tender & Bidding",
                desc: "Invite vendors, enforce deadlines, collect priced bids with documents.",
              },
              {
                icon: ShieldCheck,
                title: "Role Separation",
                desc: "Hardened policies — admins, procurement, approvers and vendors see only what they should.",
              },
            ].map((m) => (
              <div key={m.title} className="panel p-4">
                <m.icon className="h-5 w-5 text-accent mb-3" />
                <div className="font-semibold text-sm">{m.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {m.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
          ©2026- Synergy Interface Ltd | All rights reserved.
        </footer>
      </div>
    </>
  );
}
