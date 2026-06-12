import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  /**
   * Rule 4: cart stores LISTING information (seller-specific offer),
   * never just the book. The same book from two different sellers
   * is two separate cart lines.
   */
  addItem: (item: CartItem) => { ok: boolean; message: string };
  updateQuantity: (listingId: number, quantity: number) => void;
  removeItem: (listingId: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.listingId === item.listingId
        );
        const newQty = (existing?.quantity ?? 0) + item.quantity;

        // Rule 5: never allow more than available stock
        if (newQty > item.stock) {
          return {
            ok: false,
            message: `Only ${item.stock} in stock for this seller. You already have ${existing?.quantity ?? 0} in cart.`,
          };
        }

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.listingId === item.listingId ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
        return { ok: true, message: "Added to cart" };
      },

      updateQuantity: (listingId, quantity) =>
        set({
          items: get().items.map((i) =>
            i.listingId === listingId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
              : i
          ),
        }),

      removeItem: (listingId) =>
        set({ items: get().items.filter((i) => i.listingId !== listingId) }),

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "wk-cart" }
  )
);




