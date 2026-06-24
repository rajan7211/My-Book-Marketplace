import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { booksApi } from "@/api/books.api";
import { BookCard } from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { fadeUpItem, stagger } from "@/lib/motion";

const TABS = ["All", "Fictions", "Biography", "History", "Graphic Design"];

export function Bestsellers() {
  const railRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["books", "bestsellers"],
    queryFn: () => booksApi.getBooksByTag("bestseller", 24),
  });

  const filtered = tab === "All" ? data : data?.filter((b) => b.category === tab);

  const scroll = (dir: number) => railRef.current?.scrollBy({ left: dir * 400, behavior: "smooth" });

  return (
    <section className="mx-auto max-w-[1760px] px-6 pb-14 sm:px-20">
      <h2
        className="glow-ribbon mb-6 inline-block font-serif text-2xl font-bold sm:text-3xl"
        style={{ ["--ribbon-from" as string]: "#f59e0b", ["--ribbon-to" as string]: "#ec4899", ["--ribbon-glow" as string]: "rgba(245,158,11,0.5)" }}
      >
        Bestsellers Books
      </h2>

      <div className="mb-7 flex items-center justify-between border-b border-gray-200">
        <div className="no-scrollbar flex gap-7 overflow-x-auto text-sm">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative whitespace-nowrap pb-2.5 font-medium transition",
                tab === t ? "text-brand-dark" : "text-gray-500 hover:text-brand-dark"
              )}
            >
              {t}
              {tab === t && (
                <span
                  className="absolute -bottom-px left-0 h-[2px] w-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#f59e0b,#ec4899)" }}
                />
              )}
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

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="hidden"
          style={{ ["--hb" as string]: "1" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg,#f59e0b,#ec4899)")}
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
          className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth pb-1 lg:grid lg:grid-cols-5 lg:overflow-visible"
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[240px] shrink-0 sm:w-[316px] lg:w-full">
                  <Skeleton className="h-[258px] w-full rounded-2xl" />
                  <Skeleton className="mt-2 h-3 w-3/4 rounded" />
                  <Skeleton className="mt-1 h-3 w-1/2 rounded" />
                </div>
              ))
            : filtered?.slice(0, 5).map((book) => (
                <motion.div key={book.id} variants={fadeUpItem} className="w-[240px] shrink-0 sm:w-[316px] lg:w-full">
                  <BookCard book={book} compact />
                </motion.div>
              ))}
        </motion.div>

        <button
          onClick={() => scroll(1)}
          className="hidden"
          onMouseEnter={(e) => (e.currentTarget.style.background = "linear-gradient(135deg,#f59e0b,#ec4899)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          aria-label="Next"
        >
          <FiArrowRight size={15} />
        </button>
      </div>

      {!isLoading && filtered?.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">No bestsellers in this category yet.</p>
      )}
    </section>
  );
}






