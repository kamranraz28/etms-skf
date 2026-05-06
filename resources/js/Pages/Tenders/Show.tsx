import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { PageSharedProps } from "@/lib/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, ExternalLink, Lock, Scale } from "lucide-react";

export default function TenderShow({ tender, vendors, bids, cs }: any) {
  const { props } = usePage<PageSharedProps>();
  const primary = props.auth.user?.primary_role;
  const lowest = bids[0];
  const closeTender = () => router.post(`/app/tenders/${tender.id}/close`);
  const generateCS = () => router.post(`/app/tenders/${tender.id}/generate-cs`);

  return (
    <AppShell>
      <Head title={tender.title} />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => history.back()}
        className="mb-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <PageHeader
        title={tender.title}
        description={`${tender.tender_number} · Deadline ${new Date(tender.deadline).toLocaleString()}`}
        actions={
          <div className="flex gap-2 items-center">
            <StatusBadge status={tender.status} />
            {tender.status === "open" && (
              <Button variant="outline" size="sm" onClick={closeTender}>
                <Lock className="h-4 w-4 mr-1" /> Close tender
              </Button>
            )}
            {tender.status !== "open" &&
              bids.length > 0 &&
              !cs &&
              (primary === "admin" || primary === "procurement") && (
                <Button size="sm" onClick={generateCS}>
                  <Scale className="h-4 w-4 mr-1" /> Generate CS
                </Button>
              )}
            {cs && (
              <Link href={`/app/cs/${cs.id}`}>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-1" /> Open CS
                </Button>
              </Link>
            )}
          </div>
        }
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">Bids received ({bids.length})</div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>ERP</th>
                  <th>Submitted</th>
                  {/* <th>Document</th> */}
                </tr>
              </thead>
              <tbody>
                {bids.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center text-muted-foreground py-6"
                    >
                      No bids yet.
                    </td>
                  </tr>
                )}
                {bids.map((b: any) => (
                  <tr
                    key={b.id}
                    className={lowest?.id === b.id ? "bg-success/5" : ""}
                  >
                    <td className="font-medium">
                      {b.vendor?.name}
                      {lowest?.id === b.id && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-success">
                          L1
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-xs">
                      {b.vendor?.erp_code ?? (
                        <span className="text-warning">—</span>
                      )}
                    </td>

                    <td className="text-xs text-muted-foreground">
                      {new Date(b.submitted_at).toLocaleString()}
                    </td>
                    {/* <td>
                      {b.document_path ? (
                        <a href={`/app/bids/${b.id}/document`}>
                          <Button size="sm" variant="ghost">
                            <Download className="h-3.5 w-3.5 mr-1" /> Open
                          </Button>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tender.pr && (
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  Requisition items · {tender.pr.pr_number}
                </div>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {(tender.pr.items ?? []).map((it: any, i: number) => (
                    <tr key={i}>
                      <td>{it.name}</td>
                      <td>{it.qty}</td>
                      <td>{it.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                Invited vendors ({vendors.length})
              </div>
            </div>
            <ul className="divide-y divide-border">
              {vendors.map((v: any) => (
                <li key={v.id} className="px-4 py-2.5">
                  <div className="text-sm font-medium">{v.name}</div>
                  <div className="text-xs text-muted-foreground">{v.email}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={v.status} />
                    {v.erp_code ? (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ERP: {v.erp_code}
                      </span>
                    ) : (
                      <span className="text-[10px] text-warning">
                        No ERP code
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {tender.description && (
            <div className="panel p-4">
              <div className="panel-title mb-2">Scope</div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {tender.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
