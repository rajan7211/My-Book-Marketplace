import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
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
  const { data, isLoading } = useQuery({
    queryKey: ["books", "tag", tag],
    queryFn: () => booksApi.getBooksByTag(tag, 24),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between border-b border-gray-200 pb-5">
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

      {/* Medium-size grid: 6 columns on large screens */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))
          : data?.slice(0, 12).map((book) => (
              <BookCard key={book.id} book={book} compact />
            ))}
      </div>
      {!isLoading && data?.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">
          No books found in this section yet.
        </p>
      )}
    </section>
  );
}


