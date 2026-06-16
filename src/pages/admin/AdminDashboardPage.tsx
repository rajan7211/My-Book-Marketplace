import { useQuery } from "@tanstack/react-query";
import {
  FiUsers,
  FiUser,
  FiBookOpen,
  FiPackage,
  FiArrowRight,
} from "react-icons/fi";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "react-toastify";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/api/admin.api";

const STAT_CARDS = [
  {
    label: "Total Sellers",
    key: "totalSellers",
    sub: "active sellers",
    icon: FiUsers,
    bg: "bg-amber-100",
    fg: "text-amber-600",
  },
  {
    label: "Total Customers",
    key: "totalCustomers",
    sub: "registered buyers",
    icon: FiUser,
    bg: "bg-purple-100",
    fg: "text-purple-600",
  },
  {
    label: "Total Books",
    key: "totalBooks",
    sub: "catalog up to date",
    icon: FiBookOpen,
    bg: "bg-emerald-100",
    fg: "text-emerald-600",
  },
  {
    label: "Total Orders",
    key: "totalOrders",
    sub: "orders yet",
    icon: FiPackage,
    bg: "bg-blue-100",
    fg: "text-blue-600",
  },
] as const;

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
  });

  const { data: sellers } = useQuery({
    queryKey: ["admin", "sellers"],
    queryFn: adminApi.getSellers,
  });
  const { data: customers } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: adminApi.getCustomers,
  });

  const approvedSellers = (sellers ?? []).filter(
    (s) => s.status === "APPROVED"
  );

  //  in a real app, this would create an admin session token for the user.
  const handleLoginAs = (kind: "seller" | "customer", name: string) => {
    toast.info(
      `Login-as-${kind}: "${name}" — backend hook needed to swap sessions.`
    );
  };

  return (
    <AdminLayout>
      {/* Intro */}
      <p className="mb-6 text-sm text-gray-500">
        Overview of sellers, customers, books, and order activity across the
        marketplace.
      </p>

      {/* ── Stat cards ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ label, key, sub, icon: Icon, bg, fg }) => (
          <Card key={label}>
            <CardContent className="flex items-start gap-4 p-5">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${bg} ${fg}`}>
                <Icon size={22} />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-dark">
                  {isLoading ? "…" : stats?.[key] ?? 0}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Pending approvals ── */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-600">
                  <FiUsers size={20} />
                </span>
                <div>
                  <p className="text-base font-bold text-brand-dark">
                    Seller approvals
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats?.pendingSellers ?? 0} pending reviews
                  </p>
                </div>
              </div>
              <a
                href="/admin/sellers"
                className="flex items-center gap-1 text-sm font-medium text-brand-dark hover:underline"
              >
                Review <FiArrowRight size={14} />
              </a>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <span className="h-2 w-2 rounded-full bg-gray-300" />
              {approvedSellers.length > 0
                ? `${stats?.pendingSellers ?? 0} seller${
                    (stats?.pendingSellers ?? 0) === 1 ? "" : "s"
                  } waiting for review.`
                : "No sellers waiting for review."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
                  <FiBookOpen size={20} />
                </span>
                <div>
                  <p className="text-base font-bold text-brand-dark">
                    Book approvals
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats?.pendingBooks ?? 0} pending reviews
                  </p>
                </div>
              </div>
              <a
                href="/admin/books"
                className="flex items-center gap-1 text-sm font-medium text-brand-dark hover:underline"
              >
                Review <FiArrowRight size={14} />
              </a>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <span className="h-2 w-2 rounded-full bg-gray-300" />
              {stats?.pendingBooks
                ? `${stats.pendingBooks} book${
                    stats.pendingBooks === 1 ? "" : "s"
                  } waiting for review.`
                : "No books waiting for review."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Login as user ── */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-brand-dark">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-purple-100 text-purple-600">
                  <FiUser size={14} />
                </span>
                Login as a user
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Jump into any approved seller or customer account to debug
                what they see in the marketplace. Use the yellow banner to exit.
              </p>
            </div>
            <span className="text-xs font-medium text-gray-400">
              {(approvedSellers.length + (customers?.length ?? 0))} users
              available
            </span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* ── Sellers column ── */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Approved sellers ({approvedSellers.length})
              </p>
              <div className="space-y-2">
                {approvedSellers.length === 0 && (
                  <p className="text-sm text-gray-400">No approved sellers.</p>
                )}
                {approvedSellers.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 hover:bg-gray-50"
                  >
                    <div className="leading-tight">
                      <p className="font-semibold text-brand-dark">
                        {s.businessName}
                      </p>
                      <p className="text-[11px] text-gray-500">{s.email}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="dark"
                      onClick={() => handleLoginAs("seller", s.businessName)}
                    >
                      Login as
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Customers column ── */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Customers ({customers?.length ?? 0})
              </p>
              <div className="space-y-2">
                {(customers ?? []).length === 0 && (
                  <p className="text-sm text-gray-400">No customers.</p>
                )}
                {(customers ?? []).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 hover:bg-gray-50"
                  >
                    <div className="leading-tight">
                      <p className="font-semibold text-brand-dark">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        user{c.id}@bookhub.com
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="dark"
                      onClick={() =>
                        handleLoginAs(
                          "customer",
                          `${c.firstName} ${c.lastName}`
                        )
                      }
                    >
                      Login as
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}





