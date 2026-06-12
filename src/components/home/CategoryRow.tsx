import { useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { BookCard } from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryRowProps {
  title: string;
  tag: string;
  subtitle?: string;
  viewAll?: boolean;
}

export function CategoryRow({
  title,
  tag,
  subtitle = "What's new? Browse latest titles in the new releases category to discover your next read!",
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
    <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6">
      <div className="mb-1 flex items-end justify-between">
        <h2 className="section-title-underline font-serif text-2xl font-bold">
          {title}
        </h2>
        {viewAll && (
          <Link
            to="/books"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-dark"
          >
            View all <FiChevronRight size={15} />
          </Link>
        )}
      </div>
      <p className="mb-6 text-sm text-gray-500">{subtitle}</p>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-3 top-1/3 z-10 hidden h-9 w-9 place-items-center rounded-full bg-white shadow-md transition hover:bg-brand-dark hover:text-white lg:grid"
          aria-label="Previous"
        >
          <FiArrowLeft size={15} />
        </button>
        <div
          ref={railRef}
          className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth"
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-44 shrink-0 rounded-lg" />
              ))
            : data?.map((book) => (
                <div key={book.id} className="w-44 shrink-0">
                  <BookCard book={book} compact />
                </div>
              ))}
        </div>
        <button
          onClick={() => scroll(1)}
          className="absolute -right-3 top-1/3 z-10 hidden h-9 w-9 place-items-center rounded-full bg-white shadow-md transition hover:bg-brand-dark hover:text-white lg:grid"
          aria-label="Next"
        >
          <FiArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}



