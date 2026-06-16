import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiPackage } from "react-icons/fi";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/api/admin.api";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_BADGE: Record<OrderStatus, string> = {
  CREATED: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-amber-100 text-amber-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatPrice(p: number) {
  return `₹${p.toLocaleString("en-IN")}`;
}

export default function AdminOrdersPage() {
  const [q, setQ] = useState("");
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: adminApi.getOrders,
  });

  const filtered = (orders ?? []).filter((o) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      String(o.id).includes(needle) ||
      o.sellerName.toLowerCase().includes(needle) ||
      o.shippingAddress.toLowerCase().includes(needle)
    );
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-brand-dark">Orders</h2>
        <p className="mt-1 text-sm text-gray-500">
          Every order placed on the marketplace. One order is created per
          seller per checkout.
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order #, seller, address…"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
          />
        </div>
        <span className="text-xs text-gray-500">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-gray-500">
            <FiPackage size={28} className="mx-auto mb-2 text-gray-300" />
            <p>No orders placed yet.</p>
            <p className="mt-1 text-xs text-gray-400">
              Orders will appear here as soon as customers check out.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-3 py-4">Seller</th>
                  <th className="px-3 py-4">Total</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Placed</th>
                  <th className="px-6 py-4">Ship to</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-mono font-semibold text-brand-dark">
                      #{o.id}
                    </td>
                    <td className="px-3 py-3">{o.sellerName}</td>
                    <td className="px-3 py-3 font-bold">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                          STATUS_BADGE[o.status]
                        )}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-500">
                      <p className="line-clamp-1 max-w-[260px]">
                        {o.shippingAddress}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}


