import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  activeUserId: string | number | null;
  userCarts: Record<string, CartItem[]>;
  switchUser: (userId: string | number | null) => void;
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
      activeUserId: null,
      userCarts: {},

      switchUser: (userId) => {
        const carts = get().userCarts;
        set({
          activeUserId: userId,
          items: userId ? (carts[userId] ?? []) : [],
        });
      },

      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.listingId === item.listingId
        );
        const newQty = (existing?.quantity ?? 0) + item.quantity;

        if (newQty > item.stock) {
          return {
            ok: false,
            message: `Only ${item.stock} in stock for this seller. You already have ${existing?.quantity ?? 0} in cart.`,
          };
        }

        const newItems = existing
          ? get().items.map((i) =>
              i.listingId === item.listingId ? { ...i, quantity: newQty } : i
            )
          : [...get().items, item];

        const uid = get().activeUserId;
        const newUserCarts = uid
          ? { ...get().userCarts, [uid]: newItems }
          : get().userCarts;

        set({ items: newItems, userCarts: newUserCarts });
        return { ok: true, message: "Added to cart" };
      },

      updateQuantity: (listingId, quantity) => {
        const newItems = get().items.map((i) =>
          i.listingId === listingId
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
            : i
        );
        const uid = get().activeUserId;
        const newUserCarts = uid
          ? { ...get().userCarts, [uid]: newItems }
          : get().userCarts;
        set({ items: newItems, userCarts: newUserCarts });
      },

      removeItem: (listingId) => {
        const newItems = get().items.filter((i) => i.listingId !== listingId);
        const uid = get().activeUserId;
        const newUserCarts = uid
          ? { ...get().userCarts, [uid]: newItems }
          : get().userCarts;
        set({ items: newItems, userCarts: newUserCarts });
      },

      clear: () => {
        const uid = get().activeUserId;
        const newUserCarts = uid
          ? { ...get().userCarts, [uid]: [] }
          : get().userCarts;
        set({ items: [], userCarts: newUserCarts });
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "wk-cart" }
  )
);
