import { Button } from "@/components/ui/button";
import { Head, Link } from "@inertiajs/react";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function Index() {
  return (
    <>
      <Head title="" />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Header */}
        <header className="bg-[#0a2942] text-white sticky top-0 z-50 shadow-lg">
          <div className="container flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="text-xl font-bold tracking-tight">
                SK<span className="text-[#e31e24]">+</span>F
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <div className="text-sm font-bold leading-tight">ETMS</div>
                <div className="text-[10px] uppercase tracking-wider text-white/60">
                  E-Tender & Vendor Management
                </div>
              </div>
            </Link>
            <Link href="/auth">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white hover:text-[#0a2942] transition-all duration-200 backdrop-blur-sm"
              >
                Sign in
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="bg-[#0a2942] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a2942] via-[#0d3555] to-[#0a2942]" />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
            <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-20 right-40 w-48 h-48 rounded-full bg-[#e31e24] blur-3xl" />
          </div>
          <div className="container py-24 md:py-32 relative z-10">
            <div className="max-w-3xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 text-[#e31e24] font-semibold text-sm uppercase tracking-wider mb-4 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e31e24] animate-pulse-soft" />
                Eskayef Pharmaceuticals Ltd.
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white">
                E-Tender &<br />
                Vendor Management
              </h1>
              <p className="mt-4 text-lg text-white/70 max-w-xl leading-relaxed">
                Enterprise Procure-to-Pay, engineered for ERP. Manage vendors,
                run tenders, evaluate bids, and push approved purchases back
                into your ERP.
              </p>
              <p className="mt-2 text-sm text-white/50 italic">
                Excellence through Quality
              </p>
              <div className="mt-8 flex gap-3">
                <Link href="/auth">
                  <Button className="bg-[#e31e24] hover:bg-[#c41a20] text-white shadow-lg shadow-[#e31e24]/30 hover:shadow-xl hover:shadow-[#e31e24]/40 transition-all duration-200">
                    Sign in <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container text-center">
            <h2 className="text-2xl font-bold text-[#0a2942] tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Sign in to access the full procurement management suite.
            </p>
            <div className="mt-8">
              <Link href="/auth">
                <Button className="bg-[#e31e24] hover:bg-[#c41a20] text-white shadow-lg shadow-[#e31e24]/30 hover:shadow-xl hover:shadow-[#e31e24]/40 transition-all duration-200">
                  Sign in to ETMS <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#051c2e] text-white/50 py-10 text-center text-xs border-t border-white/5">
          <div className="container">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm font-bold text-white">
                SK<span className="text-[#e31e24]">+</span>F
              </span>
              <span className="text-white/30">|</span>
              <span>Eskayef Pharmaceuticals Ltd.</span>
            </div>
            <p>Excellence through Quality — ETMS Procurement Suite</p>
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
