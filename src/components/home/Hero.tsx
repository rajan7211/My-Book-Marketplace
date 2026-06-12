import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiSearch, FiArrowLeft, FiArrowRight, FiChevronDown } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Hero() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const railRef = useRef<HTMLDivElement>(null);

  const { data: trending, isLoading } = useQuery({
    queryKey: ["books", "trending"],
    queryFn: () => booksApi.getBooksByTag("trending", 8),
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(search.trim() ? `/books?search=${encodeURIComponent(search.trim())}` : "/books");
  };

  const scroll = (dir: number) =>
    railRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <section className="bg-brand-dark pb-14 pt-8 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
        {/* Left: copy + search */}
        <div className="flex flex-col justify-center">
          <button className="mb-8 flex w-fit items-center gap-2 rounded-lg border border-white/25 px-3 py-1.5 text-xs text-gray-300">
            <span className="text-sm">🇺🇸</span> / English/ USD
            <FiChevronDown size={12} />
          </button>

          <h1 className="font-serif text-4xl font-semibold leading-[1.2] sm:text-[44px]">
            Start Your Reading
            <br />
            <span className="text-brand-yellow">Adventure</span> Invest
            <br />
            in Books Today
          </h1>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-gray-400">
            Welcome to our bookstore! Each book you purchase isn't just a story
            — it's a passport to new worlds, exciting adventures, and endless
            possibilities. Dive into our curated collection, filled with
            captivating tales waiting to be discovered.
          </p>

          <form onSubmit={onSearch} className="mt-8 flex max-w-md gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search book here..."
                className="h-11 w-full rounded-lg bg-white pl-10 pr-4 text-sm text-brand-dark placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </div>
            <Button type="submit" className="h-11 rounded-lg px-6 font-semibold">
              Search
            </Button>
          </form>
        </div>

        {/* Right: trending carousel */}
        <div className="min-w-0">
          <h2 className="mb-5 font-serif text-2xl font-semibold">
            Trending Now
          </h2>
          <div
            ref={railRef}
            className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth"
          >
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 w-48 shrink-0 rounded-lg bg-white/10" />
                ))
              : trending?.map((book) => (
                  <Link
                    key={book.id}
                    to={`/books/${book.id}`}
                    className="group relative w-48 shrink-0 overflow-hidden rounded-lg"
                  >
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="h-72 w-48 object-cover transition duration-300 group-hover:scale-105"
                    />
                  </Link>
                ))}
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => scroll(-1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-brand-dark"
              aria-label="Previous"
            >
              <FiArrowLeft size={15} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white hover:text-brand-dark"
              aria-label="Next"
            >
              <FiArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}



