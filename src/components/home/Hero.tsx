import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Hero() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: trending, isLoading } = useQuery({
    queryKey: ["books", "trending"],
    queryFn: () => booksApi.getBooksByTag("trending", 5),
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(search.trim() ? `/books?search=${encodeURIComponent(search.trim())}` : "/books");
  };

  // Split books: first one is "featured" (tall), rest are small grid
  const featured = trending?.[0];
  const rest = trending?.slice(1, 5) ?? [];

  return (
    <section className="relative overflow-hidden bg-[#0f0d1a] py-14 text-white">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-20 -right-16 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-amber-500/8 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">

        {/* ── Left: copy + search ── */}
        <div className="flex flex-col">
          {/* Pill badge */}
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-purple-300">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_theme(colors.purple.400)]" />
            New arrivals every week
          </div>

          <h1 className="font-serif text-[38px] font-semibold leading-[1.15] tracking-tight text-[#f1f0f9] sm:text-5xl">
            Your next great{" "}
            <span className="text-amber-400">story</span>
            {" "}is
            <br />
            waiting for you
          </h1>

          <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#8b86a8]">
            Discover curated collections across every genre. From timeless
            classics to today's bestsellers — find your next obsession.
          </p>

          {/* Search */}
          <form onSubmit={onSearch} className="mt-7 flex max-w-sm gap-2">
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#534f6e]"
                size={15}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author, genre…"
                className="h-[42px] w-full rounded-lg border border-[#3d3760] bg-[#1e1b2e] pl-10 pr-4 text-sm text-[#f1f0f9] placeholder:text-[#534f6e] focus:border-purple-500 focus:outline-none focus:ring-0"
              />
            </div>
            <Button
              type="submit"
              className="h-[42px] rounded-lg bg-purple-600 px-5 text-sm font-medium text-white hover:bg-purple-700"
            >
              Search
            </Button>
          </form>

          {/* Stats */}
          <div className="mt-7 flex gap-8">
            {[
              { num: "12k+", lbl: "Books" },
              { num: "340+", lbl: "Authors" },
              { num: "4.9★", lbl: "Avg rating" },
            ].map(({ num, lbl }) => (
              <div key={lbl} className="flex flex-col gap-0.5">
                <span className="text-lg font-semibold text-[#f1f0f9]">{num}</span>
                <span className="text-[11px] uppercase tracking-widest text-[#6b6888]">
                  {lbl}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: book mosaic ── */}
        <div className="relative">
          <div className="grid grid-cols-3 gap-3">
            {/* Featured tall card */}
            <div className="group relative row-span-2 overflow-hidden rounded-xl bg-[#1e1b2e]">
              {isLoading ? (
                <Skeleton className="h-full min-h-[280px] w-full bg-white/10" />
              ) : featured ? (
                <Link to={`/books/${featured.id}`} className="block h-full">
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                  <span className="absolute left-2 top-2 rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-medium text-white">
                    Trending
                  </span>
                </Link>
              ) : null}
            </div>

            {/* 4 small cards */}
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl bg-white/10" />
                ))
              : rest.map((book) => (
                  <Link
                    key={book.id}
                    to={`/books/${book.id}`}
                    className="group relative aspect-[2/3] overflow-hidden rounded-xl bg-[#1e1b2e]"
                  >
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                  </Link>
                ))}
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-3 -right-3 rounded-xl bg-amber-400 px-4 py-2 text-center text-xs font-semibold leading-snug text-amber-900 shadow-lg">
            50,000+<br />readers
          </div>
        </div>

      </div>
    </section>
  );
}




