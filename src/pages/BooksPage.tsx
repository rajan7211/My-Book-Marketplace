import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
  const tag = params.get("tag") ?? "";

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
    queryKey: ["books", "catalog", { page, search, category, sort, tag, excludeTag: "new-release" }],
    queryFn: () =>
      booksApi.getBooks({ page, limit: PAGE_SIZE, search, category, sort, tag, excludeTag: "new-release" }),
    placeholderData: keepPreviousData,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar />

      {/* Interactive Hero-style Header */}
      <div className="relative overflow-hidden bg-[#0f0d1a] py-14 text-white">
        {/* Ambient glow blobs (same as Hero) */}
        <div className="blob-drift pointer-events-none absolute -top-20 -right-16 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl" />
        <div
          className="blob-drift pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="blob-drift pointer-events-none absolute top-1/3 left-10 h-56 w-56 rounded-full bg-cyan-500/8 blur-3xl"
          style={{ animationDelay: "6s" }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-purple-300">
              <span className="glow-pulse h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
              35+ curated titles • Updated daily
            </div>

            <h1 className="font-serif text-[42px] font-semibold leading-tight tracking-tight text-[#f1f0f9] sm:text-5xl">
              Discover your next{" "}
              <span
                style={{
                  background: "linear-gradient(90deg,#f5a623,#ec4899,#8b5cf6)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                great story
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-md text-[#8b86a8]">
              One book, many sellers — always the best price
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="mt-8 flex justify-center gap-10 text-sm">
            {[
              { num: "35+", label: "Books" },
              { num: "6", label: "Sellers" },
              { num: "4.8★", label: "Avg Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-xl font-semibold text-white">{stat.num}</div>
                <div className="text-[11px] tracking-widest text-[#6b6888]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1760px] px-6 pb-14 sm:px-20">
        {/* Toolbar: search + sort */}
<div className="mb-6 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b86a8]" size={16} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title or author..."
              className="h-11 w-full rounded-lg border border-white/10 bg-[#1a1625] pl-10 pr-9 text-sm text-white placeholder:text-[#8b86a8] focus:border-[#ec4899] focus:outline-none focus:ring-2 focus:ring-[#ec4899]/30"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b86a8] hover:text-white"
                aria-label="Clear search"
              >
                <FiX size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-[#8b86a8]">
              Sort by:
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="h-11 rounded-lg border border-white/10 bg-[#1a1625] px-3 text-sm text-white focus:border-[#ec4899] focus:outline-none focus:ring-2 focus:ring-[#ec4899]/30"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category filter pills - Dark theme */}
        <div className="no-scrollbar mb-8 flex gap-2.5 overflow-x-auto">
          {["All", ...(categories ?? [])].map((c) => (
            <button
              key={c}
              onClick={() => setParam("category", c === "All" ? "" : c)}
              className={cn(
                "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition",
                category === c
                  ? "border-[#ec4899] bg-[#ec4899] text-white"
                  : "border-white/10 bg-[#1a1625] text-[#b0aac8] hover:border-[#ec4899] hover:text-white"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results meta */}
        <p className="mb-5 text-sm text-[#8b86a8]">
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

        {/* Grid - 5 books per row (matching screenshot) */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} className="h-[258px] rounded-2xl" />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="rounded-xl bg-[#1a1625] py-20 text-center border border-white/10">
            <p className="text-4xl">📚</p>
            <h3 className="mt-3 font-semibold text-white">
              No books found
            </h3>
            <p className="mt-1 text-sm text-[#8b86a8]">
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
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





