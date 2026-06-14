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
    queryFn: () => booksApi.getBooksByTag(tag, 10),
  });

  const scroll = (dir: number) =>
    railRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-1.5 flex items-end justify-between">
        <div>
          {label && (
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-purple-600">
              {label}
            </p>
          )}
          <h2 className="font-serif text-[22px] font-semibold leading-snug text-[#1a1625]">
            {title}
          </h2>
        </div>
        {viewAll && (
          <Link
            to="/books"
            className="flex items-center gap-1 text-sm font-medium text-purple-600 transition hover:text-purple-800"
          >
            View all <FiArrowUpRight size={14} />
          </Link>
        )}
      </div>
      <p className="mb-6 text-sm text-gray-500">{subtitle}</p>

      {/* Rail */}
      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-4 top-1/3 z-10 hidden h-[34px] w-[34px] -translate-y-1/2 place-items-center rounded-full border border-[#e5e3f0] bg-white text-gray-500 transition hover:bg-[#1a1625] hover:text-white lg:grid"
          aria-label="Previous"
        >
          <FiArrowLeft size={14} />
        </button>

        <div
          ref={railRef}
          className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-1"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[130px] shrink-0 space-y-2">
                  <Skeleton className="h-[185px] w-[130px] rounded-xl" />
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              ))
            : data?.map((book) => (
                <div key={book.id} className="w-[130px] shrink-0">
                  <BookCard book={book} compact />
                </div>
              ))}
        </div>

        <button
          onClick={() => scroll(1)}
          className="absolute -right-4 top-1/3 z-10 hidden h-[34px] w-[34px] -translate-y-1/2 place-items-center rounded-full border border-[#e5e3f0] bg-white text-gray-500 transition hover:bg-[#1a1625] hover:text-white lg:grid"
          aria-label="Next"
        >
          <FiArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}



