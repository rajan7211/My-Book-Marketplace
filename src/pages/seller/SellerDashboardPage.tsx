import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiBookOpen,
  FiPackage,
  FiAlertTriangle,
  FiTrendingUp,
} from "react-icons/fi";
import { SellerLayout } from "./SellerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { sellerApi } from "@/api/seller.api";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/utils";

export default function SellerDashboardPage() {
  const { user } = useAuthStore();
  const sellerId = user!.sellerId!;

  const { data: listings, isLoading: loadingListings } = useQuery({
    queryKey: ["seller", "listings", sellerId],
    queryFn: () => sellerApi.getMyListings(sellerId),
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ["seller", "orders", sellerId],
    queryFn: () => sellerApi.getMyOrders(sellerId),
  });

  const lowStock = listings?.filter((l) => l.stock > 0 && l.stock <= 5) ?? [];
  const outOfStock = listings?.filter((l) => l.stock === 0) ?? [];
  const newOrders = orders?.filter((o) => o.status === "CREATED") ?? [];
  const revenue =
    orders
      ?.filter((o) => o.status !== "CANCELLED")
      .reduce((s, o) => s + o.totalAmount, 0) ?? 0;

  const stats = [
    {
      label: "Active Listings",
      value: listings?.length ?? 0,
      icon: FiBookOpen,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "New Orders",
      value: newOrders.length,
      icon: FiPackage,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Out of Stock",
      value: outOfStock.length,
      icon: FiAlertTriangle,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Revenue (non-cancelled)",
      value: formatPrice(revenue),
      icon: FiTrendingUp,
      color: "bg-green-100 text-green-600",
    },
  ];

  return (
    <SellerLayout>
      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${color}`}>
                <Icon size={20} />
              </span>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold">
                  {loadingListings || loadingOrders ? "…" : value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Low stock alerts */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Low Stock Alerts</h2>
              <Link
                to="/seller/inventory"
                className="text-xs font-semibold text-brand-yellow-dark hover:underline"
              >
                Manage Inventory →
              </Link>
            </div>
            {loadingListings ? (
              <Skeleton className="h-32" />
            ) : lowStock.length === 0 && outOfStock.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                All listings are well stocked 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {[...outOfStock, ...lowStock].slice(0, 5).map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5"
                  >
                    <span className="truncate text-sm font-medium">
                      {l.book?.title}
                    </span>
                    <Badge variant={l.stock === 0 ? "destructive" : "warning"}>
                      {l.stock === 0 ? "Out of stock" : `${l.stock} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">Recent Orders</h2>
              <Link
                to="/seller/orders"
                className="text-xs font-semibold text-brand-yellow-dark hover:underline"
              >
                Process Orders →
              </Link>
            </div>
            {loadingOrders ? (
              <Skeleton className="h-32" />
            ) : !orders?.length ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No orders yet.
              </p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm"
                  >
                    <span className="font-medium">Order #{o.id}</span>
                    <span className="text-gray-500">
                      {formatPrice(o.totalAmount)}
                    </span>
                    <Badge
                      variant={
                        o.status === "CREATED"
                          ? "warning"
                          : o.status === "CANCELLED"
                            ? "destructive"
                            : o.status === "DELIVERED"
                              ? "success"
                              : "default"
                      }
                    >
                      {o.status.toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}






