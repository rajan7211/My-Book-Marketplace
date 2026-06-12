import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "@/api/admin.api";
import { cn } from "@/lib/utils";
import type { SellerStatus } from "@/types";

const FILTERS: { value: SellerStatus | "ALL"; label: string }[] = [
  { value: "PENDING_APPROVAL", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
];

const BADGE: Record<SellerStatus, "warning" | "success" | "destructive"> = {
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

export default function AdminSellersPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<SellerStatus | "ALL">("PENDING_APPROVAL");

  const { data: sellers, isLoading } = useQuery({
    queryKey: ["admin", "sellers"],
    queryFn: adminApi.getSellers,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "APPROVED" | "REJECTED" }) =>
      adminApi.updateSellerStatus(id, status),
    onSuccess: (seller) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(
        `${seller.businessName} ${seller.status === "APPROVED" ? "approved ✅" : "rejected ❌"}`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered =
    filter === "ALL" ? sellers : sellers?.filter((s) => s.status === filter);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Seller Management</h2>
          <p className="text-sm text-gray-500">
            Only approved sellers can access the seller dashboard and create
            listings.
          </p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                filter === f.value
                  ? "border-brand-dark bg-brand-dark text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-brand-dark"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : !filtered?.length ? (
            <p className="py-16 text-center text-sm text-gray-500">
              No sellers in this state.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-4">Business</th>
                  <th className="px-4 py-4">Contact Person</th>
                  <th className="px-4 py-4">Email</th>
                  <th className="px-4 py-4">Mobile</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3.5 font-semibold">{s.businessName}</td>
                    <td className="px-4 py-3.5">{s.contactPerson}</td>
                    <td className="px-4 py-3.5 text-gray-500">{s.email}</td>
                    <td className="px-4 py-3.5 font-mono text-xs">{s.mobile}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={BADGE[s.status]}>
                        {s.status.replace("_", " ").toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {s.status === "PENDING_APPROVAL" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateStatus.mutate({ id: s.id, status: "APPROVED" })
                            }
                            disabled={updateStatus.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updateStatus.mutate({ id: s.id, status: "REJECTED" })
                            }
                            disabled={updateStatus.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}


