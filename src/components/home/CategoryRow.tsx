import { useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { booksApi } from "@/api/books.api";
import { BookCard } from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUpItem, stagger } from "@/lib/motion";

interface CategoryRowProps {
  title: string;
  tag: string;
  label?: string;
  subtitle?: string;
  viewAll?: boolean;
  /** Pick from the jewel accent set so repeated rows don't all look identical. */
  accent?: "amber" | "violet" | "rose" | "cyan" | "emerald";
}

const ACCENTS: Record<NonNullable<CategoryRowProps["accent"]>, { from: string; to: string; glow: string; label: string }> = {
  amber: { from: "#f59e0b", to: "#ec4899", glow: "rgba(245,158,11,0.5)", label: "#b45309" },
  violet: { from: "#8b5cf6", to: "#ec4899", glow: "rgba(139,92,246,0.5)", label: "#7c3aed" },
  rose: { from: "#ec4899", to: "#8b5cf6", glow: "rgba(236,72,153,0.5)", label: "#be185d" },
  cyan: { from: "#06b6d4", to: "#8b5cf6", glow: "rgba(6,182,212,0.5)", label: "#0e7490" },
  emerald: { from: "#10b981", to: "#06b6d4", glow: "rgba(16,185,129,0.5)", label: "#047857" },
};

export function CategoryRow({
  title,
  tag,
  label,
  subtitle = "Fresh off the press — discover what readers are picking up this week.",
  viewAll = false,
  accent = "violet",
}: CategoryRowProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const a = ACCENTS[accent];

  const { data, isLoading } = useQuery({
    queryKey: ["books", "tag", tag],
    queryFn: () => booksApi.getBooksByTag(tag, 24),
  });

  const scroll = (dir: number) => railRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
      <div className="mb-1.5 flex items-end justify-between border-b border-gray-200 pb-5">
        <div>
          {label && (
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[.1em]" style={{ color: a.label }}>
              {label}
            </p>
          )}
          <h2
            className="glow-ribbon inline-block font-serif text-2xl font-bold sm:text-3xl"
            style={{ ["--ribbon-from" as string]: a.from, ["--ribbon-to" as string]: a.to, ["--ribbon-glow" as string]: a.glow }}
          >
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
        </div>
        {viewAll && (
          <Link to="/books" className="hidden items-center gap-1 pb-2.5 text-sm font-medium text-gray-600 hover:text-brand-dark sm:flex">
            View all <FiArrowUpRight size={14} />
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="absolute -left-4 top-1/3 z-10 hidden h-[36px] w-[36px] -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:text-white lg:grid"
          onMouseEnter={(e) => (e.currentTarget.style.background = `linear-gradient(135deg,${a.from},${a.to})`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          aria-label="Previous"
        >
          <FiArrowLeft size={15} />
        </button>

        <motion.div
          ref={railRef}
          initial="hidden"
          animate="show"
          variants={stagger(0.06)}
          className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-1"
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[240px] shrink-0 sm:w-[286px]">
                  <Skeleton className="h-[258px] w-full rounded-2xl" />
                  <Skeleton className="mt-2 h-3 w-3/4 rounded" />
                  <Skeleton className="mt-1 h-3 w-1/2 rounded" />
                </div>
              ))
            : data?.slice(0, 4).map((book) => (
                <motion.div key={book.id} variants={fadeUpItem} className="w-[240px] shrink-0 sm:w-[286px]">
                  <BookCard book={book} compact />
                </motion.div>
              ))}
        </motion.div>

        <button
          onClick={() => scroll(1)}
          className="absolute -right-4 top-1/3 z-10 hidden h-[36px] w-[36px] -translate-y-1/2 place-items-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:text-white lg:grid"
          onMouseEnter={(e) => (e.currentTarget.style.background = `linear-gradient(135deg,${a.from},${a.to})`)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          aria-label="Next"
        >
          <FiArrowRight size={15} />
        </button>
      </div>

      {!isLoading && data?.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">No books found in this section yet.</p>
      )}
    </section>
  );
}





