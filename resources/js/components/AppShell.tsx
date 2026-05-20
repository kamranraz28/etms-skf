import { ReactNode, useMemo, useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
  LayoutDashboard, Users, FileStack, Gavel, FileText, LogOut, Boxes, ShieldCheck, Building2, Scale, Tag, Receipt, ClipboardList, Menu, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppRole, PageSharedProps } from "@/lib/types";

interface NavItem { href: string; label: string; icon: ReactNode; roles: AppRole[]; }

const NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: <LayoutDashboard className="h-4.5 w-4.5" />, roles: ["admin","procurement","approver","vendor"] },
  { href: "/app/vendor-categories", label: "Vendor Categories", icon: <Tag className="h-4.5 w-4.5" />, roles: ["admin","procurement","approver"] },
  { href: "/app/vendors", label: "Vendors", icon: <Building2 className="h-4.5 w-4.5" />, roles: ["admin","procurement","approver"] },
  { href: "/app/prs", label: "Purchase Requisitions", icon: <FileStack className="h-4.5 w-4.5" />, roles: ["admin","procurement","approver"] },
  { href: "/app/tenders", label: "Tenders", icon: <Gavel className="h-4.5 w-4.5" />, roles: ["admin","procurement","approver"] },
  { href: "/app/cs", label: "Comparative Statements", icon: <Scale className="h-4.5 w-4.5" />, roles: ["admin","procurement","approver"] },
  { href: "/app/claims", label: "Claims", icon: <Receipt className="h-4.5 w-4.5" />, roles: ["procurement","approver"] },
  { href: "/app/claims/history", label: "Claim History", icon: <ClipboardList className="h-4.5 w-4.5" />, roles: ["admin"] },
  { href: "/app/my-tenders", label: "My Tenders", icon: <Gavel className="h-4.5 w-4.5" />, roles: ["vendor"] },
  { href: "/app/my-bids", label: "My Bids", icon: <FileText className="h-4.5 w-4.5" />, roles: ["vendor"] },
  { href: "/app/my-claims", label: "My Claims", icon: <Receipt className="h-4.5 w-4.5" />, roles: ["vendor"] },
  { href: "/app/profile", label: "Vendor Profile", icon: <Boxes className="h-4.5 w-4.5" />, roles: ["vendor"] },
  { href: "/app/users", label: "Users & Roles", icon: <ShieldCheck className="h-4.5 w-4.5" />, roles: ["admin"] },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { props, url } = usePage<PageSharedProps>();
  const user = props.auth.user;
  const primary = user?.primary_role ?? null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const items = useMemo(() => {
    if (!primary) return [];
    return NAV.filter((n) => n.roles.includes(primary));
  }, [primary]);

  const signOut = () => router.post("/auth/logout");

  const sidebar = (
    <aside className={cn(
      "h-full bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0 transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-60",
    )}>
      <div className={cn("px-4 py-4 border-b border-sidebar-border/50 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        <Link href="/app" className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm shadow-lg shadow-sidebar-primary/20 transition-transform duration-200 hover:scale-105">
            E
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-200">
              <div className="text-sm font-bold leading-tight">ETMS</div>
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Procurement Suite</div>
            </div>
          )}
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <div className="px-5 pb-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">Workspace</div>
        )}
        <div className="space-y-0.5 px-2">
          {items.map((it) => {
            const isActive = it.href === "/app" ? url === "/app" : url.startsWith(it.href);
            return (
              <Link key={it.href} href={it.href} onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground font-medium shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                )}>
                <span className={cn("shrink-0", isActive && "drop-shadow-sm")}>{it.icon}</span>
                {!collapsed && (
                  <span className="truncate">{it.label}</span>
                )}
                {isActive && !collapsed && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary animate-pulse-soft" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={cn("border-t border-sidebar-border/50 p-3", collapsed && "text-center")}>
        {!collapsed && (
          <>
            <div className="text-xs text-sidebar-foreground/60 truncate font-medium">{user?.full_name || user?.email}</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 mb-2">{primary}</div>
          </>
        )}
        <Button variant="ghost" size="sm" onClick={signOut}
          className={cn(
            "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors",
            collapsed ? "w-9 h-9 p-0 justify-center" : "w-full justify-start",
          )}>
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </Button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center h-8 border-t border-sidebar-border/30 text-sidebar-foreground/40 hover:text-sidebar-foreground/80 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-muted/30">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">{sidebar}</div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 animate-slide-in-left">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-4 md:px-6 justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground/80">
              <span className="hidden sm:inline text-muted-foreground/50">/</span>
              <span className="font-medium text-foreground/90 capitalize">{breadcrumb(url)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Users className="h-3.5 w-3.5" />
              <span className="text-muted-foreground/70">Logged in as</span>
              <span className="text-foreground font-semibold">{user?.full_name || user?.email}</span>
            </div>
            <div className="sm:hidden flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-full">
              <Users className="h-3 w-3" />
              <span className="font-medium text-foreground truncate max-w-[80px]">{user?.full_name || user?.email}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

function breadcrumb(path: string) {
  const parts = path.split("?")[0].split("/").filter(Boolean);
  if (parts.length <= 1) return "Dashboard";
  return parts.slice(1).map((p) => p.replace(/-/g, " ")).join(" / ");
}
