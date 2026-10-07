import { router, Head } from "@inertiajs/react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppRole } from "@/lib/types";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { ShieldCheck, Users as UsersIcon, Mail, ShieldAlert, Plus, X, Edit3, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Users({ rows, roles }: any) {
  const sa = useSweetAlert();
  const toggle = (uid: string, r: AppRole) => sa.confirmAction("Toggle role?", `Change this user's assignment for '${r.replace(/_/g, " ")}'?`, "Toggle").then(ok => {
    if (ok) router.post(`/app/users/${uid}/roles/${r}`, {}, {
      onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
    });
  });

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setSelectedRoles([]);
    setModal(true);
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setFullName(u.full_name);
    setEmail(u.email);
    setPassword("");
    setSelectedRoles([...(u.roles ?? [])]);
    setModal(true);
  };

  const toggleNewRole = (r: AppRole) =>
    setSelectedRoles((prev) => prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]);

  const save = () => {
    if (!fullName.trim()) { sa.alert("Error", "Full name is required", "error"); return; }
    if (!email.trim()) { sa.alert("Error", "Email is required", "error"); return; }
    if (!editing && password.length < 6) { sa.alert("Error", "Password must be at least 6 characters", "error"); return; }
    if (editing && password.length > 0 && password.length < 6) { sa.alert("Error", "Password must be at least 6 characters", "error"); return; }
    if (selectedRoles.length === 0) { sa.alert("Error", "Select at least one role", "error"); return; }
    setSaving(true);
    const url = editing ? `/app/users/${editing.id}` : "/app/users";
    const method = editing ? "put" : "post";
    router[method](url, { full_name: fullName.trim(), email: email.trim(), password, roles: selectedRoles }, {
      onSuccess: () => { setSaving(false); setModal(false); sa.alert(editing ? "Updated" : "Created", `User account ${editing ? "updated" : "created"} successfully.`, "success"); },
      onError: (e) => { setSaving(false); sa.alert("Error", Object.values(e).join(", "), "error"); },
    });
  };

  const destroy = async (u: any) => {
    const ok = await sa.confirmAction("Delete User?", `This will permanently remove '${u.full_name}' (${u.email}).`, "Delete");
    if (ok) router.delete(`/app/users/${u.id}`, {
      onSuccess: () => sa.alert("Deleted", "User deleted successfully.", "success"),
      onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
    });
  };

  const ALL: AppRole[] = (roles ?? []).map((r: any) => r.value);

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
            <div className="text-xs text-foreground/80 flex items-center gap-1 mt-0.5">
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
            return (
              <button
                key={role}
                onClick={(e) => { e.stopPropagation(); toggle(r.id, role); }}
                className={cn(
                  "px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all duration-150",
                  has
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-border/60 text-foreground hover:border-primary/40"
                )}
              >
                {role.replace(/_/g, " ")}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      exportable: false,
      className: "text-right",
      render: (r: any) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(r)} title="Edit User">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-destructive/10" onClick={() => destroy(r)} title="Delete User">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <Head title="Users & Roles" />
      <PageHeader title="Users & Roles" description="Control system access and assign specialized workspace roles to administrative and vendor accounts."
        actions={<Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> Add User</Button>}
      />
      
      <div className="bg-warning/[0.03] border border-warning/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-xs text-foreground font-medium leading-relaxed">
          <strong>Important security advisory:</strong> Modifying user role permissions affects access restrictions instantly. Toggle role states carefully to preserve functional workflows and approvals.
        </div>
      </div>

      <DataTable columns={columns} data={rows} exportFilename="users-roles" emptyMessage="No user registrations found." searchPlaceholder="Search users..." />

      {/* Add User Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-dialog w-full max-w-lg max-h-[90vh] overflow-hidden m-4 animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border/40 bg-gradient-to-r from-card to-muted/20 shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <UsersIcon className="h-4.5 w-4.5 text-accent" />
                {editing ? "Edit User" : "Add User"}
              </div>
              <button onClick={() => setModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground">Full Name <span className="text-destructive">*</span></Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11" placeholder="e.g. Karim Rahman" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground">Email <span className="text-destructive">*</span></Label>
                <Input type="email" name="new-user-email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" placeholder="e.g. karim@company.com" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground">{editing ? "New Password (leave blank to keep)" : "Initial Password"} {!editing && <span className="text-destructive">*</span>}</Label>
                <Input type="password" name="new-user-password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" placeholder={editing ? "Unchanged if left blank" : "Min. 6 characters"} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground">Roles <span className="text-destructive">*</span></Label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL.map((role) => {
                    const active = selectedRoles.includes(role);
                    return (
                      <button key={role} type="button" onClick={() => toggleNewRole(role)}
                        className={cn(
                          "px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all duration-150",
                          active
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background border-border/60 text-foreground hover:border-primary/40"
                        )}>
                        {role.replace(/_/g, " ")}
                      </button>
                    );
                  })}
                </div>
                {selectedRoles.includes("vendor") && (
                  <p className="text-[11px] text-foreground/80">A vendor profile (pending) will be created and a welcome email sent.</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end px-6 py-4 border-t border-border/40 bg-muted/10 shrink-0">
              <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? (editing ? "Saving..." : "Creating...") : (editing ? "Save changes" : "Create user")}</Button>
            </div>
          </div>
        </div>
      )}

      {sa.SweetAlert}
    </AppShell>
  );
}
