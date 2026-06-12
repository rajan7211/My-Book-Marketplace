import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiPackage } from "react-icons/fi";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ordersApi } from "@/api/orders.api";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice, cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_STEPS: OrderStatus[] = ["CREATED", "ACCEPTED", "SHIPPED", "DELIVERED"];

const STATUS_BADGE: Record<OrderStatus, { label: string; variant: "default" | "success" | "warning" | "destructive" | "dark" }> = {
  CREATED: { label: "Created", variant: "warning" },
  ACCEPTED: { label: "Accepted", variant: "default" },
  SHIPPED: { label: "Shipped", variant: "dark" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

function OrderTracker({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
        This order was cancelled.
      </p>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold",
                i <= currentIdx
                  ? "bg-brand-yellow text-brand-dark"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                "mt-1.5 text-[10px] font-medium capitalize",
                i <= currentIdx ? "text-brand-dark" : "text-gray-400"
              )}
            >
              {step.toLowerCase()}
            </span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div
              className={cn(
                "mx-1.5 mb-4 h-0.5 flex-1",
                i < currentIdx ? "bg-brand-yellow" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", "customer", user?.customerId],
    queryFn: () => ordersApi.getCustomerOrders(user!.customerId!),
    enabled: Boolean(user?.customerId),
  });

  return (
    <div className="flex min-h-screen flex-col bg-brand-gray">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-8 font-serif text-3xl font-bold">My Orders</h1>

        {isLoading ? (
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : !orders?.length ? (
          <div className="rounded-xl bg-white py-24 text-center shadow-sm">
            <FiPackage className="mx-auto text-gray-300" size={56} />
            <h2 className="mt-4 text-lg font-semibold">No orders yet</h2>
            <p className="mt-1 text-sm text-gray-500">
              Your placed orders will appear here with live status tracking.
            </p>
            <Link to="/books">
              <Button className="mt-6">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const badge = STATUS_BADGE[order.status];
              return (
                <Card key={order.id}>
                  <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-gray-100 pb-4">
                    <div>
                      <p className="text-sm font-bold">Order #{order.id}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        <span className="mx-2 text-gray-300">|</span>
                        Sold by{" "}
                        <span className="font-medium text-brand-dark">
                          {order.sellerName}
                        </span>
                      </p>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="h-16 w-12 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/books/${item.bookId}`}
                            className="truncate text-sm font-semibold hover:text-brand-yellow-dark"
                          >
                            {item.title}
                          </Link>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="text-sm font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}

                    <div className="rounded-lg bg-gray-50 p-4">
                      <OrderTracker status={order.status} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <p className="max-w-[60%] truncate text-xs text-gray-500">
                        📍 {order.shippingAddress}
                      </p>
                      <p className="font-bold">
                        Total: {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}



