import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiSearch,
  FiChevronDown,
  FiEye,
  FiTrash2,
  FiX,
  FiRefreshCw,
  FiCheck,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/api/admin.api";
import { api } from "@/api/client";
import type { Book, BookStatus, Listing, Seller } from "@/types";
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
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
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

  const { data: sellers } = useQuery({
    queryKey: ["admin", "sellers"],
    queryFn: adminApi.getSellers,
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
    mutationFn: ({ id, status }: { id: number; status: BookStatus }) =>
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

  const sellerById = (id: number) => sellers?.find((s) => s.id === id);

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
        <Button variant="dark" size="sm">
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


  // BookRow (expandable)

function BookRow({
  book,
  listings,
  minPrice,
  sellerById,
  isOpen,
  onToggle,
  onApprove,
  onReject,
  onDelete,
  updatePending,
}: {
  book: Book;
  listings: Listing[];
  minPrice: number | null;
  sellerById: (id: number) => Seller | undefined;
  isOpen: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  updatePending: boolean;
}) {
  return (
    <>
      <tr className="hover:bg-gray-50/50">
        <td className="px-3 py-3 align-top">
          <button
            onClick={onToggle}
            className={cn(
              "grid h-6 w-6 place-items-center rounded-md border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-100",
              isOpen && "bg-brand-dark text-white border-brand-dark"
            )}
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            <FiChevronDown
              size={12}
              className={cn("transition-transform", isOpen && "rotate-180")}
            />
          </button>
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-3">
            <img
              src={book.coverImage}
              alt=""
              className="h-10 w-7 shrink-0 rounded object-cover ring-1 ring-black/5"
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate font-semibold text-brand-dark">
                {book.title}
              </p>
              <p className="font-mono text-[10px] text-gray-500">{book.isbn}</p>
              <button
                onClick={onToggle}
                className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:underline"
              >
                <FiEye size={11} /> View
              </button>
            </div>
          </div>
        </td>
        <td className="px-3 py-3">
          <span
            className={cn(
              "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
              STATUS_BADGE[book.status]
            )}
          >
            {book.status === "PENDING_APPROVAL"
              ? "Pending"
              : book.status === "APPROVED"
                ? "Approved"
                : "Rejected"}
          </span>
        </td>
        <td className="px-3 py-3">
          {listings.length === 0 ? (
            <span className="text-xs text-gray-400">No listings</span>
          ) : (
            <div className="leading-tight">
              <p className="font-semibold text-brand-dark">
                {listings.length} listing{listings.length !== 1 ? "s" : ""}
              </p>
              <p className="text-[11px] text-gray-500">
                of listings – from {formatPrice(minPrice ?? 0)}
              </p>
            </div>
          )}
        </td>
        <td className="px-3 py-3 text-xs text-gray-500">
          {new Date(book.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}
        </td>
        <td className="px-6 py-3 text-right">
          {/*  Actions — Reject always visible with perfect hover */}
          <div className="flex justify-end gap-2">
            {/* Approve / Re-approve (only when not already approved) */}
            {book.status !== "APPROVED" && (
              <Button
                size="sm"
                variant="default"
                onClick={onApprove}
                disabled={updatePending}
                className="gap-1"
              >
                {book.status === "REJECTED" ? (
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

            {/* Reject — ALWAYS visible */}
            {book.status !== "REJECTED" ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={onReject}
                disabled={updatePending}
                className="gap-1"
              >
                <FiX size={11} /> Reject
              </Button>
            ) : (
              // Already rejected -visible pill, NOT hidden
              <div
                className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700"
                title="This book has already been rejected"
              >
                <FiX size={11} /> Already rejected
              </div>
            )}

            {/* Delete (always available) */}
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="gap-1"
            >
              <FiTrash2 size={11} /> Delete
            </Button>
          </div>
        </td>
      </tr>

      {/* Expanded seller listings */}
      {isOpen && (
        <tr className="bg-gray-50/50">
          <td colSpan={6} className="px-6 pb-4 pt-1">
            <div className="ml-9 rounded-lg border border-gray-100 bg-white p-4">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Seller listings for this book
              </p>
              {listings.length === 0 ? (
                <p className="py-3 text-sm text-gray-500">
                  No seller listings yet.
                </p>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <th className="pb-2">Seller</th>
                      <th className="pb-2">Price</th>
                      <th className="pb-2">Stock</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {listings.map((l) => {
                      const seller = sellerById(l.sellerId);
                      return (
                        <tr key={l.id}>
                          <td className="py-2.5 font-semibold text-brand-dark">
                            {seller?.businessName ?? `Seller #${l.sellerId}`}
                          </td>
                          <td className="py-2.5 font-bold">
                            {formatPrice(l.price)}
                          </td>
                          <td className="py-2.5">{l.stock}</td>
                          <td className="py-2.5">
                            {l.stock > 0 ? (
                              <span className="font-semibold text-emerald-600">
                                In stock
                              </span>
                            ) : (
                              <span className="font-semibold text-red-600">
                                Out of stock
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}







