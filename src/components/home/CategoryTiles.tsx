import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { GiSpellBook, GiScrollQuill, GiBookshelf, GiPencilBrush, GiSun } from "react-icons/gi";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { Book } from "@/types";

interface TileMeta {
  icon: React.ElementType;
  bg: string;
  text: string;
}

const TILE_META: Record<string, TileMeta> = {
  Fictions:       { icon: GiSpellBook,   bg: "bg-purple-600",  text: "text-white" },
  Biography:      { icon: GiScrollQuill, bg: "bg-rose-600",    text: "text-white" },
  History:        { icon: GiBookshelf,   bg: "bg-amber-600",   text: "text-white" },
  "Graphic Design":{ icon: GiPencilBrush,bg: "bg-teal-700",    text: "text-white" },
  "Self Help":    { icon: GiSun,         bg: "bg-sky-600",     text: "text-white" },
};

const FALLBACK_META: TileMeta = {
  icon: GiBookshelf,
  bg: "bg-gray-700",
  text: "text-white",
};

export function CategoryTiles() {
  const { data } = useQuery({
    queryKey: ["home", "categoryCounts"],
    queryFn: async () => {
      const { data: books } = await api.get<Book[]>("/books", {
        params: { status: "APPROVED" },
      });
      const counts = new Map<string, number>();
      books.forEach((b) => counts.set(b.category, (counts.get(b.category) ?? 0) + 1));
      return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-1.5 flex items-end justify-between">
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-purple-600">
            Browse
          </p>
          <h2 className="font-serif text-[22px] font-semibold text-[#1a1625] sm:text-3xl">
            Shop by category
          </h2>
        </div>
        <Link
          to="/books"
          className="hidden items-center gap-1 text-sm font-medium text-purple-600 transition hover:text-purple-800 sm:flex"
        >
          All categories <FiArrowUpRight size={14} />
        </Link>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        Jump straight into the shelves you love.
      </p>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {(data ?? []).map(([category, count]) => {
          const meta = TILE_META[category] ?? FALLBACK_META;
          const Icon = meta.icon;

          return (
            <Link
              key={category}
              to={`/books?category=${encodeURIComponent(category)}`}
              className={`group relative overflow-hidden rounded-2xl p-5 ${meta.bg} ${meta.text} transition duration-300 hover:-translate-y-1`}
            >
              {/* Oversized decorative icon */}
              <Icon
                className="absolute -bottom-2 -right-2 opacity-[.12] transition duration-300 group-hover:scale-110"
                size={80}
                aria-hidden="true"
              />

              <Icon size={24} className="mb-4" aria-hidden="true" />
              <p className="text-sm font-semibold leading-snug">{category}</p>
              <p className="mt-0.5 text-[11px] opacity-75">{count} books</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold opacity-0 transition duration-200 group-hover:opacity-100">
                Browse <FiArrowUpRight size={11} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}


