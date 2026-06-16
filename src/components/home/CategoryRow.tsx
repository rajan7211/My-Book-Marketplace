import { useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { BookCard } from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";



interface CategoryRowProps {
  title: string;
  tag: string;
  label?: string;
  subtitle?: string;
  viewAll?: boolean;
}

export function CategoryRow({
  title,
  tag,
  label,
  subtitle = "Fresh off the press — discover what readers are picking up this week.",
  viewAll = false,
}: CategoryRowProps) {
  const railRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["books", "tag", tag],
    queryFn: () => booksApi.getBooksByTag(tag, 24),
  });

  const scroll = (dir: number) =>
    railRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
      {/* Header */}
      <div className="mb-1.5 flex items-end justify-between border-b border-gray-200 pb-5">
        <div>
          {label && (
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-purple-600">
              {label}
            </p>
          )}
          <h2 className="font-serif text-2xl font-bold sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </div>
        {viewAll && (
          <Link
            to="/books"
            className="hidden items-center gap-1 pb-2.5 text-sm font-medium text-gray-600 hover:text-brand-dark sm:flex"
          >
            View all <FiArrowUpRight size={14} />
          </Link>
        )}
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
            : data?.slice(0, 5).map((book) => (
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

      {!isLoading && data?.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">
          No books found in this section yet.
        </p>
      )}
    </section>
  );
}


























