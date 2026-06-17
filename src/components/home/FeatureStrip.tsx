import { FiTruck, FiTag, FiShield, FiRefreshCw } from "react-icons/fi";
import { motion } from "framer-motion";
import { fadeUpItem, stagger, revealViewport } from "@/lib/motion";

const FEATURES = [
  { icon: FiTruck, title: "Free Delivery", text: "On every order, no minimum", color: "#06b6d4" },
  { icon: FiTag, title: "Best Price Promise", text: "Compare sellers, pay the lowest", color: "#f59e0b" },
  { icon: FiShield, title: "Verified Sellers", text: "Every seller approved by admin", color: "#10b981" },
  { icon: FiRefreshCw, title: "Easy Cancellation", text: "Cancel any time before shipping", color: "#ec4899" },
];

/** Glass trust strip floating just beneath the hero. */
export function FeatureStrip() {
  return (
    <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        variants={stagger(0.08)}
        className="grid grid-cols-2 gap-3 rounded-2xl bg-[#0f0d1a] p-3 shadow-lg shadow-black/10 lg:grid-cols-4"
      >
        {FEATURES.map(({ icon: Icon, title, text, color }) => (
          <motion.div
            key={title}
            variants={fadeUpItem}
            className="group flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
            style={{ ["--glow" as string]: color }}
          >
            <span
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white transition duration-300 group-hover:shadow-[0_0_18px_var(--glow)]"
              style={{ background: `${color}26`, color }}
            >
              <Icon size={19} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{title}</p>
              <p className="truncate text-xs text-[#8b86a8]">{text}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}



