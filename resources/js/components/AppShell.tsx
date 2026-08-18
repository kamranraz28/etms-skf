
import { AppRole, PageSharedProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link, router, usePage } from "@inertiajs/react";
import {
    Boxes,
    Building2,
    ChevronDown,
    ChevronLeft,
    ClipboardList,
    FileStack,
    FileText,
    Gavel,
    LayoutDashboard,
    LogOut,
    Menu,
    Bell,
    Receipt,
    Scale,
    Settings,
    ShieldCheck,
    Tag,
    Users,
    Workflow,
    X,
    Moon,
    Sun,
    Search,
    ChevronRight,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles: AppRole[];
  group?: string;
}

const APPROVER_ROLES = ["admin", "procurement", "approver", "department_head", "executive_director", "counter_ed", "scm_head", "finance_head", "line_manager", "user", "unit_head", "scm_user"] as AppRole[];

const NAV: NavItem[] = [
  // Main
  { href: "/app", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, roles: [...APPROVER_ROLES, "vendor"], group: "main" },
  // Procurement
  { href: "/app/prs", label: "Purchase Requisitions", icon: <FileStack className="h-4 w-4" />, roles: APPROVER_ROLES, group: "procurement" },
  { href: "/app/pos", label: "Purchase Orders", icon: <ClipboardList className="h-4 w-4" />, roles: APPROVER_ROLES, group: "procurement" },
  { href: "/app/tenders", label: "Tenders", icon: <Gavel className="h-4 w-4" />, roles: APPROVER_ROLES, group: "procurement" },
  { href: "/app/cs", label: "Comparative Statements", icon: <Scale className="h-4 w-4" />, roles: APPROVER_ROLES, group: "procurement" },
  { href: "/app/claims", label: "Claims", icon: <Receipt className="h-4 w-4" />, roles: APPROVER_ROLES, group: "procurement" },
  // Master Data
  { href: "/app/vendors", label: "Vendors", icon: <Building2 className="h-4 w-4" />, roles: APPROVER_ROLES, group: "masterdata" },
  { href: "/app/vendor-categories", label: "Vendor Categories", icon: <Tag className="h-4 w-4" />, roles: APPROVER_ROLES, group: "masterdata" },
  // Vendor Portal
  { href: "/app", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, roles: ["vendor"], group: "portal" },
  { href: "/app/my-tenders", label: "My Tenders", icon: <Gavel className="h-4 w-4" />, roles: ["vendor"], group: "portal" },
  { href: "/app/my-bids", label: "My Bids", icon: <FileText className="h-4 w-4" />, roles: ["vendor"], group: "portal" },
  { href: "/app/my-claims", label: "My Claims", icon: <Receipt className="h-4 w-4" />, roles: ["vendor"], group: "portal" },
  { href: "/app/profile", label: "Vendor Profile", icon: <Boxes className="h-4 w-4" />, roles: ["vendor"], group: "portal" },
  // Admin
  { href: "/app/users", label: "Users & Roles", icon: <ShieldCheck className="h-4 w-4" />, roles: ["admin"], group: "admin" },
  { href: "/app/workflow-types", label: "Workflow Types", icon: <Workflow className="h-4 w-4" />, roles: ["admin"], group: "admin" },
  { href: "/app/settings", label: "Settings", icon: <Settings className="h-4 w-4" />, roles: ["admin"], group: "admin" },
];

