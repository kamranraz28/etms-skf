import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Head, router, usePage } from "@inertiajs/react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function VendorCategories({ categories }: any) {
  const { props } = usePage<any>();
  const isAdmin = !!props.auth.user?.roles.includes("admin");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "" });

  const openNew = () => {
    setEditing(null);
    setForm({ name: "" });
    setOpen(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name });
    setOpen(true);
  };

  const save = () => {
    if (editing)
      router.put(`/app/vendor-categories/${editing.id}`, form, {
        onSuccess: () => setOpen(false),
      });
    else
      router.post(`/app/vendor-categories`, form, {
        onSuccess: () => setOpen(false),
      });
  };

  const remove = (c: any) => {
    if (confirm(`Delete category "${c.name}"?`))
      router.delete(`/app/vendor-categories/${c.id}`);
  };

  return (
    <AppShell>
      <Head title="Vendor Categories" />
      <PageHeader
        title="Vendor Categories"
        description="Manage vendor categories for classification."
        actions={
          isAdmin ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNew}>
                  <Plus className="h-4 w-4 mr-1" /> New category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editing ? "Edit category" : "Create category"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={save}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null
        }
      />

      <div className="panel overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Created</th>
              {isAdmin && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="text-center text-muted-foreground py-8"
                >
                  No categories yet.
                </td>
              </tr>
            )}
            {categories.map((c: any) => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                {isAdmin && (
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(c)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
