import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiSearch, FiX, FiCheck, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/api/admin.api";
import { cn } from "@/lib/utils";
import type { BookStatus } from "@/types";

type Tab = BookStatus | "ALL";
const TABS: { value: Tab; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING_APPROVAL", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_BADGE: Record<BookStatus, { label: string; cls: string }> = {
  PENDING_APPROVAL: {
    label: "Pending",
    cls: "bg-amber-100 text-amber-700",
  },
  APPROVED: { label: "Approved", cls: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejected", cls: "bg-red-100 text-red-700" },
};

export default function AdminBooksPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("ALL");
  const [q, setQ] = useState("");

  const { data: books, isLoading } = useQuery({
    queryKey: ["admin", "books"],
    queryFn: adminApi.getBooks,
  });

  const counts = useMemo(() => {
    const c: Record<Tab, number> = {
      ALL: 0,
      PENDING_APPROVAL: 0,
      APPROVED: 0,
      REJECTED: 0,
    };
    (books ?? []).forEach((b) => {
      c.ALL++;
      c[b.status]++;
    });
    return c;
  }, [books]);

  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: BookStatus }) =>
      adminApi.updateBookStatus(id, status),
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["seller"] });
      toast.success(
        `"${b.title}" ${
          b.status === "APPROVED" ? "approved ✅" : "rejected ❌"
        }`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (books ?? [])
    .filter((b) => (tab === "ALL" ? true : b.status === tab))
    .filter((b) => {
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        b.title.toLowerCase().includes(needle) ||
        b.author.toLowerCase().includes(needle) ||
        b.isbn.toLowerCase().includes(needle) ||
        b.publisher.toLowerCase().includes(needle)
      );
    });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-brand-dark">Marketplace</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve books submitted by sellers before they go live.
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition",
                tab === t.value
                  ? "border-brand-dark bg-brand-dark text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-brand-dark"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold",
                  tab === t.value
                    ? "bg-white text-brand-dark"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {counts[t.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="relative ml-auto w-full max-w-sm">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, author, ISBN, or publisher…"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {counts.PENDING_APPROVAL} pending reviews
        </span>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-gray-500">
            No books match these filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => {
            const badge = STATUS_BADGE[b.status];
            return (
              <Card key={b.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex gap-3">
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="h-20 w-14 shrink-0 rounded-md object-cover ring-1 ring-black/5"
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <h3 className="truncate font-bold text-brand-dark">
                        {b.title}
                      </h3>
                      <p className="truncate text-xs text-gray-500">{b.author}</p>
                      <span
                        className={cn(
                          "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          badge.cls
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-y-1.5 text-[11px]">
                    <dt className="font-bold uppercase tracking-wider text-gray-400">
                      ISBN
                    </dt>
                    <dd className="font-mono text-gray-600">{b.isbn}</dd>

                    <dt className="font-bold uppercase tracking-wider text-gray-400">
                      Submitted
                    </dt>
                    <dd className="text-gray-600">
                      {new Date(b.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </dd>

                    <dt className="font-bold uppercase tracking-wider text-gray-400">
                      Category
                    </dt>
                    <dd className="text-gray-600">{b.category}</dd>

                    <dt className="font-bold uppercase tracking-wider text-gray-400">
                      Publisher
                    </dt>
                    <dd className="truncate text-gray-600">{b.publisher}</dd>
                  </dl>

                  {b.description && (
                    <p className="mt-3 line-clamp-2 text-xs text-gray-500">
                      {b.description}
                    </p>
                  )}

                  <p className="mt-3 text-[11px] text-gray-400">
                    {b.status === "APPROVED" && "Approved on "}
                    {b.status === "REJECTED" && "Rejected on "}
                    {new Date(b.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </p>

                  {/* ────────── Action bar — Reject ALWAYS visible ────────── */}
                  <div className="mt-4 flex gap-2">
                    {/* Approve / Re-approve (primary, dark) */}
                    {b.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() =>
                          update.mutate({ id: b.id, status: "APPROVED" })
                        }
                        disabled={update.isPending}
                      >
                        {b.status === "REJECTED" ? (
                          <>
                            <FiRefreshCw size={11} /> Re-approve
                          </>
                        ) : (
                          <>
                            <FiCheck size={11} /> Approve
                          </>
                        )}
                      </Button>
                    )}

                    {/* Reject button — ALWAYS visible with perfect hover */}
                    {b.status !== "REJECTED" ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className={cn(
                          "flex-1 gap-1",
                          b.status === "APPROVED" && "w-full"
                        )}
                        onClick={() =>
                          update.mutate({ id: b.id, status: "REJECTED" })
                        }
                        disabled={update.isPending}
                      >
                        <FiX size={11} /> Reject
                      </Button>
                    ) : (
                      // Already rejected — show static red pill (NOT hidden)
                      <div
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
                        title="This book has already been rejected"
                      >
                        <FiX size={11} /> Already rejected
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}


