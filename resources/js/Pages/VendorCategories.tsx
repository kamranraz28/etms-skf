import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { Head, router, usePage } from "@inertiajs/react";
import { Pencil, Plus, Trash2, Tag } from "lucide-react";
import { useState } from "react";

export default function VendorCategories({ categories }: any) {
  const { props } = usePage<any>();
  const isAdmin = !!props.auth.user?.roles.includes("admin");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "" });
  const sa = useSweetAlert();

  const openNew = () => { setEditing(null); setForm({ name: "" }); setOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name }); setOpen(true); };
  const save = async () => {
    const ok = await sa.confirmAction(editing ? "Update category?" : "Create category?", `Save category "${form.name}"?`, "Save");
    if (!ok) return;
    if (editing) router.put(`/app/vendor-categories/${editing.id}`, form, {
      onSuccess: () => { setOpen(false); sa.alert("Category updated", `"${form.name}" has been updated.`, "success"); },
    });
    else router.post(`/app/vendor-categories`, form, {
      onSuccess: () => { setOpen(false); sa.alert("Category created", `"${form.name}" has been created.`, "success"); },
    });
  };
  const remove = async (c: any) => {
    const ok = await sa.confirmDelete(c.name);
    if (!ok) return;
    router.delete(`/app/vendor-categories/${c.id}`, { onSuccess: () => sa.alert("Category deleted", `"${c.name}" has been removed.`, "success") });
  };

  const columns: Column[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "created_at", label: "Created", sortable: true, render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span> },
    ...(isAdmin ? [{
      key: "actions" as string,
      label: "Actions",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <div className="inline-flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(r); }}><Pencil className="h-4 w-4" /></Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(r); }} className="hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <AppShell>
      <Head title="Vendor Categories" />
      <PageHeader
        title="Vendor Categories"
        description="Manage vendor categories for classification."
        actions={isAdmin ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="h-4 w-4" /> New category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit category" : "Create category"}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter category name" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      />
      <DataTable columns={columns} data={categories} exportFilename="vendor-categories" emptyMessage="No categories yet." />
      {sa.SweetAlert}
    </AppShell>
  );
}
