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
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-gray-500">
            No sellers in this state.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Card key={s.id} className="hover:shadow-sm">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-base font-bold text-amber-700">
                    {s.businessName
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="leading-tight">
                    <p className="font-bold text-brand-dark">
                      {s.businessName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.contactPerson} · {s.email} · +91 {s.mobile}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-400">
                      Joined{" "}
                      {new Date(s.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                      BADGE[s.status]
                    )}
                  >
                    {s.status.replace("_", " ").toLowerCase()}
                  </span>

                  {/* ── Actions — consistent pattern, all visible ── */}
                  <div className="flex gap-2">
                    {/* Approve / Re-approve (visible when NOT approved) */}
                    {s.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          update.mutate({ id: s.id, status: "APPROVED" })
                        }
                        disabled={update.isPending}
                        className="gap-1"
                      >
                        {s.status === "REJECTED" ? (
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

                    {/* Reject / Revoke — ALWAYS visible with perfect hover */}
                    {s.status !== "REJECTED" ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          update.mutate({ id: s.id, status: "REJECTED" })
                        }
                        disabled={update.isPending}
                        className="gap-1"
                      >
                        <FiX size={11} />{" "}
                        {s.status === "APPROVED" ? "Revoke" : "Reject"}
                      </Button>
                    ) : (
                      // Already rejected — visible red pill (NOT hidden)
                      <div
                        className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700"
                        title="This seller has already been rejected"
                      >
                        <FiX size={11} /> Already rejected
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

