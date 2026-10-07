import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Head, router } from "@inertiajs/react";
import { Plus, Edit3, Trash2, KeyRound, ShieldCheck, X, Lock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Roles({ roles, permissions }: any) {
  const sa = useSweetAlert();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const [matrixRole, setMatrixRole] = useState<any>(null);
  const [matrixPerms, setMatrixPerms] = useState<string[]>([]);
  const [savingMatrix, setSavingMatrix] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setLabel("");
    setModal(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setLabel(r.label);
    setModal(true);
  };

  const save = () => {
    if (!label.trim()) { sa.alert("Error", "Role name is required", "error"); return; }
    setSaving(true);
    const url = editing ? `/app/roles/${editing.id}` : "/app/roles";
    const method = editing ? "put" : "post";
    router[method](url, { label: label.trim() }, {
      onSuccess: () => { setSaving(false); setModal(false); sa.alert(editing ? "Updated" : "Created", `Role ${editing ? "updated" : "created"} successfully.`, "success"); },
      onError: (e) => { setSaving(false); sa.alert("Error", Object.values(e).join(", "), "error"); },
    });
  };

  const destroy = async (r: any) => {
    const ok = await sa.confirmAction("Delete Role?", `Permanently remove the '${r.label}' role?`, "Delete");
    if (ok) router.delete(`/app/roles/${r.id}`, {
      onSuccess: () => sa.alert("Deleted", "Role deleted successfully.", "success"),
      onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
    });
  };

  const openMatrix = (r: any) => {
    setMatrixRole(r);
    setMatrixPerms([...(r.permissions ?? [])]);
  };

  const togglePerm = (slug: string) =>
    setMatrixPerms((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);

  const toggleGroup = (slugs: string[]) => {
    const allOn = slugs.every((s) => matrixPerms.includes(s));
    setMatrixPerms((prev) => allOn ? prev.filter((s) => !slugs.includes(s)) : [...new Set([...prev, ...slugs])]);
  };

  const saveMatrix = () => {
    if (!matrixRole) return;
    setSavingMatrix(true);
    router.put(`/app/roles/${matrixRole.id}/permissions`, { permissions: matrixPerms }, {
      onSuccess: () => { setSavingMatrix(false); setMatrixRole(null); sa.alert("Saved", `Permissions updated for '${matrixRole.label}'.`, "success"); },
      onError: (e) => { setSavingMatrix(false); sa.alert("Error", Object.values(e).join(", "), "error"); },
    });
  };

  const columns: Column[] = [
    {
      key: "label",
      label: "Role",
      sortable: true,
      render: (r: any) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              {r.label}
              {r.is_system && (
                <span className="inline-flex items-center gap-0.5 text-[9px] uppercase font-bold tracking-wider text-foreground bg-muted/60 px-1.5 py-0.5 rounded-md">
                  <Lock className="h-2.5 w-2.5" /> System
                </span>
              )}
            </div>
            <div className="text-[11px] text-foreground font-mono">{r.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: "users_count",
      label: "Users",
      sortable: true,
      render: (r: any) => <span className="font-mono text-xs font-bold bg-muted/60 px-2 py-0.5 rounded-md">{r.users_count}</span>,
    },
    {
      key: "workflow_usage",
      label: "In Workflows",
      sortable: true,
      render: (r: any) => <span className="font-mono text-xs font-bold bg-muted/60 px-2 py-0.5 rounded-md">{r.workflow_usage}</span>,
    },
    {
      key: "permissions",
      label: "Permissions",
      sortable: false,
      render: (r: any) => <span className="text-xs text-foreground font-semibold">{(r.permissions ?? []).length} granted</span>,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      exportable: false,
      className: "text-right",
      render: (r: any) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" className="h-8 py-0 px-2.5 text-xs gap-1" onClick={() => openMatrix(r)} title="Edit permissions">
            <KeyRound className="h-3.5 w-3.5" /> Permissions
          </Button>
          {!r.is_system && (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(r)} title="Rename role">
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
          {!r.is_system && (
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-destructive/10" onClick={() => destroy(r)} title="Delete role">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <Head title="Roles & Permissions" />
      <PageHeader
        title="Roles & Permissions"
        description="Create roles and control exactly which pages and actions each role can access."
        actions={<Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> Add Role</Button>}
      />

      <DataTable columns={columns} data={roles} searchable={false} exportable={false} compact emptyMessage="No roles found." />

      {/* Create / Rename Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-dialog w-full max-w-md max-h-[90vh] overflow-hidden m-4 animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border/40 bg-gradient-to-r from-card to-muted/20 shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <ShieldCheck className="h-4.5 w-4.5 text-accent" />
                {editing ? "Rename Role" : "Add Role"}
              </div>
              <button onClick={() => setModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Role Name <span className="text-destructive">*</span></Label>
                <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-11" placeholder="e.g. Site Engineer" />
                {!editing && label.trim() && (
                  <p className="text-[11px] text-foreground">System name: <span className="font-mono">{label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}</span></p>
                )}
                {editing && (
                  <p className="text-[11px] text-foreground">System name <span className="font-mono">{editing.slug}</span> stays unchanged so existing assignments keep working.</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end px-6 py-4 border-t border-border/40 bg-muted/10 shrink-0">
              <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : "Create role"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Matrix Modal */}
      {matrixRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setMatrixRole(null)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-dialog w-full max-w-2xl max-h-[90vh] overflow-hidden m-4 animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border/40 bg-gradient-to-r from-card to-muted/20 shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <KeyRound className="h-4.5 w-4.5 text-accent" />
                Permissions · {matrixRole.label}
              </div>
              <button onClick={() => setMatrixRole(null)} className="h-8 w-8 rounded-lg flex items-center justify-center text-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              {Object.entries(permissions ?? {}).map(([group, items]: any) => {
                const slugs = items.map((p: any) => p.slug);
                const allOn = slugs.every((s: string) => matrixPerms.includes(s));
                const someOn = slugs.some((s: string) => matrixPerms.includes(s));
                return (
                  <div key={group} className="border border-border/40 rounded-xl p-4 bg-gradient-to-br from-card to-muted/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">{group}</span>
                      <button onClick={() => toggleGroup(slugs)}
                        className={cn("text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-all",
                          allOn ? "bg-foreground border-foreground text-background" : someOn ? "bg-warning/10 border-warning/30 text-warning" : "bg-background border-border/60 text-foreground hover:border-primary/40")}>
                        {allOn ? "All on" : someOn ? "Partial" : "All off"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((p: any) => {
                        const active = matrixPerms.includes(p.slug);
                        return (
                          <button key={p.slug} type="button" onClick={() => togglePerm(p.slug)} title={p.slug}
                            className={cn("px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all duration-150 text-left",
                              active ? "bg-foreground border-foreground text-background" : "bg-background border-border/60 text-foreground hover:border-primary/40 hover:text-foreground")}>
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 justify-between items-center px-6 py-4 border-t border-border/40 bg-muted/10 shrink-0">
              <span className="text-[11px] text-foreground font-medium">{matrixPerms.length} permissions selected. Changes apply on next page load.</span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMatrixRole(null)}>Cancel</Button>
                <Button onClick={saveMatrix} disabled={savingMatrix}>{savingMatrix ? "Saving..." : "Save permissions"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sa.SweetAlert}
    </AppShell>
  );
}
