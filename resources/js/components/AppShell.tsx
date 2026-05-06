import { ReactNode, useMemo } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
  LayoutDashboard, Users, FileStack, Gavel, FileText, LogOut, Boxes, ShieldCheck, Building2, Scale, Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppRole, PageSharedProps } from "@/lib/types";

interface NavItem { href: string; label: string; icon: ReactNode; roles: AppRole[]; }

const NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, roles: ["admin","procurement","approver","vendor"] },
  { href: "/app/vendor-categories", label: "Vendor Categories", icon: <Tag className="h-4 w-4" />, roles: ["admin","procurement","approver"] },
  { href: "/app/vendors", label: "Vendors", icon: <Building2 className="h-4 w-4" />, roles: ["admin","procurement","approver"] },
  { href: "/app/prs", label: "Purchase Requisitions", icon: <FileStack className="h-4 w-4" />, roles: ["admin","procurement","approver"] },
  { href: "/app/tenders", label: "Tenders", icon: <Gavel className="h-4 w-4" />, roles: ["admin","procurement","approver"] },
  { href: "/app/cs", label: "Comparative Statements", icon: <Scale className="h-4 w-4" />, roles: ["admin","procurement","approver"] },
  { href: "/app/my-tenders", label: "My Tenders", icon: <Gavel className="h-4 w-4" />, roles: ["vendor"] },
  { href: "/app/my-bids", label: "My Bids", icon: <FileText className="h-4 w-4" />, roles: ["vendor"] },
  { href: "/app/profile", label: "Vendor Profile", icon: <Boxes className="h-4 w-4" />, roles: ["vendor"] },
  { href: "/app/users", label: "Users & Roles", icon: <ShieldCheck className="h-4 w-4" />, roles: ["admin"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { props, url } = usePage<PageSharedProps>();
  const user = props.auth.user;
  const primary = user?.primary_role ?? null;

  const items = useMemo(() => {
    if (!primary) return [];
    return NAV.filter((n) => n.roles.includes(primary));
  }, [primary]);

  const signOut = () => router.post("/auth/logout");

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="px-4 py-4 border-b border-sidebar-border">
          <Link href="/app" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">E</div>
            <div>
              <div className="text-sm font-semibold leading-tight">ETMS</div>
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Procurement Suite</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Workspace</div>
          {items.map((it) => {
            const isActive = it.href === "/app" ? url === "/app" : url.startsWith(it.href);
            return (
              <Link key={it.href} href={it.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 mx-2 rounded text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}>
                {it.icon}{it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="text-xs text-sidebar-foreground/70 truncate">{user?.full_name || user?.email}</div>
          <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 mb-2">{primary}</div>
          <Button variant="ghost" size="sm" onClick={signOut}
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 border-b border-border bg-card flex items-center px-6 justify-between">
          <div className="text-sm text-muted-foreground">{breadcrumb(url)}</div>
          <div className="text-xs text-muted-foreground">
            <Users className="inline h-3.5 w-3.5 mr-1" />
            Logged in as <span className="text-foreground font-medium">{user?.full_name || user?.email}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}

function breadcrumb(path: string) {
  const parts = path.split("?")[0].split("/").filter(Boolean);
  if (parts.length <= 1) return "Dashboard";
  return parts.slice(1).map((p) => p.replace(/-/g, " ")).join(" / ");
}
