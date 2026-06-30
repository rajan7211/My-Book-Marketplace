// Most seller features still use the mock json-server (port 4000) until the
// seller module is fully migrated to the real backend.
import { mockApi as api } from "./mock-client";
import { api as realApi } from "./client";
import { unwrap } from "@/lib/api-helpers";
import type { ApiEnvelope, Book, Listing, OrderStatus, Seller } from "@/types";
import type { OrderRecord, OrderItemRecord } from "./orders.api";

export interface ListingWithBook extends Listing {
  book?: Book;
}

export interface CreateListingPayload {
  sellerId: string | number;
  bookId: number;
  price: number;
  mrp: number;
  stock: number;
}

export interface CreateBookPayload {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  description: string;
  category: string;
  image: File;
  tags?: string[];
}

/** Allowed order status transitions for a seller */
export const SELLER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export const sellerApi = {
  /** Fetch a single seller's profile details */
  async getSeller(sellerId: string | number): Promise<Seller> {
    const { data } = await api.get<Seller>(`/sellers/${sellerId}`);
    return data;
  },

  /** All listings owned by this seller (Rule 3: inventory belongs to seller) */
  async getMyListings(sellerId: string | number): Promise<ListingWithBook[]> {
    const [{ data: listings }, { data: books }] = await Promise.all([
      api.get<Listing[]>("/listings", {
        params: { sellerId, _sort: "createdAt", _order: "desc" },
      }),
      api.get<Book[]>("/books"),
    ]);
    const bookMap = new Map(books.map((b) => [b.id, b]));
    return listings.map((l) => ({ ...l, book: bookMap.get(l.bookId) }));
  },

  /** Books available for "Scenario A" listing creation (approved books) */
  async getApprovedBooks(): Promise<Book[]> {
    const { data } = await api.get<Book[]>("/books", {
      params: { status: "APPROVED", _sort: "title", _order: "asc" },
    });
    return data;
  },

  /**
   * Scenario B: seller submits a NEW book.
   * Only this action is now connected to the real NestJS backend so the seller
   * can upload a real cover image via multipart/form-data.
   */
  async createBook(payload: CreateBookPayload): Promise<Book> {
    const formData = new FormData();
    formData.append("image", payload.image);
    formData.append("isbn", payload.isbn);
    formData.append("title", payload.title);
    formData.append("author", payload.author);
    formData.append("publisher", payload.publisher);
    formData.append("description", payload.description);
    formData.append("category", payload.category);

    payload.tags?.forEach((tag) => {
      formData.append("tags", tag);
    });

    const { data } = await realApi.post<ApiEnvelope<Book>>("/books", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return unwrap(data);
  },

  /**
   * Create a listing. Guards:
   * - one listing per (seller, book) pair — update instead of duplicating
   * - book must be APPROVED (Rule 7)
   */
  async createListing(payload: CreateListingPayload): Promise<Listing> {
    const { data: book } = await api.get<Book>(`/books/${payload.bookId}`);
    if (book.status !== "APPROVED") {
      throw new Error(
        "This book is still pending admin approval. You can create the listing once it is approved."
      );
    }

    const { data: dupes } = await api.get<Listing[]>("/listings", {
      params: { sellerId: payload.sellerId, bookId: payload.bookId },
    });
    if (dupes.length > 0) {
      throw new Error(
        "You already have a listing for this book. Update its price/stock from Inventory instead."
      );
    }

    const { data } = await api.post<Listing>("/listings", {
      ...payload,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    });
    return data;
  },

  async updateListing(
    listingId: number,
    sellerId: string | number,
    changes: Partial<Pick<Listing, "price" | "mrp" | "stock" | "status">>
  ): Promise<Listing> {
    const { data: listing } = await api.get<Listing>(`/listings/${listingId}`);
    if (listing.sellerId !== sellerId) {
      throw new Error("Forbidden: you cannot modify another seller's listing.");
    }
    if (changes.stock !== undefined && changes.stock < 0) {
      throw new Error("Stock cannot be negative.");
    }
    if (changes.price !== undefined && changes.price <= 0) {
      throw new Error("Price must be greater than zero.");
    }
    const { data } = await api.patch<Listing>(`/listings/${listingId}`, changes);
    return data;
  },

  /** Orders that belong to this seller, with their items */
  async getMyOrders(sellerId: string | number) {
    const { data: orders } = await api.get<OrderRecord[]>("/orders", {
      params: { sellerId, _sort: "createdAt", _order: "desc" },
    });
    const { data: allItems } = await api.get<OrderItemRecord[]>("/orderItems");
    return orders.map((o) => ({
      ...o,
      items: allItems.filter((i) => i.orderId === o.id),
    }));
  },

  async updateOrderStatus(
    orderId: number,
    sellerId: string | number,
    next: OrderStatus
  ): Promise<OrderRecord> {
    const { data: order } = await api.get<OrderRecord>(`/orders/${orderId}`);
    if (order.sellerId !== sellerId) {
      throw new Error("Forbidden: this order belongs to another seller.");
    }
    const allowed = SELLER_TRANSITIONS[order.status];
    if (!allowed.includes(next)) {
      throw new Error(
        `Invalid transition: ${order.status} → ${next} is not allowed.`
      );
    }

    // Cancelling → restore reserved stock to the seller's listing
    if (next === "CANCELLED") {
      const { data: items } = await api.get<OrderItemRecord[]>("/orderItems", {
        params: { orderId },
      });
      for (const item of items) {
        const { data: listing } = await api.get<Listing>(
          `/listings/${item.listingId}`
        );
        await api.patch(`/listings/${item.listingId}`, {
          stock: listing.stock + item.quantity,
        });
      }
    }

    const { data } = await api.patch<OrderRecord>(`/orders/${orderId}`, {
      status: next,
    });
    return data;
  },
};


