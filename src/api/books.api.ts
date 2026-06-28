// Uses the mock json-server (port 4000) until the books module is migrated to
// the real backend. Imported as `api` so the rest of this file is unchanged.
import { mockApi as api } from "./mock-client";
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
  excludeTag?: string;
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
      excludeTag,
    } = params;

    // Fetch all APPROVED books first
    const res = await api.get<Book[]>("/books", { params: { status: "APPROVED" } });
    let allBooks = res.data;

    // Apply JS Filtering
    if (search.trim()) {
      const q = search.toLowerCase();
      allBooks = allBooks.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    if (category && category !== "All") {
      allBooks = allBooks.filter((b) => b.category === category);
    }
    if (tag) {
      allBooks = allBooks.filter((b) => b.tags && b.tags.includes(tag));
    }
    if (excludeTag) {
      allBooks = allBooks.filter((b) => !(b.tags && b.tags.includes(excludeTag)));
    }

    // Attach listings
    let data = await attachListings(allBooks);

    // Apply Sorting
    switch (sort) {
      case "title-asc":
        data.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        data.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "price-asc":
        data.sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity));
        break;
      case "price-desc":
        data.sort((a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0));
        break;
      case "newest":
      default:
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    // Apply Pagination
    const total = data.length;
    const start = (page - 1) * limit;
    const paginatedData = data.slice(start, start + limit);

    return { data: paginatedData, total };
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
