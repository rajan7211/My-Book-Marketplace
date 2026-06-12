import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiUsers, FiUser, FiBookOpen, FiPackage } from "react-icons/fi";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/api/admin.api";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
  });

  // PDF dashboard requirement: Total Sellers / Customers / Books / Orders
  const cards = [
    {
      label: "Total Sellers",
      value: stats?.totalSellers,
      icon: FiUsers,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Total Customers",
      value: stats?.totalCustomers,
      icon: FiUser,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Total Books",
      value: stats?.totalBooks,
      icon: FiBookOpen,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders,
      icon: FiPackage,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${color}`}>
                <Icon size={20} />
              </span>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold">{isLoading ? "…" : value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending approvals call-to-action */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Link to="/admin/sellers">
          <Card className="transition hover:shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-bold">Pending Seller Approvals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review and approve new seller registrations.
                </p>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-lg font-bold text-amber-600">
                {stats?.pendingSellers ?? 0}
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/books">
          <Card className="transition hover:shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-bold">Pending Book Approvals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Review books submitted by sellers before they go live.
                </p>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-lg font-bold text-amber-600">
                {stats?.pendingBooks ?? 0}
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </AdminLayout>
  );
}




