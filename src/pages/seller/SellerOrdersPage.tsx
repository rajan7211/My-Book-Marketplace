import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { SellerLayout } from "./SellerLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { sellerApi, SELLER_TRANSITIONS } from "@/api/seller.api";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const BADGE: Record<OrderStatus, "warning" | "default" | "dark" | "success" | "destructive"> = {
  CREATED: "warning",
  ACCEPTED: "default",
  SHIPPED: "dark",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

const ACTION_LABEL: Record<OrderStatus, string> = {
  CREATED: "—",
  ACCEPTED: "Accept Order",
  SHIPPED: "Mark as Shipped",
  DELIVERED: "Mark as Delivered",
  CANCELLED: "Cancel Order",
};

export default function SellerOrdersPage() {
  const { user } = useAuthStore();
  const sellerId = user!.sellerId!;
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["seller", "orders", sellerId],
    queryFn: () => sellerApi.getMyOrders(sellerId),
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, next }: { orderId: number; next: OrderStatus }) =>
      sellerApi.updateOrderStatus(orderId, sellerId, next),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      if (order.status === "CANCELLED") {
        toast.info(`Order #${order.id} cancelled — stock restored to your inventory.`);
      } else {
        toast.success(`Order #${order.id} → ${order.status.toLowerCase()}`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SellerLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Orders</h2>
        <p className="text-sm text-gray-500">
          Process your orders: Created → Accepted → Shipped → Delivered.
          Cancellation is allowed only before shipment.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : !orders?.length ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-gray-500">
            No orders yet. They'll appear here when customers buy from your
            listings.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const nextStates = SELLER_TRANSITIONS[order.status];
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
                    </p>
                  </div>
                  <Badge variant={BADGE[order.status]}>
                    {order.status.toLowerCase()}
                  </Badge>
                </CardHeader>

                <CardContent className="pt-5">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.coverImage}
                          alt=""
                          className="h-14 w-10 rounded object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{item.title}</p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="text-sm font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <p className="max-w-[50%] truncate text-xs text-gray-500">
                      📍 {order.shippingAddress}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">
                        Total: {formatPrice(order.totalAmount)}
                      </span>
                      {nextStates
                        .filter((s) => s !== "CANCELLED")
                        .map((next) => (
                          <Button
                            key={next}
                            size="sm"
                            onClick={() =>
                              updateStatus.mutate({ orderId: order.id, next })
                            }
                            disabled={updateStatus.isPending}
                          >
                            {ACTION_LABEL[next]}
                          </Button>
                        ))}
                      {nextStates.includes("CANCELLED") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Cancel order #${order.id}? Stock will be restored to your inventory.`
                              )
                            ) {
                              updateStatus.mutate({
                                orderId: order.id,
                                next: "CANCELLED",
                              });
                            }
                          }}
                          disabled={updateStatus.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </SellerLayout>
  );
}



