import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
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
import { Textarea } from "@/components/ui/textarea";
import { PageSharedProps, VendorStatus } from "@/lib/types";
import { Head, router, usePage } from "@inertiajs/react";
import { Pencil, Plus, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Vendors({ vendors, categories }: any) {
  const { props } = usePage<PageSharedProps>();
  const isAdmin = !!props.auth.user?.roles.includes("admin");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    erp_code: "",
    notes: "",
    status: "pending" as VendorStatus,
    vendor_category_id: "",
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      erp_code: "",
      notes: "",
      status: "pending",
      vendor_category_id: "",
    });
    setOpen(true);
  };
  const openEdit = (v: any) => {
    setEditing(v);
    setForm({
      name: v.name,
      email: v.email,
      phone: v.phone ?? "",
      erp_code: v.erp_code ?? "",
      notes: v.notes ?? "",
      status: v.status,
      vendor_category_id: v.vendor_category_id ?? "",
    });
    setOpen(true);
  };

  const save = () => {
    if (editing)
      router.put(`/app/vendors/${editing.id}`, form, {
        onSuccess: () => setOpen(false),
      });
    else router.post(`/app/vendors`, form, { onSuccess: () => setOpen(false) });
  };
  const setStatus = (v: any, status: VendorStatus) =>
    router.put(`/app/vendors/${v.id}`, { ...v, status });
  const remove = (v: any) => {
    if (confirm(`Delete vendor "${v.name}"?`))
      router.delete(`/app/vendors/${v.id}`);
  };

  return (
    <AppShell>
      <Head title="Vendors" />
      <PageHeader
        title="Vendors"
        description="Master list of suppliers. ERP code is required before a vendor can be selected for award."
        actions={
          isAdmin ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNew}>
                  <Plus className="h-4 w-4 mr-1" /> New vendor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editing ? "Edit vendor" : "Create vendor"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Status</Label>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            status: e.target.value as VendorStatus,
                          })
                        }
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blacklisted">Blacklisted</option>
                      </select>
                    </div>
                  <div className="col-span-2">
                    <Label>Category</Label>
                    <select
                      value={form.vendor_category_id}
                      onChange={(e) =>
                        setForm({ ...form, vendor_category_id: e.target.value })
                      }
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">No category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                    />
                  </div>
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
              <th>Vendor</th>
              <th>Category</th>
              <th>Phone</th>
              <th>ERP code</th>
              <th>Status</th>
              <th>Created</th>
              {isAdmin && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-muted-foreground py-8"
                >
                  No vendors yet.
                </td>
              </tr>
            )}
            {vendors.map((v: any) => (
              <tr key={v.id}>
                <td>
                  <div className="font-medium">{v.name}</div>
                  <div className="text-xs text-muted-foreground">{v.email}</div>
                </td>
                <td className="text-xs">
                  {v.vendor_category?.name ?? "—"}
                </td>

                <td className="text-xs">{v.phone ?? "—"}</td>
                <td className="font-mono text-xs">
                  {v.erp_code ?? (
                    <span className="text-warning">Not mapped</span>
                  )}
                </td>
                <td>
                  <StatusBadge status={v.status} />
                </td>
                <td className="text-xs text-muted-foreground">
                  {new Date(v.created_at).toLocaleDateString()}
                </td>
                {isAdmin && (
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      {v.status !== "active" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStatus(v, "active")}
                        >
                          <ShieldCheck className="h-4 w-4 text-success" />
                        </Button>
                      )}
                      {v.status !== "blacklisted" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setStatus(v, "blacklisted")}
                        >
                          <ShieldOff className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(v)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(v)}
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