const GROUP_LABELS: Record<string, string> = {
  main: "",
  procurement: "Procurement",
  masterdata: "Master Data",
  portal: "Vendor Portal",
  admin: "Administration",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return [dark, setDark] as const;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { props, url } = usePage<PageSharedProps>();
  const user = props.auth.user;
  const primary = user?.primary_role ?? null;
  const notifications = props.notifications ?? [];
  const unreadCount = props.unread_notifications ?? 0;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [dark, setDark] = useDarkMode();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setUserMenuOpen(false);
        setBellOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    if (userMenuOpen || bellOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen, bellOpen]);

  const openNotification = (n: any) => {
    if (!n.read_at) {
      router.post(`/app/notifications/${n.id}/read`, {}, {
        preserveScroll: false,
        onSuccess: () => {
          setBellOpen(false);
          if (n.data?.url) router.visit(n.data.url);
        },
      });
    } else {
      setBellOpen(false);
      if (n.data?.url) router.visit(n.data.url);
    }
  };

  const markAllRead = () => {
    router.post("/app/notifications/read-all", {}, { preserveScroll: true, onSuccess: () => setBellOpen(false) });
  };

  const items = useMemo(() => {
    if (!primary) return [];
    return NAV.filter((n) => n.roles.includes(primary));
  }, [primary]);

  // Group items
  const grouped = useMemo(() => {
    const groups: Record<string, NavItem[]> = {};
    items.forEach((item) => {
      const g = item.group ?? "main";
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });
    return groups;
  }, [items]);

  const signOut = () => router.post("/auth/logout");

  const avatarColors = [
    "from-primary/80 to-accent/80",
    "from-accent/80 to-success/80",
    "from-success/80 to-info/80",
  ];
  const avatarGradient = avatarColors[((user?.full_name?.charCodeAt(0) ?? 0) % avatarColors.length)];

  const breadcrumbParts = useMemo(() => {
    const parts = url.split("?")[0].split("/").filter(Boolean).slice(1);
    return parts.map((p, i) => ({
      label: p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      href: "/" + ["app", ...parts.slice(0, i + 1)].join("/"),
    }));
  }, [url]);

  const sidebar = (
    <aside
      className={cn(
        "relative h-full flex flex-col shrink-0 overflow-hidden",
        "bg-sidebar transition-[width] duration-300 ease-out-quart",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/10 pointer-events-none" />
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{backgroundImage: "radial-gradient(hsl(0 0% 100%) 1px, transparent 1px)", backgroundSize: "20px 20px"}}
      />

      <div className="flex flex-col h-full relative z-[1]">
        {/* Logo area */}
        <div
          className={cn(
            "h-16 flex items-center shrink-0 border-b border-sidebar-border/50",
            collapsed ? "justify-center px-4" : "px-5 justify-between",
          )}
        >
          <Link href="/app" className="flex items-center gap-3 group overflow-hidden min-w-0">
            <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 shrink-0 overflow-hidden p-0.5">
              <img src="/images/logo.png" alt="ETMS" className="h-full w-full object-contain" />
            </div>
            <div className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-300",
              collapsed ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100",
            )}>
              <div className="text-sm font-bold text-sidebar-foreground leading-tight tracking-tight">ETMS</div>
              <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/35 font-medium">Procurement</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className={cn("lg:hidden text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors", collapsed && "hidden")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar py-3 px-2.5 space-y-4">
          {Object.entries(grouped).map(([group, groupItems]) => (
            <div key={group}>
              {GROUP_LABELS[group] && !collapsed && (
                <div className="sidebar-section-label mb-1.5 mt-1 pl-1">
                  {GROUP_LABELS[group]}
                </div>
              )}
              {collapsed && GROUP_LABELS[group] && (
                <div className="h-px bg-sidebar-border/40 mb-2 mx-1" />
              )}
              <div className="space-y-0.5">
                {groupItems.map((it, idx) => {
                  const isActive =
                    it.href === "/app" ? url === "/app" : url.startsWith(it.href);
                  return (
                    <Link
                      key={`${it.href}-${idx}`}
                      href={it.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "sidebar-item group/item animate-nav-item-in px-2.5 py-2",
                        collapsed ? "justify-center" : "gap-3",
                        isActive
                          ? "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/50 text-sidebar-foreground shadow-sm"
                          : "text-sidebar-foreground/55 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/90",
                      )}
                      style={{ animationDelay: `${idx * 0.04}s`, opacity: "0" }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-sidebar-primary shadow-sm" />
                      )}

                      {/* Icon */}
                      <span className={cn(
                        "shrink-0 z-10 transition-all duration-200",
                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover/item:text-sidebar-foreground/80",
                      )}>
                        {it.icon}
                      </span>

                      {/* Label */}
                      <span className={cn(
                        "truncate text-xs font-medium z-10 transition-all duration-300",
                        collapsed ? "max-w-0 opacity-0 w-0" : "max-w-[150px] opacity-100",
                        isActive && "text-sidebar-foreground font-semibold",
                      )}>
                        {it.label}
                      </span>

                      {/* Active dot */}
                      {isActive && !collapsed && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary shrink-0 z-10 animate-pulse-soft" />
                      )}

                      {/* Tooltip (collapsed state) */}
                      {collapsed && (
                        <div className={cn(
                          "absolute left-full ml-3 px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-50",
                          "pointer-events-none border border-sidebar-border/40 text-xs font-medium",
                          "bg-sidebar-accent/90 backdrop-blur-md text-sidebar-foreground",
                          "opacity-0 invisible translate-x-0",
                          "group-hover/item:opacity-100 group-hover/item:visible group-hover/item:translate-x-0",
                          "transition-all duration-200 ease-out",
                        )}>
                          {it.label}
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-0 h-0 border-y-4 border-y-transparent border-r-4 border-r-sidebar-accent/90" />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className={cn(
          "border-t border-sidebar-border/40 p-3 shrink-0",
        )}>
          <div className={cn(
            "flex items-center gap-2.5 rounded-xl p-2 transition-all duration-200 hover:bg-sidebar-accent/40 cursor-default",
            collapsed && "justify-center",
          )}>
            {/* Avatar */}
            <div className={cn(
              "h-7 w-7 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold text-white shadow-md",
              `bg-gradient-to-br ${avatarGradient}`,
            )}>
              {getInitials(user?.full_name || user?.email || "U")}
            </div>
            <div className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-300 min-w-0 flex-1",
              collapsed ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100",
            )}>
              <div className="text-xs font-semibold text-sidebar-foreground/80 truncate">
                {user?.full_name || user?.email}
              </div>
              <div className="text-[10px] text-sidebar-foreground/35 capitalize truncate">
                {primary?.replace(/_/g, " ")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "hidden lg:flex absolute -right-3.5 top-[72px] z-40",
          "h-7 w-7 items-center justify-center rounded-full",
          "bg-card border border-border/60 text-muted-foreground/50",
          "shadow-md hover:shadow-lg hover:text-primary hover:border-primary/30",
          "transition-all duration-200 hover:scale-110",
        )}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform duration-300", collapsed && "rotate-180")} />
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex border-r border-sidebar-border/60">{sidebar}</div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 animate-slide-in-left border-r border-sidebar-border/60">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border/50 bg-card/90 backdrop-blur-xl sticky top-0 z-30 flex items-center px-4 md:px-6 gap-4 shadow-sm">
          {/* Left side */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors tap-feedback"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs overflow-hidden">
              <Link href="/app" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0">
                ETMS
              </Link>
              {breadcrumbParts.map((part, i) => (
                <span key={i} className="flex items-center gap-1.5 min-w-0">
                  <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  {i === breadcrumbParts.length - 1 ? (
                    <span className="font-semibold text-foreground/90 capitalize truncate">{part.label}</span>
                  ) : (
                    <Link href={part.href} className="text-muted-foreground/60 hover:text-foreground transition-colors capitalize truncate">
                      {part.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>

            {/* Mobile page title */}
            <span className="sm:hidden text-sm font-semibold text-foreground capitalize truncate">
              {breadcrumbParts[breadcrumbParts.length - 1]?.label || "Dashboard"}
            </span>
          </div>

          {/* Right side — controls */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 transition-all duration-200 hover:scale-105"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setBellOpen(!bellOpen)}
                className="relative h-8 w-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/40 transition-all duration-200 hover:scale-105"
                title="Notifications"
              >
                <Bell className="h-3.5 w-3.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center animate-bounce-soft">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-84 bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden animate-scale-in origin-top-right"
                  style={{ width: "340px" }}
                >
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 bg-gradient-to-r from-card to-muted/20">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary hover:text-primary/70 font-medium transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/20">
                    {notifications.length === 0 && (
                      <div className="flex flex-col items-center py-10 px-4 text-center">
                        <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center mb-3">
                          <Bell className="h-5 w-5 text-muted-foreground/30" />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">No notifications yet</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-1">You're all caught up!</p>
                      </div>
                    )}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => openNotification(n)}
                        className={`w-full text-left px-5 py-3.5 hover:bg-muted/30 transition-colors group ${!n.read_at ? "bg-primary/[0.025]" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "h-2 w-2 rounded-full shrink-0 mt-1.5",
                            !n.read_at ? "bg-primary animate-pulse-soft" : "bg-muted-foreground/20",
                          )} />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{n.data?.title ?? "Notification"}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.data?.message}</div>
                            <div className="text-[10px] text-muted-foreground/50 mt-1.5">
                              {new Date(n.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 h-8 rounded-xl px-2.5 border border-border/40 bg-muted/30 hover:bg-muted/60 hover:border-primary/25 transition-all duration-200 group"
              >
                <div className={cn(
                  "h-5 w-5 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shadow-sm shrink-0",
                  `bg-gradient-to-br ${avatarGradient}`,
                )}>
                  {getInitials(user?.full_name || user?.email || "U")}
                </div>
                <span className="hidden sm:block text-xs font-medium text-foreground/80 max-w-[100px] truncate">
                  {user?.full_name || user?.email}
                </span>
                <ChevronDown className={cn(
                  "h-3 w-3 text-muted-foreground/60 hidden sm:block transition-transform duration-200",
                  userMenuOpen && "rotate-180",
                )} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 min-w-[220px] bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden animate-scale-in origin-top-right">
                  {/* User info header */}
                  <div className="px-5 py-4 border-b border-border/40 bg-gradient-to-br from-primary/5 to-accent/5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md",
                        `bg-gradient-to-br ${avatarGradient}`,
                      )}>
                        {getInitials(user?.full_name || user?.email || "U")}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">{user?.full_name || user?.email}</div>
                        <div className="text-xs text-muted-foreground capitalize">{primary?.replace(/_/g, " ")}</div>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-150 group"
                    >
                      <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
