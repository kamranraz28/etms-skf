
import { AppRole, PageSharedProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link, router, usePage } from "@inertiajs/react";
import {
    Boxes,
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileStack,
    FileText,
    Gavel,
    LayoutDashboard,
    LogOut,
    Menu,
    Receipt,
    Scale,
    Settings,
    ShieldCheck,
    Tag,
    Users,
    Workflow,
    X,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles: AppRole[];
}

const APPROVER_ROLES = ["admin", "procurement", "approver", "department_head", "executive_director", "counter_ed", "scm_head", "finance_head", "line_manager"];

const NAV: NavItem[] = [
  {
    href: "/app",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4.5 w-4.5" />,
    roles: [...APPROVER_ROLES, "vendor"],
  },
  {
    href: "/app/vendor-categories",
    label: "Vendor Categories",
    icon: <Tag className="h-4.5 w-4.5" />,
    roles: APPROVER_ROLES,
  },
  {
    href: "/app/vendors",
    label: "Vendors",
    icon: <Building2 className="h-4.5 w-4.5" />,
    roles: APPROVER_ROLES,
  },
  {
    href: "/app/prs",
    label: "Purchase Requisitions",
    icon: <FileStack className="h-4.5 w-4.5" />,
    roles: APPROVER_ROLES,
  },
  {
    href: "/app/pos",
    label: "Purchase Orders",
    icon: <ClipboardList className="h-4.5 w-4.5" />,
    roles: APPROVER_ROLES,
  },
  {
    href: "/app/tenders",
    label: "Tenders",
    icon: <Gavel className="h-4.5 w-4.5" />,
    roles: APPROVER_ROLES,
  },
  {
    href: "/app/cs",
    label: "Comparative Statements",
    icon: <Scale className="h-4.5 w-4.5" />,
    roles: APPROVER_ROLES,
  },
  {
    href: "/app/claims",
    label: "Claims",
    icon: <Receipt className="h-4.5 w-4.5" />,
    roles: APPROVER_ROLES,
  },
  {
    href: "/app/claims/history",
    label: "Claim History",
    icon: <ClipboardList className="h-4.5 w-4.5" />,
    roles: ["admin"],
  },
  {
    href: "/app/my-tenders",
    label: "My Tenders",
    icon: <Gavel className="h-4.5 w-4.5" />,
    roles: ["vendor"],
  },
  {
    href: "/app/my-bids",
    label: "My Bids",
    icon: <FileText className="h-4.5 w-4.5" />,
    roles: ["vendor"],
  },
  {
    href: "/app/my-claims",
    label: "My Claims",
    icon: <Receipt className="h-4.5 w-4.5" />,
    roles: ["vendor"],
  },
  {
    href: "/app/profile",
    label: "Vendor Profile",
    icon: <Boxes className="h-4.5 w-4.5" />,
    roles: ["vendor"],
  },
  {
    href: "/app/users",
    label: "Users & Roles",
    icon: <ShieldCheck className="h-4.5 w-4.5" />,
    roles: ["admin"],
  },
  {
    href: "/app/settings",
    label: "Settings",
    icon: <Settings className="h-4.5 w-4.5" />,
    roles: ["admin"],
  },
  {
    href: "/app/workflow-types",
    label: "Workflow Types",
    icon: <Workflow className="h-4.5 w-4.5" />,
    roles: ["admin"],
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { props, url } = usePage<PageSharedProps>();
  const user = props.auth.user;
  const primary = user?.primary_role ?? null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const items = useMemo(() => {
    if (!primary) return [];
    return NAV.filter((n) => n.roles.includes(primary));
  }, [primary]);

  const signOut = () => router.post("/auth/logout");

  const sidebar = (
    <aside
      className={cn(
        "relative h-full bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div
          className={cn(
            "px-4 py-4 border-b border-sidebar-border/50 flex items-center shrink-0 overflow-hidden",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <Link
            href="/app"
            className="flex items-center gap-2.5 hover-scale group overflow-hidden"
          >
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-lg shadow-sidebar-primary/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-sidebar-primary/30 group-hover:scale-110 p-0.5 shrink-0">
              <img src="/images/logo.png" alt="ETMS" className="h-full w-full object-contain" />
            </div>
            <div className={cn(
              "transition-all duration-300 overflow-hidden whitespace-nowrap",
              collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100",
            )}>
              <div className="text-sm font-bold leading-tight">ETMS</div>
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
                Procurement Suite
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground transition-all duration-200 hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden no-scrollbar">
          <div className={cn(
            "px-5 pb-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold transition-all duration-300 overflow-hidden whitespace-nowrap",
            collapsed ? "max-h-0 opacity-0 py-0" : "max-h-8 opacity-100",
          )}>
            Workspace
          </div>
          <div className="space-y-0.5 px-2">
            {items.map((it, idx) => {
              const isActive =
                it.href === "/app" ? url === "/app" : url.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "nav-item sidebar-item relative group/item",
                    collapsed ? "justify-center px-2" : "px-3",
                    isActive
                      ? "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/80 text-sidebar-accent-foreground font-medium shadow-md"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                  style={{
                    animationDelay: `${idx * 0.05}s`,
                  }}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-sidebar-primary shadow-md shadow-sidebar-primary/50" />
                  )}
                  <span
                    className={cn(
                      "shrink-0 transition-all duration-300 z-10",
                      isActive && "drop-shadow-sm scale-110",
                    )}
                  >
                    {it.icon}
                  </span>
                  <span className={cn(
                    "truncate transition-all duration-300 overflow-hidden whitespace-nowrap z-10",
                    collapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[200px] opacity-100 ml-2",
                  )}>
                    {it.label}
                  </span>
                  {isActive && (
                    <span className={cn(
                      "ml-auto h-2 w-2 rounded-full bg-sidebar-primary animate-pulse-soft shadow-lg shadow-sidebar-primary/50 shrink-0 z-10 transition-all duration-300",
                      collapsed ? "absolute -top-0.5 -right-0.5" : "",
                    )} />
                  )}
                  <div className={cn(
                    "absolute left-full ml-2 px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50 pointer-events-none border border-sidebar-border/50",
                    "bg-sidebar text-sidebar-foreground text-xs font-medium",
                    "transition-all duration-200",
                    "opacity-0 invisible -translate-x-1",
                    "group-hover/item:opacity-100 group-hover/item:visible group-hover/item:translate-x-0",
                    collapsed ? "block" : "hidden",
                  )}>
                    {it.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        <div
          className={cn(
            "border-t border-sidebar-border/50 p-3 shrink-0 overflow-hidden",
            collapsed && "text-center",
          )}
        >
          <div className={cn(
            "transition-all duration-300 overflow-hidden whitespace-nowrap",
            collapsed ? "max-h-0 opacity-0" : "max-h-12 opacity-100",
          )}>
            <div className="text-xs text-sidebar-foreground/60 truncate font-medium">
              {user?.full_name || user?.email}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40">
              {primary}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-40 h-6 w-6 items-center justify-center rounded-full bg-sidebar border border-sidebar-border text-sidebar-foreground/60 shadow-md hover:shadow-lg hover:text-sidebar-foreground hover:border-sidebar-primary/30 transition-all duration-200 hover:scale-110"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-muted/30">
      <div className="hidden lg:flex">{sidebar}</div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 animate-slide-in-left">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        <header className="h-14 border-b border-border/60 bg-card/80 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-6 justify-between gap-2 shadow-sm smooth-transition hover:shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 tap-feedback"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground/80">
              <span className="hidden sm:inline text-muted-foreground/50">
                /
              </span>
              <span className="font-medium text-foreground/90 capitalize animate-fade-in">
                {breadcrumb(url)}
              </span>
            </div>
          </div>
          <div className="relative flex items-center gap-3" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-gradient-to-r from-muted/50 to-muted/30 px-3 py-1.5 rounded-full border border-border/40 smooth-transition hover:border-primary/30 hover:bg-muted/60 group cursor-pointer"
            >
              <Users className="h-3.5 w-3.5 animate-pulse-soft" />
              <span className="text-muted-foreground/70">Logged in as</span>
              <span className="text-foreground font-semibold">
                {user?.full_name || user?.email}
              </span>
              <ChevronDown className={cn(
                "h-3 w-3 text-muted-foreground/50 transition-transform duration-200",
                userMenuOpen && "rotate-180",
              )} />
            </button>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="sm:hidden flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-full border border-border/30 cursor-pointer"
            >
              <Users className="h-3 w-3" />
              <span className="font-medium text-foreground truncate max-w-[80px]">
                {user?.full_name || user?.email}
              </span>
              <ChevronDown className={cn(
                "h-2.5 w-2.5 text-muted-foreground/50 transition-transform duration-200",
                userMenuOpen && "rotate-180",
              )} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 min-w-[200px] bg-card border border-border/60 rounded-xl shadow-lg overflow-hidden animate-scale-in origin-top-right">
                <div className="px-4 py-3 border-b border-border/40">
                  <div className="text-sm font-medium text-foreground">
                    {user?.full_name || user?.email}
                  </div>
                  <div className="text-xs text-muted-foreground/70 capitalize">
                    {primary}
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
                >
                  <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
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
  return parts
    .slice(1)
    .map((p) => p.replace(/-/g, " "))
    .join(" / ");
}
