import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { SellerLayout } from "./SellerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { sellerApi, SELLER_TRANSITIONS } from "@/api/seller.api";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { motion } from "framer-motion";

const BADGE: Record<OrderStatus, "warning" | "default" | "dark" | "success" | "destructive"> = {
  CREATED: "warning",
  ACCEPTED: "default",
  SHIPPED: "dark",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

const NEXT_STATE_BUTTON_LABEL: Record<OrderStatus, string> = {
  CREATED: "—",
  ACCEPTED: "Accept Order",
  SHIPPED: "Mark as Shipped",
  DELIVERED: "Mark as Delivered",
  CANCELLED: "Cancel Order",
};

export default function SellerOrdersPage() {
  const { user } = useAuthStore();
  const sellerId = user?.sellerId;
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["seller", "orders", sellerId],
    queryFn: () => sellerApi.getMyOrders(sellerId!),
    enabled: !!sellerId,
  });

  const updateStatus = useMutation({
    mutationFn: ({ orderId, next }: { orderId: number; next: OrderStatus }) =>
      sellerApi.updateOrderStatus(orderId, sellerId!, next),

    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });

      if (order.status === "CANCELLED") {
        toast.info(`Order #${order.id} cancelled — stock restored.`);
      } else {
        toast.success(`Order #${order.id} → ${order.status.toLowerCase()}`);
      }
    },

    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SellerLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Orders</h2>
        <p className="text-sm text-gray-500">
          Process orders: Created → Accepted → Shipped → Delivered
        </p>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : !orders?.length ? (
        /* Empty */
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Orders will appear when customers buy your books.
          </p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map((order, i) => {
            const nextStates = SELLER_TRANSITIONS[order.status];

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">Order #{order.id}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <Badge variant={BADGE[order.status]}>
                    {order.status.toLowerCase()}
                  </Badge>
                </div>

                {/* Items */}
                <div className="mt-5 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="h-12 w-9 rounded object-cover ring-1 ring-gray-100"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="font-semibold text-sm">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-5 pt-4 border-t space-y-4">
                  <div className="text-xs text-gray-500">
                    📍 {order.shippingAddress}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">Total</span>
                      <p className="font-bold text-lg">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap justify-end">
                      {nextStates
                        .filter((s) => s !== "CANCELLED")
                        .map((next) => (
                          <Button
                            key={next}
                            size="sm"
                            onClick={() =>
                              updateStatus.mutate({
                                orderId: order.id,
                                next,
                              })
                            }
                            disabled={updateStatus.isPending}
                          >
                            {NEXT_STATE_BUTTON_LABEL[next]}
                          </Button>
                        ))}

                      {nextStates.includes("CANCELLED") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Cancel order #${order.id}? Stock will be restored.`
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
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </SellerLayout>
  );
}