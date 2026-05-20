import { router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { AppRole } from "@/lib/types";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { ShieldCheck, Users as UsersIcon } from "lucide-react";

const ALL: AppRole[] = ["admin","procurement","approver","vendor"];

export default function Users({ rows }: any) {
  const sa = useSweetAlert();
  const toggle = (uid: string, r: AppRole) => sa.confirmAction("Toggle role?", "Change this user's role?", "Toggle").then(ok => { if (ok) router.post(`/app/users/${uid}/roles/${r}`); });
  return (
    <AppShell>
      <Head title="Users & roles" />
      <PageHeader title="Users & roles" description="Promote users between Admin, Procurement, Approver, and Vendor roles." />
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th><UsersIcon className="h-3.5 w-3.5 inline mr-1" /> User</th><th>Email</th><th><ShieldCheck className="h-3.5 w-3.5 inline mr-1" /> Roles</th></tr></thead>
            <tbody>
              {rows.map((u: any) => (
                <tr key={u.id}>
                  <td className="font-medium whitespace-nowrap">{u.full_name}</td>
                  <td className="text-xs text-muted-foreground whitespace-nowrap">{u.email}</td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL.map((r) => {
                        const has = u.roles.includes(r);
                        return (
                          <Button key={r} size="sm" variant={has ? "default" : "outline"}
                            className="h-7 px-3 text-[11px] capitalize font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                            onClick={()=>toggle(u.id, r)}>
                            {r}
                          </Button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {sa.SweetAlert}
    </AppShell>
  );
}
