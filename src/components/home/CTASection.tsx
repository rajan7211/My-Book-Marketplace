import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { fadeUp, revealViewport } from "@/lib/motion";

/** Closing call-to-action — invites readers to sell, not just buy. */
export function CTASection() {
  return (
    <section className="relative isolate overflow-hidden py-16">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(120deg,#6d28d9,#8b5cf6 35%,#ec4899 70%,#f59e0b)" }}
      />
      <div className="blob-drift pointer-events-none absolute -left-10 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="blob-drift pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" style={{ animationDelay: "4s" }} />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={revealViewport}
        variants={fadeUp}
        className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6"
      >
        <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
          Have books to sell? Reach readers everywhere.
        </h2>
        <p className="mt-3 max-w-xl text-sm text-white/85">
          Join the sellers already listing on World Knowledge — set your own
          prices, manage stock, and get discovered next to the bestsellers.
        </p>
        <Link to="/seller/register" className="mt-7">
          <button className="group flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-purple-700 shadow-[0_0_0_0_rgba(255,255,255,0)] transition duration-300 hover:shadow-[0_0_32px_8px_rgba(255,255,255,0.45)]">
            Become a seller
            <FiArrowRight className="transition group-hover:translate-x-1" size={16} />
          </button>
        </Link>
      </motion.div>
    </section>
  );
}


