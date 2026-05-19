import { router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { AppRole } from "@/lib/types";

const ALL: AppRole[] = ["admin","procurement","approver","vendor"];

export default function Users({ rows }: any) {
  const toggle = (uid: string, r: AppRole) => router.post(`/app/users/${uid}/roles/${r}`);
  return (
    <AppShell>
      <Head title="Users & roles" />
      <PageHeader title="Users & roles" description="Promote users between Admin, Procurement, Approver, and Vendor roles." />
      <div className="panel overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>User</th><th>Email</th><th>Roles</th></tr></thead>
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
                          className="h-6 px-2 text-[11px] capitalize" onClick={()=>toggle(u.id, r)}>
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
    </AppShell>
  );
}
