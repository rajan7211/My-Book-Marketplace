import { FiStar } from "react-icons/fi";
import { FaQuoteLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { fadeUpItem, stagger, revealViewport } from "@/lib/motion";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  accent: string;
  accent2: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aanya Kapoor",
    role: "Avid reader, Delhi",
    quote:
      "Comparing sellers on the same page saved me real money — found a first-edition history title for half what I expected to pay.",
    rating: 5,
    accent: "#8b5cf6",
    accent2: "#ec4899",
  },
  {
    name: "Rohan Mehta",
    role: "College student",
    quote:
      "Shipping is fast and the seller ratings actually mean something. I check this site before any bookstore now.",
    rating: 5,
    accent: "#ec4899",
    accent2: "#f59e0b",
  },
  {
    name: "Sara Thomas",
    role: "Independent seller",
    quote:
      "Listing my backlist titles took minutes, and the dashboard makes it easy to see what's actually moving.",
    rating: 4,
    accent: "#06b6d4",
    accent2: "#10b981",
  },
];

export function Testimonials() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-9 text-center">
          <p
            className="glow-ribbon mx-auto mb-2.5 inline-block text-[11px] font-medium uppercase tracking-[.1em] text-purple-600"
            style={{
              ["--ribbon-from" as string]: "#8b5cf6",
              ["--ribbon-to" as string]: "#ec4899",
              ["--ribbon-glow" as string]: "rgba(139,92,246,0.45)",
            }}
          >
            Reader reviews
          </p>
          <h2 className="font-serif text-xl font-semibold text-brand-dark sm:text-2xl">
            Loved by readers, trusted by sellers
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
          variants={stagger(0.1)}
          className="grid gap-5 sm:grid-cols-2 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUpItem}
              style={{ ["--glow" as string]: `${t.accent}33` }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-12px_var(--glow)]"
            >
              {/* gradient top edge — same ribbon language as section headers */}
              <span
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: `linear-gradient(90deg,${t.accent},${t.accent2})` }}
              />

              <FaQuoteLeft
                size={34}
                className="absolute right-4 top-4 opacity-[0.08]"
                style={{ color: t.accent }}
                aria-hidden="true"
              />

              <div className="relative mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <FiStar
                    key={s}
                    size={13}
                    className={s < t.rating ? "fill-current" : ""}
                    style={{ color: s < t.rating ? t.accent : "#e5e7eb" }}
                  />
                ))}
              </div>

              <p className="relative text-sm leading-relaxed text-gray-600">"{t.quote}"</p>

              <div className="relative mt-5 flex items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full p-[2px]"
                  style={{ background: `linear-gradient(135deg,${t.accent},${t.accent2})` }}
                >
                  <span className="grid h-full w-full place-items-center rounded-full bg-white text-xs font-bold text-brand-dark">
                    {t.name.charAt(0)}
                  </span>
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-dark">{t.name}</p>
                  <p className="text-[11px] text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


