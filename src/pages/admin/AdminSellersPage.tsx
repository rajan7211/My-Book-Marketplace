import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiSearch, FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/api/admin.api";
import { cn } from "@/lib/utils";
import type { SellerStatus } from "@/types";

type Tab = SellerStatus | "ALL";
const TABS: { value: Tab; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING_APPROVAL", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const BADGE: Record<SellerStatus, string> = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminSellersPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("PENDING_APPROVAL");
  const [q, setQ] = useState("");

  const { data: sellers, isLoading } = useQuery({
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
    (sellers ?? []).forEach((s) => {
      c.ALL++;
      c[s.status]++;
    });
    return c;
  }, [sellers]);

  const filtered = (sellers ?? [])
    .filter((s) => (tab === "ALL" ? true : s.status === tab))
    .filter((s) => {
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        s.businessName.toLowerCase().includes(needle) ||
        s.contactPerson.toLowerCase().includes(needle) ||
        s.email.toLowerCase().includes(needle)
      );
    });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: SellerStatus }) =>
      adminApi.updateSellerStatus(id, status),
    onSuccess: (s) => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["books"] });
      toast.success(
        `${s.businessName} ${
          s.status === "APPROVED" ? "approved " : "rejected "
        }`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-brand-dark">Seller Approval</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve seller registrations. Only approved sellers can
          access the seller dashboard and create listings.
        </p>
      </div>

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
            placeholder="Search by business, contact, email…"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <p className="text-lg font-medium">No sellers found</p>
          <p className="text-sm text-gray-500 mt-1">Try changing the filter or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:shadow-md"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-bold text-white shadow-md">
                    {s.businessName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-brand-dark group-hover:text-amber-600 transition">
                      {s.businessName}
                    </h3>
                    <p className="text-sm text-gray-500">{s.contactPerson}</p>
                  </div>
                </div>

                <span
                  className={cn(
                    "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    BADGE[s.status]
                  )}
                >
                  {s.status.replace("_", " ").toLowerCase()}
                </span>
              </div>

              {/* Info */}
              <div className="mt-5 space-y-1.5 text-sm">
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-gray-400">📧</span> {s.email}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="text-gray-400">📱</span> +91 {s.mobile}
                </p>
                <p className="text-xs text-gray-400 pt-1">
                  Joined {new Date(s.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Actions */}
                <div className="mt-6 pt-5 border-t flex flex-wrap gap-3">
                {s.status !== "APPROVED" && (
                  <Button
                    size="sm"
                    onClick={() => update.mutate({ id: s.id, status: "APPROVED" })}
                    disabled={update.isPending}
                    className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <FiCheck size={15} /> {s.status === "REJECTED" ? "Re-approve" : "Approve"}
                  </Button>
                )}

                {s.status !== "REJECTED" ? (
                  <Button
                    size="sm"
                    onClick={() => update.mutate({ id: s.id, status: "REJECTED" })}
                    disabled={update.isPending}
                    className="flex-1 gap-2 bg-black text-white hover:bg-gray-900"
                  >
                    <FiX size={15} /> {s.status === "APPROVED" ? "Revoke" : "Reject"}
                  </Button>
                ) : (
                  <div className="flex-1 flex items-center justify-center rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600">
                    Already Rejected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}











