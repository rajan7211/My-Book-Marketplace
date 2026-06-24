import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/api/admin.api";
import { useAuthStore } from "@/store/auth.store";

export default function AdminCustomersPage() {
  const navigate = useNavigate();
  const { impersonate } = useAuthStore();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: adminApi.getCustomers,
  });

  const filtered = (data ?? []).filter((c) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(needle) ||
      c.lastName.toLowerCase().includes(needle) ||
      c.email.toLowerCase().includes(needle)
    );
  });

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-brand-dark">Customers</h2>
        <p className="mt-1 text-sm text-gray-500">
          Registered buyers on the marketplace. Login as any customer to debug
          their experience.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
          />
        </div>
        <span className="text-xs text-gray-500">
          {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
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
            No customers found.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-3 py-4">Email</th>
                  <th className="px-3 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-purple-100 text-purple-600">
                          <FiUser size={14} />
                        </span>
                        <p className="font-semibold text-brand-dark">
                          {c.firstName} {c.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-500">{c.email}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button
                        size="sm"
                        variant="dark"
                        onClick={() => {
                          impersonate({
                            userId: c.userId,
                            email: c.email,
                            name: `${c.firstName} ${c.lastName}`,
                            role: "CUSTOMER",
                            customerId: c.id,
                          });
                          navigate("/orders");
                        }}
                      >
                        Login as
                      </Button>
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

