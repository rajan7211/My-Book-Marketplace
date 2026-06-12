import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { GiSpellBook, GiScrollQuill, GiBookshelf, GiPencilBrush, GiSun } from "react-icons/gi";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { Book } from "@/types";

const TILE_META: Record<string, { icon: React.ElementType; gradient: string }> = {
  Fictions: { icon: GiSpellBook, gradient: "from-indigo-500/90 to-violet-700/90" },
  Biography: { icon: GiScrollQuill, gradient: "from-rose-500/90 to-red-700/90" },
  History: { icon: GiBookshelf, gradient: "from-amber-500/90 to-orange-700/90" },
  "Graphic Design": { icon: GiPencilBrush, gradient: "from-emerald-500/90 to-teal-700/90" },
  "Self Help": { icon: GiSun, gradient: "from-sky-500/90 to-blue-700/90" },
};

/** Modern "shop by category" tiles with book counts. */
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
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <h2 className="section-title-underline font-serif text-2xl font-bold sm:text-3xl">
            Shop by Category
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Jump straight into the shelves you love.
          </p>
        </div>
        <Link
          to="/books"
          className="hidden items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-dark sm:flex"
        >
          All Categories <FiArrowUpRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(data ?? []).map(([category, count]) => {
          const meta = TILE_META[category] ?? {
            icon: GiBookshelf,
            gradient: "from-gray-600/90 to-gray-800/90",
          };
          const Icon = meta.icon;
          return (
            <Link
              key={category}
              to={`/books?category=${encodeURIComponent(category)}`}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${meta.gradient} p-5 text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl`}
            >
              {/* decorative oversized icon */}
              <Icon className="absolute -bottom-4 -right-4 text-white/15 transition duration-300 group-hover:scale-110" size={88} />
              <Icon size={26} className="mb-6 drop-shadow" />
              <p className="text-sm font-bold leading-tight">{category}</p>
              <p className="mt-1 text-[11px] text-white/75">{count} books</p>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold opacity-0 transition group-hover:opacity-100">
                Browse <FiArrowUpRight size={11} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
