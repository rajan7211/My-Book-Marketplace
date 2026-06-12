import { api } from "./client";
import type { CartItem, Listing, OrderStatus } from "@/types";

export interface OrderRecord {
  id: number;
  customerId: number;
  sellerId: number;
  sellerName: string;
  shippingAddress: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderItemRecord {
  id: number;
  orderId: number;
  listingId: number;
  bookId: number;
  title: string;
  coverImage: string;
  price: number;
  quantity: number;
}

export interface PlaceOrderPayload {
  customerId: number;
  shippingAddress: string;
  items: CartItem[];
}

export const ordersApi = {
  /**
   * Places order(s). One order per seller (marketplace standard:
   * each seller fulfils & ships independently).
   *
   * Rule 5: stock is re-validated against the live listing and
   * must never go negative.
   */
  async placeOrder(payload: PlaceOrderPayload): Promise<OrderRecord[]> {
    // 1. Re-validate stock against live listings
    for (const item of payload.items) {
      const { data: listing } = await api.get<Listing>(
        `/listings/${item.listingId}`
      );
      if (listing.stock < item.quantity) {
        throw new Error(
          `"${item.title}" has only ${listing.stock} left with ${item.sellerName}. Please update your cart.`
        );
      }
    }

    // 2. Group items by seller -> one order per seller
    const bySeller = new Map<number, CartItem[]>();
    for (const item of payload.items) {
      const list = bySeller.get(item.sellerId) ?? [];
      list.push(item);
      bySeller.set(item.sellerId, list);
    }

    const created: OrderRecord[] = [];

    for (const [sellerId, items] of bySeller) {
      const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const { data: order } = await api.post<OrderRecord>("/orders", {
        customerId: payload.customerId,
        sellerId,
        sellerName: items[0].sellerName,
        shippingAddress: payload.shippingAddress,
        totalAmount: total,
        status: "CREATED",
        createdAt: new Date().toISOString(),
      });

      for (const item of items) {
        await api.post("/orderItems", {
          orderId: order.id,
          listingId: item.listingId,
          bookId: item.bookId,
          title: item.title,
          coverImage: item.coverImage,
          price: item.price,
          quantity: item.quantity,
        });

        // 3. Decrement seller stock (Rule 3: only this seller's inventory)
        const { data: listing } = await api.get<Listing>(
          `/listings/${item.listingId}`
        );
        await api.patch(`/listings/${item.listingId}`, {
          stock: Math.max(0, listing.stock - item.quantity),
        });
      }

      created.push(order);
    }

    return created;
  },

  async getCustomerOrders(customerId: number) {
    const { data: orders } = await api.get<OrderRecord[]>("/orders", {
      params: { customerId, _sort: "createdAt", _order: "desc" },
    });
    const { data: allItems } = await api.get<OrderItemRecord[]>("/orderItems");
    return orders.map((o) => ({
      ...o,
      items: allItems.filter((i) => i.orderId === o.id),
    }));
  },
};





