import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Head, router } from "@inertiajs/react";
import { Plus, Edit3, Trash2, GripVertical, Workflow, ListOrdered, ChevronRight, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
      onSuccess: () => { setModal(false); sa.alert("Saved", "Workflow type saved successfully.", "success"); },
      onError: (e) => sa.alert("Error", Object.values(e).join(", "), "error"),
    });
  };

  const destroy = async (id: number) => {
    const ok = await sa.confirmAction("Delete Workflow Type?", "This will permanently remove this approval path. Workflows currently in progress may be impacted.", "Delete");
    if (ok) router.delete(`/app/workflow-types/${id}`, {
      onSuccess: () => sa.alert("Deleted", "Workflow type deleted successfully.", "success"),
    });
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Workflow Name",
      sortable: true,
      render: (r: any) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Workflow className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm text-foreground">{r.name}</span>
        </div>
      )
    },
    { key: "description", label: "Description", sortable: false, render: (r: any) => <span className="text-xs text-muted-foreground">{r.description || "No description provided."}</span> },
    {
      key: "steps",
      label: "Approval Sequence",
      sortable: false,
      render: (r: any) => {
        const sequence = r.steps ?? [];
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {sequence.map((step: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1 text-[10px] bg-muted/60 text-foreground px-2 py-0.5 rounded-md font-semibold border border-border">
                <span>{step.label}</span>
                {idx !== sequence.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
              </div>
            ))}
            {sequence.length === 0 && <span className="text-xs text-muted-foreground/40">No steps defined</span>}
          </div>
        );
      }
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      className: "text-right",
      render: (r: any) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(r)} title="Edit Workflow">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-destructive/10" onClick={() => destroy(r.id)} title="Delete Workflow">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <Head title="Workflow Management" />
      <PageHeader
        title="Workflow Management"
        description="Configure sequential multi-role approval paths for comparative statements and payments."
        actions={<Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> Add Workflow</Button>}
      />
      
      <DataTable columns={columns} data={types} searchable={false} exportable={false} compact emptyMessage="No workflows configured yet." />

      {/* Edit/Create Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)}>
          <div className="bg-card border border-border/60 rounded-2xl shadow-dialog w-full max-w-2xl max-h-[90vh] overflow-hidden m-4 animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-border/40 bg-gradient-to-r from-card to-muted/20 shrink-0">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <Workflow className="h-4.5 w-4.5 text-accent animate-pulse-soft" />
                {editing ? "Configure Approval Workflow" : "Create Approval Workflow"}
              </div>
              <button onClick={() => setModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-5 flex-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Workflow Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" placeholder="e.g. IT Equipment Purchases" />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional workflow parameters or scope..." />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <Label className="text-xs font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
                    <ListOrdered className="h-4 w-4 text-accent" /> Approval Steps Sequence
                  </Label>
                  <Button size="sm" variant="outline" onClick={addStep} className="h-8 text-xs gap-1"><Plus className="h-3.5 w-3.5" /> Add Step</Button>
                </div>
                
                <div className="space-y-3">
                  {steps.map((s, i) => (
                    <div key={i} className="flex gap-3 items-start p-4 rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/15 relative">
                      <span className="text-xs font-bold font-mono text-muted-foreground/60 mt-2.5 w-6">#{i + 1}</span>
                      
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Step Identifier</Label>
                          <Input value={s.step_name} onChange={(e) => setStep(i, "step_name", e.target.value)} className="h-9 text-xs" placeholder="e.g. dept_head" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Display Label</Label>
                          <Input value={s.label} onChange={(e) => setStep(i, "label", e.target.value)} className="h-9 text-xs" placeholder="e.g. Department Head" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Assigned Role</Label>
                          <Input value={s.role_name} onChange={(e) => setStep(i, "role_name", e.target.value)} className="h-9 text-xs" placeholder="e.g. department_head" />
                        </div>
                      </div>
                      
                      {steps.length > 1 && (
                        <Button size="sm" variant="ghost" onClick={() => removeStep(i)} className="h-8 w-8 p-0 shrink-0 mt-4 hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end px-6 py-4 border-t border-border/40 bg-muted/10 shrink-0">
              <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
              <Button onClick={save}>{editing ? "Save changes" : "Create workflow"}</Button>
            </div>
          </div>
        </div>
      )}
      {sa.SweetAlert}
    </AppShell>
  );
}

function X(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}
