import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { BookCard } from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TABS = ["All", "Fictions", "Biography", "History", "Graphic Design"];

export function Bestsellers() {
  const railRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["books", "bestsellers"],
    queryFn: () => booksApi.getBooksByTag("bestseller", 24),
  });

  const filtered =
    tab === "All" ? data : data?.filter((b) => b.category === tab);

  const scroll = (dir: number) =>
    railRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
      <h2 className="mb-6 font-serif text-2xl font-bold sm:text-3xl">
        Bestsellers Books
      </h2>

      <div className="mb-7 flex items-center justify-between border-b border-gray-200">
        <div className="no-scrollbar flex gap-7 overflow-x-auto text-sm">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "whitespace-nowrap border-b-2 pb-2.5 font-medium transition",
                tab === t
                  ? "border-brand-dark text-brand-dark"
                  : "border-transparent text-gray-500 hover:text-brand-dark"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <Link
          to="/books"
          className="hidden items-center gap-1 pb-2.5 text-sm font-medium text-gray-600 hover:text-brand-dark sm:flex"
        >
          All Categories <FiChevronRight size={15} />
        </Link>
      </div>

      {/* Single-line horizontal scroll rail */}
      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-4 top-1/3 z-10 hidden h-[36px] w-[36px] -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-brand-dark hover:text-white lg:grid"
          aria-label="Previous"
        >
          <FiArrowLeft size={15} />
        </button>

        <div
          ref={railRef}
          className="no-scrollbar flex gap-8 overflow-x-auto scroll-smooth pb-1"
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[180px] shrink-0">
                  <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                  <Skeleton className="mt-2 h-3 w-3/4 rounded" />
                  <Skeleton className="mt-1 h-3 w-1/2 rounded" />
                </div>
              ))
            : filtered?.slice(0, 5).map((book) => (
                <div key={book.id} className="w-[180px] shrink-0">
                  <BookCard book={book} compact />
                </div>
              ))}
        </div>

        <button
          onClick={() => scroll(1)}
          className="absolute -right-4 top-1/3 z-10 hidden h-[36px] w-[36px] -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:bg-brand-dark hover:text-white lg:grid"
          aria-label="Next"
        >
          <FiArrowRight size={15} />
        </button>
      </div>

      {!isLoading && filtered?.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">
          No bestsellers in this category yet.
        </p>
      )}
    </section>
  );
}



