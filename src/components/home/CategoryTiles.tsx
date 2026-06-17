import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";
import { GiSpellBook, GiScrollQuill, GiBookshelf, GiPencilBrush, GiSun } from "react-icons/gi";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/api/client";
import type { Book } from "@/types";
import { fadeUpItem, stagger, revealViewport } from "@/lib/motion";

interface TileMeta {
  icon: React.ElementType;
  gradient: string;
  glow: string;
}

const TILE_META: Record<string, TileMeta> = {
  Fictions: { icon: GiSpellBook, gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)", glow: "rgba(139,92,246,0.45)" },
  Biography: { icon: GiScrollQuill, gradient: "linear-gradient(135deg,#ec4899,#be185d)", glow: "rgba(236,72,153,0.45)" },
  History: { icon: GiBookshelf, gradient: "linear-gradient(135deg,#f59e0b,#b45309)", glow: "rgba(245,158,11,0.45)" },
  "Graphic Design": { icon: GiPencilBrush, gradient: "linear-gradient(135deg,#06b6d4,#0e7490)", glow: "rgba(6,182,212,0.45)" },
  "Self Help": { icon: GiSun, gradient: "linear-gradient(135deg,#10b981,#047857)", glow: "rgba(16,185,129,0.45)" },
};
const FALLBACK_META: TileMeta = { icon: GiBookshelf, gradient: "linear-gradient(135deg,#64748b,#3f4654)", glow: "rgba(100,116,139,0.4)" };

export function CategoryTiles() {
  const { data } = useQuery({
    queryKey: ["home", "categoryCounts"],
    queryFn: async () => {
      const { data: books } = await api.get<Book[]>("/books", { params: { status: "APPROVED" } });
      const counts = new Map<string, number>();
      books.forEach((b) => counts.set(b.category, (counts.get(b.category) ?? 0) + 1));
      return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-1.5 flex items-end justify-between">
        <div>
          <p
            className="glow-ribbon mb-2.5 inline-block text-[11px] font-medium uppercase tracking-[.1em] text-purple-600"
            style={{ ["--ribbon-from" as string]: "#8b5cf6", ["--ribbon-to" as string]: "#ec4899", ["--ribbon-glow" as string]: "rgba(139,92,246,0.5)" }}
          >
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
      <p className="mb-6 text-sm text-gray-500">Jump straight into the shelves you love.</p>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        variants={stagger(0.06)}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {(data ?? []).map(([category, count]) => {
          const meta = TILE_META[category] ?? FALLBACK_META;
          const Icon = meta.icon;

          return (
            <motion.div key={category} variants={fadeUpItem}>
              <Link
                to={`/books?category=${encodeURIComponent(category)}`}
                className="group relative block overflow-hidden rounded-2xl p-5 text-white transition duration-300 hover:-translate-y-1.5"
                style={{ background: meta.gradient, boxShadow: `0 0 0 1px rgba(255,255,255,0.08)` }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 12px 28px -8px ${meta.glow}`)}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.08)`)}
              >
                <Icon
                  className="absolute -bottom-2 -right-2 opacity-[.15] transition duration-300 group-hover:scale-110"
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
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}



