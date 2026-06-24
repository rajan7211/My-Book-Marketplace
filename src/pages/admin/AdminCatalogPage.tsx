import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiSearch, FiX, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/api/admin.api";
import { api } from "@/api/client";
import type { BookStatus, Listing } from "@/types";
import { cn } from "@/lib/utils";

type Tab = BookStatus | "ALL";
const TABS: { value: Tab; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING_APPROVAL", label: "Pending" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_BADGE: Record<BookStatus, string> = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

function formatPrice(p: number) {
  return `₹${p.toLocaleString("en-IN")}`;
}

export default function AdminCatalogPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const { data: books, isLoading } = useQuery({
    queryKey: ["admin", "books"],
    queryFn: adminApi.getBooks,
  });

  const { data: listings } = useQuery({
    queryKey: ["admin", "listings"],
    queryFn: async () => {
      const { data } = await api.get<Listing[]>("/listings");
      return data;
    },
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "APPROVED" | "REJECTED" }) =>
      adminApi.updateBookStatus(id, status),
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["books"] });
      toast.success(
        `"${b.title}" ${b.status === "APPROVED" ? "approved" : "rejected"}`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-brand-dark">Catalog</h2>
        <p className="mt-1 text-sm text-gray-500">
          Browse the complete book catalog and inspect seller listings for each
          title. One book, multiple sellers.
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setTab(t.value);
                setPage(1);
              }}
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
            placeholder="Search the catalog…"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
          />
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <Button
          variant="dark"
          size="sm"
          onClick={() => toast.info("New book creation is simulated from Seller Dashboard.")}
        >
          + Add book to catalog
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <p className="text-lg font-medium">No books found</p>
          <p className="text-sm text-gray-500 mt-1">Try changing the filter or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pageItems.map((book) => {
            const bookListings = (listings ?? []).filter(
              (l) => l.bookId === book.id
            );
            const minPrice = bookListings.length
              ? Math.min(...bookListings.map((l) => l.price))
              : null;

            return (
              <div
                key={book.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
              >
                <div className="flex gap-4">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="h-20 w-14 rounded-lg object-cover ring-1 ring-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-brand-dark line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      {book.isbn}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span
                    className={cn(
                      "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase",
                      STATUS_BADGE[book.status]
                    )}
                  >
                    {book.status.replace("_", " ").toLowerCase()}
                  </span>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">Listings</p>
                    <p className="font-semibold">
                      {bookListings.length} • {minPrice ? formatPrice(minPrice) : "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t flex gap-3">
                  {book.status !== "APPROVED" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatus.mutate({ id: book.id, status: "APPROVED" })
                      }
                      disabled={updateStatus.isPending}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <FiCheck size={15} /> Approve
                    </Button>
                  )}

                  {book.status !== "REJECTED" ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatus.mutate({ id: book.id, status: "REJECTED" })
                      }
                      disabled={updateStatus.isPending}
                      className="flex-1 bg-black text-white hover:bg-gray-900"
                    >
                      <FiX size={15} /> Reject
                    </Button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600">
                      Already Rejected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "h-8 min-w-8 rounded-md px-3 text-xs font-semibold transition",
                  p === safePage
                    ? "bg-brand-dark text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
