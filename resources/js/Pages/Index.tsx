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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-[#0a2942] text-white">
          <div className="container flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="text-xl font-bold tracking-tight">
                SK<span className="text-[#e31e24]">+</span>F
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <div className="text-sm font-semibold leading-tight">ETMS</div>
                <div className="text-[10px] uppercase tracking-wider text-white/60">
                  E-Tender & Vendor Management
                </div>
              </div>
            </Link>
            <Link href="/auth">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-[#0a2942] border-white hover:bg-[#0a2942] hover:text-white"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="bg-[#0a2942] text-white">
          <div className="container py-24 md:py-32">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-[#e31e24] font-semibold text-sm uppercase tracking-wider mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e31e24]" />
                Eskayef Pharmaceuticals Ltd.
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white">
                E-Tender &<br />
                Vendor Management
              </h1>
              <p className="mt-4 text-lg text-white/70 max-w-xl">
                Enterprise Procure-to-Pay, engineered for ERP. Manage vendors,
                run tenders, evaluate bids, and push approved purchases back
                into your ERP.
              </p>
              <p className="mt-2 text-sm text-white/50 italic">
                Excellence through Quality
              </p>
              <div className="mt-8 flex gap-3">
                <Link href="/auth">
                  <Button className="bg-[#e31e24] hover:bg-[#c41a20] text-white">
                    Sign in <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-[#0a2942]">Key Modules</h2>
              <p className="text-sm text-gray-500 mt-2">
                End-to-end procurement digitization for Eskayef
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div
                  key={m.title}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="h-10 w-10 rounded-lg bg-[#e31e24]/10 flex items-center justify-center mb-4">
                    <m.icon className="h-5 w-5 text-[#e31e24]" />
                  </div>
                  <div className="font-semibold text-sm text-[#0a2942]">
                    {m.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {m.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-[#0a2942] text-white">
          <div className="container text-center">
            <h2 className="text-2xl font-bold text-white">
              Excellence Through Quality
            </h2>
            <p className="text-white/60 mt-2 max-w-xl mx-auto text-sm">
              Ethical practices in every step of operation following the vision
              of our Founder Chairman.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
              {[
                { num: "500+", label: "Active Vendors" },
                { num: "1,200+", label: "Tenders Processed" },
                { num: "99.9%", label: "Uptime" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center border border-white/10 rounded-lg p-8"
                >
                  <div className="text-3xl font-bold text-[#e31e24]">
                    {s.num}
                  </div>
                  <div className="text-sm text-white/60 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#051c2e] text-white/50 py-8 text-center text-xs border-t border-white/5">
          <div className="container">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm font-bold text-white">
                SK<span className="text-[#e31e24]">+</span>F
              </span>
              <span className="text-white/30">|</span>
              <span>Eskayef Pharmaceuticals Ltd.</span>
            </div>
            <p>Excellence through Quality &mdash; ETMS Procurement Suite</p>
            <p className="mt-1">
              &copy; {new Date().getFullYear()} Eskayef Pharmaceuticals Limited.
              All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
