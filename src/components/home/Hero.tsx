import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { booksApi } from "@/api/books.api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeUp, fadeUpItem, stagger } from "@/lib/motion";


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

  const featured = trending?.[0];
  const rest = trending?.slice(1, 5) ?? [];

  return (
    <section className="relative overflow-hidden bg-[#0f0d1a] py-14 text-white">
      {/* Ambient glow blobs kept soft, color does the work */}
      <div className="blob-drift pointer-events-none absolute -top-20 -right-16 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="blob-drift pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" style={{ animationDelay: "3s" }} />
      <div className="blob-drift pointer-events-none absolute top-1/3 left-10 h-56 w-56 rounded-full bg-cyan-500/8 blur-3xl" style={{ animationDelay: "6s" }} />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">

        {/*  Left side  */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.12)}
          className="flex flex-col"
        >
          <motion.div
            variants={fadeUpItem}
            className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-purple-300"
          >
            <span className="glow-pulse h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
            New arrivals every week
          </motion.div>

          <motion.h1
            variants={fadeUpItem}
            className="font-serif text-[38px] font-semibold leading-[1.15] tracking-tight text-[#f1f0f9] sm:text-5xl"
          >
            Your next great{" "}
            <span
              style={{ background: "linear-gradient(90deg,#f5a623,#ec4899,#8b5cf6)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
            >
              story
            </span>{" "}
            is
            <br />
            waiting for you
          </motion.h1>

          <motion.p variants={fadeUpItem} className="mt-5 max-w-sm text-sm leading-relaxed text-[#8b86a8]">
            Discover curated collections across every genre. From timeless
            classics to today's bestsellers — find your next obsession.
          </motion.p>

          {/* Search glass card */}
          <motion.form
            variants={fadeUpItem}
            onSubmit={onSearch}
            className="glass mt-7 flex max-w-sm gap-2 rounded-xl p-1.5"
          >
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b86a8]" size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, author, genre…"
                className="h-[40px] w-full rounded-lg bg-transparent pl-10 pr-4 text-sm text-[#f1f0f9] placeholder:text-[#6b6888] focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              className="h-[40px] rounded-lg border-0 px-5 text-sm font-medium text-white shadow-[0_0_16px_rgba(245,166,35,0.4)] transition hover:shadow-[0_0_22px_rgba(236,72,153,0.5)]"
              style={{ background: "linear-gradient(135deg,#f5a623,#ec4899)" }}
            >
              Search
            </Button>
          </motion.form>

          {/* Stats */}
          <motion.div variants={fadeUpItem} className="mt-7 flex gap-8">
            {[
              { num: "12k+", lbl: "Books", color: "#f5a623" },
              { num: "340+", lbl: "Authors", color: "#06b6d4" },
              { num: "4.9★", lbl: "Avg rating", color: "#ec4899" },
            ].map(({ num, lbl, color }) => (
              <div key={lbl} className="flex flex-col gap-0.5">
                <span className="text-lg font-semibold" style={{ color }}>{num}</span>
                <span className="text-[11px] uppercase tracking-widest text-[#6b6888]">{lbl}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/*Right: book mosaic*/}
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="group relative row-span-2 overflow-hidden rounded-xl bg-[#1e1b2e] ring-1 ring-white/[0.06]">
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
                  <span
                    className="absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
                  >
                    Trending
                  </span>
                </Link>
              ) : null}
            </div>

            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl bg-white/10" />
                ))
              : rest.map((book) => (
                  <Link
                    key={book.id}
                    to={`/books/${book.id}`}
                    className="group relative aspect-[2/3] overflow-hidden rounded-xl bg-[#1e1b2e] ring-1 ring-white/[0.06]"
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
          <div
            className="absolute -bottom-3 -right-3 rounded-xl px-4 py-2 text-center text-xs font-semibold leading-snug text-amber-900 shadow-lg"
            style={{ background: "linear-gradient(135deg,#fde68a,#f5a623)" }}
          >
            50,000+<br />readers
          </div>
        </motion.div>

      </div>
    </section>
  );
}








