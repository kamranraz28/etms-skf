import { router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { AppRole } from "@/lib/types";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { ShieldCheck, Users as UsersIcon } from "lucide-react";

const ALL: AppRole[] = ["admin","procurement","approver","vendor"];

export default function Users({ rows }: any) {
  const sa = useSweetAlert();
  const toggle = (uid: string, r: AppRole) => sa.confirmAction("Toggle role?", "Change this user's role?", "Toggle").then(ok => { if (ok) router.post(`/app/users/${uid}/roles/${r}`); });

  const columns: Column[] = [
    { key: "full_name", label: "User", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "roles",
      label: "Roles",
      sortable: false,
      exportable: false,
      render: (r: any) => (
        <div className="flex flex-wrap gap-1.5">
          {ALL.map((role) => {
            const has = r.roles.includes(role);
            return (
              <Button key={role} size="sm" variant={has ? "default" : "outline"}
                className="h-7 px-3 text-[11px] capitalize font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                onClick={(e) => { e.stopPropagation(); toggle(r.id, role); }}>
                {role}
              </Button>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <Head title="Users & roles" />
      <PageHeader title="Users & roles" description="Promote users between Admin, Procurement, Approver, and Vendor roles." />
      <DataTable columns={columns} data={rows} exportFilename="users" emptyMessage="No users found." searchPlaceholder="Search users..." />
      {sa.SweetAlert}
    </AppShell>
  );
}
