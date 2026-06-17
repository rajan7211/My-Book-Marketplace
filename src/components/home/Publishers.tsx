import { GiSpellBook, GiBlackBook, GiBookshelf, GiOpenBook, GiBookCover, GiBookmark } from "react-icons/gi";
import { motion } from "framer-motion";
import { fadeUpItem, stagger, revealViewport } from "@/lib/motion";

interface Publisher {
  icon: React.ElementType;
  name: string;
  color: string;
}

const PUBLISHERS: Publisher[] = [
  { icon: GiSpellBook, name: "Penguin", color: "#8b5cf6" },
  { icon: GiBlackBook, name: "HarperCollins", color: "#ec4899" },
  { icon: GiBookshelf, name: "Macmillan", color: "#f59e0b" },
  { icon: GiOpenBook, name: "Bloomsbury", color: "#06b6d4" },
  { icon: GiBookCover, name: "Random House", color: "#10b981" },
  { icon: GiBookmark, name: "Scribner", color: "#f97316" },
];

export function Publishers() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6">
      <p
        className="glow-ribbon mx-auto mb-2.5 inline-block text-[11px] font-medium uppercase tracking-[.1em] text-purple-600"
        style={{
          ["--ribbon-from" as string]: "#8b5cf6",
          ["--ribbon-to" as string]: "#f59e0b",
          ["--ribbon-glow" as string]: "rgba(139,92,246,0.5)",
        }}
      >
        Publishing partners
      </p>
      <h2 className="font-serif text-2xl font-bold text-brand-dark sm:text-3xl">
        Publishers behind the bestsellers
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Six of the houses our readers reach for most often.
      </p>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        variants={stagger(0.06)}
        className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        {PUBLISHERS.map(({ icon: Icon, name, color }) => (
          <motion.div
            key={name}
            variants={fadeUpItem}
            style={{ ["--glow" as string]: `${color}4d` }}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent hover:shadow-[0_16px_32px_-12px_var(--glow)]"
          >
            <span
              className="grid h-14 w-14 place-items-center rounded-full transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${color}1A`, color }}
            >
              <Icon size={26} />
            </span>
            <span className="text-sm font-semibold text-brand-dark">{name}</span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}


