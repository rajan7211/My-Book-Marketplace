import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookCard } from "@/components/books/BookCard";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { booksApi, type SortOption } from "@/api/books.api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "title-asc", label: "Title: A → Z" },
  { value: "title-desc", label: "Title: Z → A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function BooksPage() {
  const [params, setParams] = useSearchParams();

  const page = Number(params.get("page") ?? 1);
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "All";
  const sort = (params.get("sort") as SortOption) ?? "newest";

  const [searchInput, setSearchInput] = useState(search);

  // debounce search -> URL params (resets to page 1)
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) {
        setParams((prev) => {
          const next = new URLSearchParams(prev);
          searchInput ? next.set("search", searchInput) : next.delete("search");
          next.set("page", "1");
          return next;
        });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const setParam = (key: string, value: string) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      value ? next.set(key, value) : next.delete(key);
      if (key !== "page") next.set("page", "1");
      return next;
    });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: booksApi.getCategories,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["books", "catalog", { page, search, category, sort }],
    queryFn: () =>
      booksApi.getBooks({ page, limit: PAGE_SIZE, search, category, sort }),
    placeholderData: keepPreviousData,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar />

      {/* Page header */}
      <div className="bg-brand-dark py-10 text-center text-white">
        <h1 className="font-serif text-3xl font-bold">Browse Books</h1>
        <p className="mt-2 text-sm text-gray-400">
          One book, many sellers — always the best price
        </p>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Toolbar: search + sort */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title or author..."
              className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-9 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/50"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <FiX size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-500">
              Sort by:
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/50"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category filter pills */}
        <div className="no-scrollbar mb-8 flex gap-2.5 overflow-x-auto">
          {["All", ...(categories ?? [])].map((c) => (
            <button
              key={c}
              onClick={() => setParam("category", c === "All" ? "" : c)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition",
                category === c
                  ? "border-brand-dark bg-brand-dark text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-brand-dark"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results meta */}
        <p className="mb-5 text-sm text-gray-500">
          {isLoading
            ? "Loading books..."
            : `Showing ${data?.data.length ?? 0} of ${data?.total ?? 0} books`}
          {search && (
            <>
              {" "}for "<span className="font-semibold text-brand-dark">{search}</span>"
            </>
          )}
          {isFetching && !isLoading && (
            <span className="ml-2 text-xs text-gray-400">updating…</span>
          )}
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="rounded-xl bg-white py-20 text-center">
            <p className="text-4xl">📚</p>
            <h3 className="mt-3 font-semibold text-brand-dark">
              No books found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {data?.data.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}

        <div className="mt-10">
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => setParam("page", String(p))}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}



