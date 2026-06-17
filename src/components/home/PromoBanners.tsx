import { Link } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeUpItem, stagger, revealViewport } from "@/lib/motion";

export function PromoBanners() {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
      variants={stagger(0.1)}
      className="mx-auto grid max-w-7xl gap-5 px-4 pb-14 sm:px-6 lg:grid-cols-3"
    >
      {/* Flash Sale */}
      <motion.div
        variants={fadeUpItem}
        className="relative flex flex-col justify-between overflow-hidden rounded-xl p-7 text-white transition duration-300 hover:-translate-y-1"
        style={{ background: "linear-gradient(135deg,#1a1625,#0f0d1a)" }}
      >
        <FaBookOpen className="absolute -bottom-4 -right-4 text-pink-500/15" size={110} />
        <div>
          <h3 className="font-serif text-2xl font-bold tracking-wide">FLASH SALE</h3>
          <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-gray-400">
            Limited time offers on selected titles across the marketplace.
            Compare sellers and grab the best price.
          </p>
        </div>
        <Link to="/books" className="mt-6">
          <Button
            size="sm"
            className="rounded border-0 px-5 text-xs font-bold uppercase text-white shadow-[0_0_14px_rgba(236,72,153,0.4)]"
            style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}
          >
            Explore now
          </Button>
        </Link>
      </motion.div>

      {/* Deal of the day */}
      <motion.div
        variants={fadeUpItem}
        className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        <div>
          <h3 className="font-serif text-2xl font-bold text-brand-dark">
            DEAL OF<br />THE DAY
          </h3>
          <p className="mt-2 text-xs text-gray-500">
            70 day's special offer going
            <br /> for as low as{" "}
            <span
              className="font-bold"
              style={{ background: "linear-gradient(90deg,#f59e0b,#ec4899)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
            >
              80% off
            </span>
          </p>
          <Link to="/books">
            <Button
              size="sm"
              className="mt-4 rounded border-0 px-5 text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}
            >
              Buy Now
            </Button>
          </Link>
        </div>
        <img
          src="https://covers.openlibrary.org/b/isbn/9781501124020-L.jpg"
          alt="Deal of the day"
          className="h-36 w-24 rotate-6 rounded shadow-lg"
        />
      </motion.div>

      {/* Latest Arrival */}
      <motion.div
        variants={fadeUpItem}
        className="relative flex flex-col justify-between overflow-hidden rounded-xl p-7 text-white transition duration-300 hover:-translate-y-1"
        style={{ background: "linear-gradient(135deg,#0e7490,#0f0d1a)" }}
      >
        <FaBookOpen className="absolute -top-4 -right-4 text-cyan-400/15" size={110} />
        <div>
          <h3 className="font-serif text-2xl font-bold tracking-wide">LATEST<br />ARRIVAL</h3>
          <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-gray-300">
            Take a sneak peek at the newest titles added by our sellers this week.
          </p>
        </div>
        <Link to="/books" className="mt-6">
          <Button
            variant="outline"
            size="sm"
            className="rounded border-cyan-300/60 px-5 text-xs font-bold uppercase text-cyan-200 hover:bg-cyan-400 hover:text-brand-dark"
          >
            Explore Collection
          </Button>
        </Link>
      </motion.div>
    </motion.section>
  );
}

export function CreatedForYou() {
  return (
    <section className="relative overflow-hidden bg-[#0f0d1a] py-12">
      <div className="pointer-events-none absolute -top-10 left-1/4 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-3">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={revealViewport}
          variants={fadeUpItem}
          className="text-white"
        >
          <h3 className="font-serif text-3xl font-bold leading-tight">
            CREATED<br />FOR YOU
          </h3>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-gray-400">
            Hand-picked business & startup reads our sellers think you'll
            love. One book, many sellers — always the best price.
          </p>
          <Link to="/books?category=Graphic%20Design">
            <Button
              size="sm"
              className="mt-5 rounded border-0 px-5 text-xs font-bold uppercase text-white shadow-[0_0_14px_rgba(16,185,129,0.4)]"
              style={{ background: "linear-gradient(135deg,#10b981,#06b6d4)" }}
            >
              Explore now
            </Button>
          </Link>
        </motion.div>
        <CreatedForYouBooks />
      </div>
    </section>
  );
}

import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

function CreatedForYouBooks() {
  const { data, isLoading } = useQuery({
    queryKey: ["books", "created-for-you"],
    queryFn: () => booksApi.getBooksByTag("created-for-you", 2),
  });

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-44 rounded-xl bg-white/10" />
        <Skeleton className="h-44 rounded-xl bg-white/10" />
      </>
    );
  }

  return (
    <>
      {data?.slice(0, 2).map((book, i) => {
        const best = book.listings
          .filter((l) => l.stock > 0)
          .reduce<typeof book.listings[number] | undefined>((a, b) => (!a || b.price < a.price ? b : a), undefined);
        return (
          <motion.div
            key={book.id}
            initial="hidden"
            whileInView="show"
            viewport={revealViewport}
            variants={fadeUpItem}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={`/books/${book.id}`}
              className="flex gap-4 rounded-xl bg-white p-4 shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <img src={book.coverImage} alt={book.title} className="h-36 w-24 rounded object-cover" />
              <div className="flex min-w-0 flex-col justify-center">
                <h4 className="truncate text-sm font-bold text-brand-dark">{book.title}</h4>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500">{book.description}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-sm font-bold text-brand-dark">{best ? formatPrice(best.price) : "—"}</span>
                  {best && book.maxMrp && book.maxMrp > best.price && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(book.maxMrp)}</span>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </>
  );
}


