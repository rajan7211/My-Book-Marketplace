import type { Variants } from "framer-motion";

/** Fade up on scroll — the workhorse reveal for section content. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/** Stagger container for card grids / rails. */
export const stagger = (gap = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
});

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/** Default viewport settings so every scroll-reveal behaves consistently. */
export const revealViewport = { once: true, margin: "-80px" };



