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
import type { BookStatus } from "@/types";

const FILTERS: { value: BookStatus | "ALL"; label: string }[] = [
  { value: "PENDING_APPROVAL", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
];

const BADGE: Record<BookStatus, "warning" | "success" | "destructive"> = {
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

export default function AdminBooksPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<BookStatus | "ALL">("PENDING_APPROVAL");

  const { data: books, isLoading } = useQuery({
    queryKey: ["admin", "books"],
    queryFn: adminApi.getBooks,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "APPROVED" | "REJECTED" }) =>
      adminApi.updateBookStatus(id, status),
    onSuccess: (book) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      toast.success(
        `"${book.title}" ${book.status === "APPROVED" ? "approved — now visible in the marketplace ✅" : "rejected ❌"}`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered =
    filter === "ALL" ? books : books?.filter((b) => b.status === filter);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Book Management</h2>
          <p className="text-sm text-gray-500">
            Only approved books are visible to customers (Rule 7).
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
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : !filtered?.length ? (
            <p className="py-16 text-center text-sm text-gray-500">
              No books in this state.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-4">Book</th>
                  <th className="px-4 py-4">ISBN</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Publisher</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.coverImage}
                          alt=""
                          className="h-12 w-9 rounded object-cover"
                        />
                        <div>
                          <p className="font-semibold">{b.title}</p>
                          <p className="text-xs text-gray-500">{b.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{b.isbn}</td>
                    <td className="px-4 py-3">{b.category}</td>
                    <td className="px-4 py-3 text-gray-500">{b.publisher}</td>
                    <td className="px-4 py-3">
                      <Badge variant={BADGE[b.status]}>
                        {b.status.replace("_", " ").toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {b.status === "PENDING_APPROVAL" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateStatus.mutate({ id: b.id, status: "APPROVED" })
                            }
                            disabled={updateStatus.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updateStatus.mutate({ id: b.id, status: "REJECTED" })
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



