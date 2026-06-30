import { mockApi as api } from "./mock-client";
import { api as realApi } from "./client";
import { unwrap } from "@/lib/api-helpers";
import type { ApiEnvelope, Book, Customer, Seller, User } from "@/types";
import type { OrderRecord } from "./orders.api";

/**
 * Backend seller documents use Mongo `_id` (string). The frontend reads `id`,
 * so we normalize every seller into the shape the UI expects.
 */
function normalizeSeller(raw: Seller & { _id?: string }): Seller {
  return { ...raw, id: raw._id ?? raw.id };
}

function normalizeBook(raw: Partial<Book> & { _id?: string; coverImage?: string; createdAt?: string }) {
  return {
    ...raw,
    id: raw._id ?? raw.id,
    coverImage: raw.coverImage ?? "",
    createdAt: raw.createdAt ?? new Date().toISOString(),
  } as Book;
}

export interface MarketplaceStats {
  totalSellers: number;
  totalCustomers: number;
  totalBooks: number;
  totalOrders: number;
  pendingSellers: number;
  pendingBooks: number;
}

export interface CustomerWithEmail extends Customer {
  email: string;
}

export const adminApi = {
  async getStats(): Promise<MarketplaceStats> {
    // Sellers come from the REAL backend; the rest from the mock for now.
    const [sellers, customers, books, orders] = await Promise.all([
      this.getSellers(),
      api.get<Customer[]>("/customers"),
      api.get<Book[]>("/books"),
      api.get<OrderRecord[]>("/orders"),
    ]);
    return {
      totalSellers: sellers.length,
      totalCustomers: customers.data.length,
      totalBooks: books.data.length,
      totalOrders: orders.data.length,
      pendingSellers: sellers.filter((s) => s.status === "PENDING_APPROVAL")
        .length,
      pendingBooks: books.data.filter((b) => b.status === "PENDING_APPROVAL")
        .length,
    };
  },

  /** List ALL sellers from the real backend (admin only; JWT auto-attached). */
  async getSellers(): Promise<Seller[]> {
    const { data } = await realApi.get<ApiEnvelope<(Seller & { _id?: string })[]>>(
      "/admin/sellers"
    );
    return unwrap(data).map(normalizeSeller);
  },

  async updateSellerStatus(
    sellerId: string | number,
    status: "APPROVED" | "REJECTED",
    reason?: string
  ): Promise<Seller> {
    const path =
      status === "APPROVED"
        ? `/admin/sellers/${sellerId}/approve`
        : `/admin/sellers/${sellerId}/reject`;
    const { data } = await realApi.patch<ApiEnvelope<Seller & { _id?: string }>>(
      path,
      status === "REJECTED" ? { reason: reason ?? "" } : {}
    );
    return normalizeSeller(unwrap(data));
  },

  async getBooks(): Promise<Book[]> {
    const { data } = await realApi.get<
      ApiEnvelope<{
        data: (Book & { _id?: string })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>
    >("/admin/books", {
      params: { page: 1, limit: 100 },
    });

    const payload = unwrap(data);
    return payload.data.map(normalizeBook);
  },

  /** Approve / Reject a book */
  async updateBookStatus(
    bookId: string | number,
    status: "APPROVED" | "REJECTED"
  ): Promise<Book> {
    const path =
      status === "APPROVED"
        ? `/admin/books/${bookId}/approve`
        : `/admin/books/${bookId}/reject`;

    const { data } = await realApi.patch<ApiEnvelope<Book & { _id?: string }>>(
      path,
      status === "REJECTED" ? { reason: "Rejected by admin" } : {}
    );

    return normalizeBook(unwrap(data));
  },

  /** Customers joined with their user email */
  async getCustomers(): Promise<CustomerWithEmail[]> {
    const [{ data: customers }, { data: users }] = await Promise.all([
      api.get<Customer[]>("/customers", {
        params: { _sort: "createdAt", _order: "desc" },
      }),
      api.get<User[]>("/users"),
    ]);
    return customers.map((c) => ({
      ...c,
      email: users.find((u) => u.id === c.userId)?.email ?? "—",
    }));
  },

  async getOrders(): Promise<OrderRecord[]> {
    const { data } = await api.get<OrderRecord[]>("/orders", {
      params: { _sort: "createdAt", _order: "desc" },
    });
    return data;
  },
};


