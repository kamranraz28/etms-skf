import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Download,
    FileDown,
    File as FilePdf,
    FileSpreadsheet,
    FileText as FileTextIcon,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  exportable?: boolean;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  searchable?: boolean;
  searchPlaceholder?: string;
  exportable?: boolean;
  exportFilename?: string;
  onRowClick?: (row: T) => void;
  rowKey?: string;
  rowClassName?: string | ((row: T) => string);
  filterable?: boolean;
  filters?: ReactNode;
  hidePageSize?: boolean;
  compact?: boolean;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className={cn(
              "h-4 rounded-lg bg-muted/60",
              i === 0 ? "w-3/4" : "w-full",
            )}
          />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  emptyMessage = "No data found.",
  pageSize: defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  searchable = true,
  searchPlaceholder = "Search...",
  exportable = true,
  exportFilename = "export",
  onRowClick,
  rowKey = "id",
  rowClassName,
  filterable,
  filters,
  hidePageSize,
  compact,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node))
        setExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      }),
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp =
        typeof aVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const exportCols = columns.filter((c) => c.exportable !== false);

  const exportCSV = async () => {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 50));
    const header = exportCols.map((c) => c.label).join(",");
    const body = sorted
      .map((row) =>
        exportCols
          .map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
    setExporting(false);
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const header = exportCols.map((c) => c.label);
      const body = sorted.map((row) => exportCols.map((c) => row[c.key] ?? ""));
      const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${exportFilename}.xlsx`);
    } catch (e) {
      console.error("Excel export failed", e);
    }
    setExportOpen(false);
    setExporting(false);
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      autoTable(doc, {
        head: [exportCols.map((c) => c.label)],
        body: sorted.map((row) => exportCols.map((c) => row[c.key] ?? "")),
        styles: { fontSize: 7, cellPadding: 2, font: "helvetica" },
        headStyles: {
          fillColor: [41, 65, 102],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });
      doc.save(`${exportFilename}.pdf`);
    } catch (e) {
      console.error("PDF export failed", e);
    }
    setExportOpen(false);
    setExporting(false);
  };

  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key)
      return (
        <ArrowUpDown className="h-3 w-3 ml-1.5 opacity-30 group-hover:opacity-60 transition-opacity" />
      );
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1.5 text-accent" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1.5 text-accent" />
    );
  };

  const startItem = sorted.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, sorted.length);

  const getRowClass = (row: T): string => {
    if (typeof rowClassName === "function") return rowClassName(row);
    return rowClassName ?? "";
  };

  const getPageNumbers = () => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
    } else if (page >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = page - 2; i <= page + 2; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div
      className={cn(
        "bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md",
        compact && "rounded-xl",
      )}
    >
      {/* Toolbar */}
      <div
        className={cn(
          "px-5 border-b border-border/40 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-gradient-to-r from-card to-muted/5",
          compact ? "py-3" : "py-4",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:w-auto">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                className="pl-9 h-9 text-sm bg-background/50 border-border/50 focus:bg-background transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          {filterable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "transition-all duration-200",
                showFilters && "bg-accent/10 border-accent/30 text-accent",
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1" /> Filters
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {exportable && (
            <div className="relative" ref={exportRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => !exporting && setExportOpen(!exportOpen)}
                disabled={exporting}
                className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20 hover:border-primary/40 transition-all duration-200"
              >
                {exporting ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin mr-1.5" />
                ) : (
                  <FileDown className="h-3.5 w-3.5 mr-1.5" />
                )}
                {exporting ? "Exporting..." : "Export"}
              </Button>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-card border border-border/60 rounded-xl shadow-xl z-50 py-1.5 animate-scale-in origin-top-right">
                  <button
                    onClick={exportCSV}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 transition-colors"
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />{" "}
                    Export as CSV
                  </button>
                  <button
                    onClick={exportExcel}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-success" /> Export
                    as Excel
                  </button>
                  <button
                    onClick={exportPDF}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 hover:bg-muted/50 transition-colors"
                  >
                    <FilePdf className="h-4 w-4 text-destructive" /> Export as
                    PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {filterable && showFilters && filters && (
        <div className="px-5 py-4 border-b border-border/40 bg-muted/10 animate-fade-in">
          {filters}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-muted/40 to-muted/20">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={cn(
                    "px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 group",
                    col.sortable &&
                      "cursor-pointer select-none hover:text-foreground transition-colors",
                    col.className,
                    col.headerClassName,
                  )}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))}
            {!loading && paginated.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-16 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-muted/30 flex items-center justify-center">
                      <FileTextIcon className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="font-medium text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              paginated.map((row, idx) => (
                <tr
                  key={row[rowKey] ?? idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-all duration-150 hover:bg-muted/30 hover:shadow-sm",
                    onRowClick && "cursor-pointer",
                    getRowClass(row),
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 transition-colors duration-150",
                        compact ? "py-2.5" : "py-3",
                        col.className,
                      )}
                    >
                      {col.render ? (
                        col.render(row)
                      ) : (
                        <span
                          className={
                            row[col.key] != null
                              ? undefined
                              : "text-muted-foreground/60"
                          }
                        >
                          {row[col.key] ?? "—"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className={cn(
          "px-5 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm bg-gradient-to-r from-card to-muted/5",
          compact ? "py-2.5" : "py-3.5",
        )}
      >
        <div className="flex items-center gap-3 text-muted-foreground">
          {!hidePageSize && (
            <span className="flex items-center gap-1.5">
              <span className="text-xs hidden sm:inline">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-input bg-background/80 px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
              >
                {pageSizeOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </span>
          )}
          <span className="text-xs text-muted-foreground/70">
            {startItem}–{endItem} of {sorted.length}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setPage(1)}
            disabled={page <= 1}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-0.5 px-0.5">
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={cn(
                  "h-8 min-w-[2rem] rounded-lg text-xs font-medium transition-all duration-150 px-2",
                  page === pageNum
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
