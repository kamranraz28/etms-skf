import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSweetAlert } from "@/components/ui/extended/SweetAlert";
import { cn } from "@/lib/utils";
import { Head, router, usePage } from "@inertiajs/react";
import { Pencil, Plus, Trash2, Tag, Calendar } from "lucide-react";
import { useState } from "react";

export default function VendorCategories({ categories }: any) {
  const { props } = usePage<any>();
  const errors = props.errors || {};
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
      onError: () => {},
    });
    else router.post(`/app/vendor-categories`, form, {
      onSuccess: () => { setOpen(false); sa.alert("Category created", `"${form.name}" has been created.`, "success"); },
      onError: () => {},
    });
  };

  const remove = async (c: any) => {
    const ok = await sa.confirmDelete(c.name);
    if (!ok) return;
    router.delete(`/app/vendor-categories/${c.id}`, { onSuccess: () => sa.alert("Category deleted", `"${c.name}" has been removed.`, "success") });
  };

  const columns: Column[] = [
    {
      key: "name",
      label: "Category Name",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center text-accent shrink-0">
            <Tag className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm text-foreground">{r.name}</span>
        </div>
      )
    },
    {
      key: "created_at",
      label: "Created Date",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{new Date(r.created_at).toLocaleDateString()}</span>
        </div>
      )
    },
    ...(isAdmin ? [{
      key: "actions" as string,
      label: "Actions",
      className: "text-right",
      exportable: false,
      render: (r: any) => (
        <div className="inline-flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="h-8 w-8 p-0" title="Edit Category">
            <Pencil className="h-4 w-4 text-foreground/75" />
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); remove(r); }} className="h-8 w-8 p-0 hover:bg-destructive/10" title="Delete Category">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <AppShell>
      <Head title="Vendor Categories" />
      <PageHeader
        title="Vendor Categories"
        description="Classify suppliers by category to target invitations for specific bid requisitions."
        actions={isAdmin ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} className="gap-2">
                <Plus className="h-4 w-4" /> New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  {editing ? "Edit Category" : "Create Category"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-foreground/70">Category Name <span className="text-destructive">*</span></Label>
                  <Input className={errors.name && "border-destructive focus-visible:ring-destructive"} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. IT Equipment, Lab Supplies" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={save}>{editing ? "Save changes" : "Create category"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      />
      
      <DataTable columns={columns} data={categories} exportFilename="vendor-categories" emptyMessage="No categories created yet." searchPlaceholder="Search categories..." />
      {sa.SweetAlert}
    </AppShell>
  );
}
