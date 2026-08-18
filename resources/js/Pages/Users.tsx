import { router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { AppRole } from "@/lib/types";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { ShieldCheck, Users as UsersIcon, Mail, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL: AppRole[] = [
  "admin", "procurement", "approver", "vendor", "department_head",
  "executive_director", "counter_ed", "scm_head", "finance_head", "line_manager"
];

const roleStyles: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white",
  procurement: "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white",
  approver: "bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-white",
  vendor: "bg-muted text-muted-foreground border-border/80 hover:bg-muted-foreground hover:text-white",
  department_head: "bg-info/10 text-info border-info/20 hover:bg-info hover:text-white",
  executive_director: "bg-success/10 text-success border-success/20 hover:bg-success hover:text-white",
  counter_ed: "bg-success/10 text-success border-success/20 hover:bg-success hover:text-white",
  scm_head: "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white",
  finance_head: "bg-warning/10 text-warning border-warning/20 hover:bg-warning hover:text-white",
  line_manager: "bg-info/10 text-info border-info/20 hover:bg-info hover:text-white",
};

export default function Users({ rows }: any) {
  const sa = useSweetAlert();
  const toggle = (uid: string, r: AppRole) => sa.confirmAction("Toggle role?", `Change this user's assignment for '${r.replace(/_/g, " ")}'?`, "Toggle").then(ok => { if (ok) router.post(`/app/users/${uid}/roles/${r}`); });

  const columns: Column[] = [
    {
      key: "full_name",
      label: "User Profile",
      sortable: true,
      render: (r: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center font-bold text-sm text-primary shrink-0">
            {r.full_name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">{r.full_name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3" /> {r.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: "roles",
      label: "System Roles Assignment Matrix",
      sortable: false,
      exportable: false,
      render: (r: any) => (
        <div className="flex flex-wrap gap-1.5 max-w-xl">
          {ALL.map((role) => {
            const has = r.roles.includes(role);
            const activeStyle = roleStyles[role] || "bg-muted text-muted-foreground border-border/80";
            return (
              <button
                key={role}
                onClick={(e) => { e.stopPropagation(); toggle(r.id, role); }}
                className={cn(
                  "px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all duration-150",
                  has 
                    ? activeStyle 
                    : "bg-background border-border/60 text-muted-foreground/60 hover:border-primary/40 hover:text-foreground"
                )}
              >
                {role.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <Head title="Users & Roles" />
      <PageHeader title="Users & Roles" description="Control system access and assign specialized workspace roles to administrative and vendor accounts." />
      
      <div className="bg-warning/[0.03] border border-warning/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-xs text-warning-foreground font-medium leading-relaxed">
          <strong>Important security advisory:</strong> Modifying user role permissions affects access restrictions instantly. Toggle role states carefully to preserve functional workflows and approvals.
        </div>
      </div>

      <DataTable columns={columns} data={rows} exportFilename="users-roles" emptyMessage="No user registrations found." searchPlaceholder="Search users..." />
      {sa.SweetAlert}
    </AppShell>
  );
}
