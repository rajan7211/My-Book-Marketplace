import { api } from "./client";
import type {
  Book,
  BookWithListings,
  Listing,
  PaginatedResult,
  Seller,
} from "@/types";

export type SortOption =
  | "newest"
  | "title-asc"
  | "title-desc"
  | "price-asc"
  | "price-desc";

export interface BookQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: SortOption;
  tag?: string;
}

async function attachListings(books: Book[]): Promise<BookWithListings[]> {
  const [{ data: listings }, { data: sellers }] = await Promise.all([
    api.get<Listing[]>("/listings", { params: { status: "ACTIVE" } }),
    api.get<Seller[]>("/sellers", { params: { status: "APPROVED" } }),
  ]);

  const sellerMap = new Map(sellers.map((s) => [s.id, s]));

  return books.map((book) => {
    // Rule 6: only listings from APPROVED sellers are shown
    const bookListings = listings
      .filter((l) => l.bookId === book.id && sellerMap.has(l.sellerId))
      .map((l) => ({ ...l, seller: sellerMap.get(l.sellerId) }));

    const prices = bookListings.map((l) => l.price);
    const mrps = bookListings.map((l) => l.mrp);
    return {
      ...book,
      listings: bookListings,
      minPrice: prices.length ? Math.min(...prices) : undefined,
      maxMrp: mrps.length ? Math.max(...mrps) : undefined,
    };
  });
}

export const booksApi = {
  /**
   * Paginated + searchable + sortable book catalog.
   * Rule 7: only APPROVED books are visible to customers.
   */
  async getBooks(
    params: BookQueryParams
  ): Promise<PaginatedResult<BookWithListings>> {
    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      sort = "newest",
      tag,
    } = params;

    const query: Record<string, string | number> = {
      status: "APPROVED",
      _page: page,
      _limit: limit,
    };

    if (search.trim()) query.q = search.trim();
    if (category && category !== "All") query.category = category;
    if (tag) query.tags_like = tag;

    switch (sort) {
      case "title-asc":
        query._sort = "title";
        query._order = "asc";
        break;
      case "title-desc":
        query._sort = "title";
        query._order = "desc";
        break;
      case "newest":
      default:
        query._sort = "createdAt";
        query._order = "desc";
        break;
    }

    const res = await api.get<Book[]>("/books", { params: query });
    const total = Number(res.headers["x-total-count"] ?? res.data.length);
    let data = await attachListings(res.data);

    // price sorting happens client-side because price lives on listings
    if (sort === "price-asc") {
      data = [...data].sort(
        (a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity)
      );
    } else if (sort === "price-desc") {
      data = [...data].sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
    }

    return { data, total };
  },

  async getBooksByTag(tag: string, limit = 6): Promise<BookWithListings[]> {
    const { data } = await api.get<Book[]>("/books", {
      params: { status: "APPROVED", tags_like: tag, _limit: limit },
    });
    return attachListings(data);
  },

  async getBookById(id: number): Promise<BookWithListings> {
    const { data: book } = await api.get<Book>(`/books/${id}`);
    const [withListings] = await attachListings([book]);
    return withListings;
  },

  async getCategories(): Promise<string[]> {
    const { data } = await api.get<Book[]>("/books", {
      params: { status: "APPROVED" },
    });
    return Array.from(new Set(data.map((b) => b.category)));
  },
};
