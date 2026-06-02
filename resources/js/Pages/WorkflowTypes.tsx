import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Head, router } from "@inertiajs/react";
import { Plus, Edit3, Trash2, GripVertical, Workflow, ListOrdered } from "lucide-react";
import { useState } from "react";

export default function WorkflowTypes({ types }: any) {
  const sa = useSweetAlert();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<any[]>([{ step_name: "", label: "", role_name: "" }]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setSteps([{ step_name: "", label: "", role_name: "" }]);
    setModal(true);
  };

  const openEdit = (t: any) => {
    setEditing(t);
    setName(t.name);
    setDescription(t.description || "");
    setSteps((t.steps || []).map((s: any) => ({
      step_name: s.step_name,
      label: s.label,
      role_name: s.role_name,
    })));
    setModal(true);
  };

  const addStep = () => setSteps([...steps, { step_name: "", label: "", role_name: "" }]);
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const setStep = (i: number, field: string, value: string) => {
    const copy = [...steps];
    copy[i] = { ...copy[i], [field]: value };
    setSteps(copy);
  };

  const save = () => {
    if (!name) { sa.alert("Error", "Name is required", "error"); return; }
    for (const s of steps) {
      if (!s.step_name || !s.label || !s.role_name) {
        sa.alert("Error", "All step fields are required", "error");
        return;
      }
    }
    const url = editing ? `/app/workflow-types/${editing.id}` : "/app/workflow-types";
    const method = editing ? "put" : "post";
    router[method](url, { name, description, steps }, {
      onSuccess: () => { setModal(false); sa.alert("Saved", "Workflow type saved", "success"); },
      onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
    });
  };

  const destroy = async (id: number) => {
    const ok = await sa.confirmAction("Delete?", "This cannot be undone.", "Delete");
    if (ok) router.delete(`/app/workflow-types/${id}`, {
      onSuccess: () => sa.alert("Deleted", "Workflow type deleted", "success"),
    });
  };

  const columns: Column[] = [
    { key: "name", label: "Name", sortable: true, render: (r: any) => <span className="font-semibold">{r.name}</span> },
    { key: "description", label: "Description", sortable: false, render: (r: any) => <span className="text-xs text-muted-foreground">{r.description || "—"}</span> },
    { key: "steps", label: "Steps", sortable: false, render: (r: any) => <span className="text-xs">{(r.steps || []).length} step(s)</span> },
    {
      key: "actions",
      label: "",
      sortable: false,
      render: (r: any) => (
        <div className="flex gap-1 justify-end">
          <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Edit3 className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" onClick={() => destroy(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <Head title="Workflow Types" />
      <PageHeader
        title="Workflow Types"
        description="Manage approval workflows for Comparative Statements"
        actions={<Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Workflow</Button>}
      />
      <DataTable columns={columns} data={types} searchable={false} exportable={false} compact emptyMessage="No workflow types." />

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setModal(false)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Workflow className="h-5 w-5 text-accent" />
              {editing ? "Edit Workflow" : "New Workflow"}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="e.g. Plant Purchase" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" rows={2} placeholder="Optional description" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <ListOrdered className="h-3.5 w-3.5" /> Approval Steps
                  </label>
                  <Button size="sm" variant="outline" onClick={addStep}><Plus className="h-3 w-3 mr-1" /> Add Step</Button>
                </div>
                <div className="space-y-2">
                  {steps.map((s, i) => (
                    <div key={i} className="flex gap-2 items-start p-3 rounded-lg border border-border/40 bg-muted/20">
                      <span className="text-xs font-mono text-muted-foreground mt-2.5 w-5">#{i + 1}</span>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input value={s.step_name} onChange={(e) => setStep(i, "step_name", e.target.value)} className="rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Step name" />
                        <input value={s.label} onChange={(e) => setStep(i, "label", e.target.value)} className="rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Label (e.g. Dept Head)" />
                        <input value={s.role_name} onChange={(e) => setStep(i, "role_name", e.target.value)} className="rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Role name" />
                      </div>
                      {steps.length > 1 && (
                        <Button size="icon" variant="ghost" onClick={() => removeStep(i)} className="shrink-0 mt-1"><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Update" : "Create"}</Button>
            </div>
          </div>
        </div>
      )}
      {sa.SweetAlert}
    </AppShell>
  );
}
