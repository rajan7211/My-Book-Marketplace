import { api } from "./client";
import type { Book, Customer, Seller } from "@/types";
import type { OrderRecord } from "./orders.api";

export interface MarketplaceStats {
  totalSellers: number;
  totalCustomers: number;
  totalBooks: number;
  totalOrders: number;
  pendingSellers: number;
  pendingBooks: number;
}

export const adminApi = {
  /** Admin dashboard: Total Sellers / Customers / Books / Orders (PDF) */
  async getStats(): Promise<MarketplaceStats> {
    const [sellers, customers, books, orders] = await Promise.all([
      api.get<Seller[]>("/sellers"),
      api.get<Customer[]>("/customers"),
      api.get<Book[]>("/books"),
      api.get<OrderRecord[]>("/orders"),
    ]);
    return {
      totalSellers: sellers.data.length,
      totalCustomers: customers.data.length,
      totalBooks: books.data.length,
      totalOrders: orders.data.length,
      pendingSellers: sellers.data.filter(
        (s) => s.status === "PENDING_APPROVAL"
      ).length,
      pendingBooks: books.data.filter((b) => b.status === "PENDING_APPROVAL")
        .length,
    };
  },

  async getSellers(): Promise<Seller[]> {
    const { data } = await api.get<Seller[]>("/sellers", {
      params: { _sort: "createdAt", _order: "desc" },
    });
    return data;
  },

  /** Approve / Reject a seller */
  async updateSellerStatus(
    sellerId: number,
    status: "APPROVED" | "REJECTED"
  ): Promise<Seller> {
    const { data } = await api.patch<Seller>(`/sellers/${sellerId}`, {
      status,
    });
    return data;
  },

  async getBooks(): Promise<Book[]> {
    const { data } = await api.get<Book[]>("/books", {
      params: { _sort: "createdAt", _order: "desc" },
    });
    return data;
  },

  /** Approve / Reject a book */
  async updateBookStatus(
    bookId: number,
    status: "APPROVED" | "REJECTED"
  ): Promise<Book> {
    const { data } = await api.patch<Book>(`/books/${bookId}`, { status });
    return data;
  },
};




