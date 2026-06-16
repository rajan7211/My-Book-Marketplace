import { useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { BookCard } from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";


const TABS = ["All", "Fictions", "Biography", "History", "Graphic Design"];

export function Bestsellers() {
  const [tab, setTab] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["books", "bestsellers"],
    queryFn: () => booksApi.getBooksByTag("bestseller", 24),
  });

  const filtered =
    tab === "All" ? data : data?.filter((b) => b.category === tab);

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

      {/* Medium-size grid: 6 columns on large screens */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))
          : filtered?.slice(0, 12).map((book) => (
              <BookCard key={book.id} book={book} compact />
            ))}
      </div>
      {!isLoading && filtered?.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">
          No bestsellers in this category yet.
        </p>
      )}
    </section>
  );
}



