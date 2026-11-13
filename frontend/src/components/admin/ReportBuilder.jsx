import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  Download,
  Eye,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";

import API from "../../services/api";
import { Button, EmptyState, MultiSelect, Skeleton } from "../ui";

/* =====================================================
   REPORT BUILDER — admin CSV export
   GET /admin/report/meta       datasets + columns + filters
   GET /admin/report?dataset=…  format=json → preview
                                 format=csv  → file download
===================================================== */

const ReportBuilder = () => {
  const [meta, setMeta] = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);

  const [dataset, setDataset] = useState("users");
  const [filters, setFilters] = useState({});
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadMeta = async () => {
    setMetaLoading(true);
    setMetaError(null);
    try {
      const { data } = await API.get("/admin/report/meta");
      setMeta(data);
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      // A 404 here means the API this build points at predates the report
      // endpoint (e.g. a preview frontend against the production backend).
      setMetaError(
        status === 404
          ? "The connected backend does not include the report endpoint yet. Deploy the latest backend, then reload this page."
          : err?.response?.data?.message || "Could not reach the report service."
      );
    } finally {
      setMetaLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  const def = useMemo(
    () => meta?.datasets?.find((d) => d.key === dataset),
    [meta, dataset]
  );

  const changeDataset = (key) => {
    setDataset(key);
    setFilters({});
    setSortBy("createdAt");
    setOrder("desc");
    setPreview(null);
  };

  const reset = () => {
    setFilters({});
    setFrom("");
    setTo("");
    setSortBy("createdAt");
    setOrder("desc");
    setPreview(null);
  };

  // Select filters hold string[]; text/number filters hold a string.
  const isSet = (v) => (Array.isArray(v) ? v.length > 0 : v !== "" && v !== undefined);

  const params = useMemo(() => {
    const p = { dataset, sortBy, order };
    if (from) p.from = from;
    if (to) p.to = to;
    for (const [k, v] of Object.entries(filters)) {
      if (isSet(v)) p[k] = Array.isArray(v) ? v.join(",") : v;
    }
    return p;
  }, [dataset, sortBy, order, from, to, filters]);

  const activeFilterCount =
    Object.values(filters).filter(isSet).length + (from ? 1 : 0) + (to ? 1 : 0);

  const runPreview = async () => {
    setPreviewing(true);
    try {
      const { data } = await API.get("/admin/report", {
        params: { ...params, format: "json", limit: 10 },
      });
      setPreview(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      const res = await API.get("/admin/report", {
        params: { ...params, format: "csv" },
        responseType: "blob",
      });

      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] || `nexus-${dataset}-report.csv`;

      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const rows = res.headers["x-report-rows"];
      toast.success(rows ? `Exported ${rows} row${rows === "1" ? "" : "s"}` : "Report downloaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  if (metaLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (metaError || !meta?.datasets?.length) {
    return (
      <div className="card p-8 flex flex-col items-center gap-4">
        <EmptyState
          icon={FileSpreadsheet}
          title="Reports unavailable"
          description={metaError || "The report service did not return any datasets."}
        />
        <Button variant="secondary" iconLeft={RotateCcw} onClick={loadMeta}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* DATASET */}
      <div className="card p-5">
        <h3 className="font-semibold text-ink">Generate report</h3>
        <p className="text-xs text-muted mt-0.5 mb-4">
          Pick a dataset, narrow it down with filters, choose a sort order, then download as CSV.
        </p>

        <div className="flex flex-wrap gap-2">
          {meta.datasets.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => changeDataset(d.key)}
              className={`chip ${dataset === d.key ? "chip-active" : ""}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* FILTERS + SORT */}
      {def && (
        <div className="card p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-semibold text-ink">
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 text-xs font-semibold text-brand">
                  {activeFilterCount} active
                </span>
              )}
            </h3>
            <Button size="sm" variant="ghost" iconLeft={RotateCcw} onClick={reset}>
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {def.filters.map((f) => (
              <Field key={f.key} label={f.label}>
                {f.type === "select" ? (
                  <MultiSelect
                    options={f.options}
                    value={filters[f.key] ?? []}
                    onChange={(next) =>
                      setFilters((p) => ({ ...p, [f.key]: next }))
                    }
                  />
                ) : (
                  <input
                    className="input"
                    type={f.type === "number" ? "number" : "text"}
                    placeholder={f.type === "number" ? "e.g. 2024" : "Contains…"}
                    value={filters[f.key] ?? ""}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                  />
                )}
              </Field>
            ))}

            <Field label="Created from">
              <input
                className="input"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Field>
            <Field label="Created to">
              <input
                className="input"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </Field>
          </div>

          <div className="mt-5 pt-5 border-t border-line flex flex-wrap items-end gap-3">
            <Field label="Sort by" className="w-full sm:w-56">
              <select
                className="input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {def.columns.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="button"
              onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
              className="inline-flex items-center gap-2 h-10 px-3 rounded-[12px] border border-line bg-surface text-sm font-semibold text-ink hover:bg-surface-2 transition-colors"
              aria-label={`Sort order: ${order === "asc" ? "ascending" : "descending"}`}
            >
              {order === "asc" ? (
                <ArrowUpNarrowWide size={15} />
              ) : (
                <ArrowDownWideNarrow size={15} />
              )}
              {order === "asc" ? "Ascending" : "Descending"}
            </button>

            <div className="flex-1" />

            <Button
              variant="secondary"
              iconLeft={Eye}
              loading={previewing}
              onClick={runPreview}
            >
              Preview
            </Button>
            <Button
              variant="primary"
              iconLeft={Download}
              loading={downloading}
              onClick={download}
            >
              Download CSV
            </Button>
          </div>
        </div>
      )}

      {/* PREVIEW */}
      {preview && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-line flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-ink">Preview</h3>
              <p className="text-xs text-muted mt-0.5">
                {preview.total} row{preview.total === 1 ? "" : "s"} match
                {preview.total > preview.rows.length
                  ? ` · showing first ${preview.rows.length}`
                  : ""}
                {" · sorted by "}
                {preview.columns.find((c) => c.key === preview.sortBy)?.label || preview.sortBy}
                {` (${preview.order})`}
              </p>
            </div>
          </div>

          {preview.rows.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={FileSpreadsheet}
                title="No rows match these filters"
                description="Loosen a filter or widen the date range."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-surface-2 border-b border-line text-left">
                    {preview.columns.map((c) => (
                      <th
                        key={c.key}
                        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${
                          c.key === preview.sortBy ? "text-brand" : "text-muted"
                        }`}
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-line last:border-0 hover:bg-surface-2/50"
                    >
                      {preview.columns.map((c) => (
                        <td
                          key={c.key}
                          className="px-4 py-2.5 align-middle text-ink max-w-[280px] truncate"
                          title={formatCell(r[c.key])}
                        >
                          {formatCell(r[c.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

const formatCell = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "string" && ISO_DATE.test(v)) {
    return dayjs(v).format("MMM D, YYYY HH:mm");
  }
  return String(v);
};

const Field = ({ label, children, className = "" }) => (
  <label className={`block ${className}`}>
    <span className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">
      {label}
    </span>
    {children}
  </label>
);

export default ReportBuilder;
