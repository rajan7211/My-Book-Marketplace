import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import type { BookWithListings } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";

interface BookCardProps {
  book: BookWithListings;
  compact?: boolean;
}

function getBookRating(bookId: number) {
  // Deterministic display rating so every book keeps the same rating on refresh.
  const ratings = [4.5, 4.7, 4.8, 4.6, 5];
  return ratings[bookId % ratings.length];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-[#f34a24]" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starNumber = index + 1;
        if (rating >= starNumber) {
          return <FaStar key={index} size={12} />;
        }
        if (rating >= starNumber - 0.5) {
          return <FaStarHalfAlt key={index} size={12} />;
        }
        return <FaRegStar key={index} size={12} />;
      })}
    </div>
  );
}

export function BookCard({ book, compact = false }: BookCardProps) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { user, isAuthenticated } = useAuthStore();

  const inStock = book.listings.filter((l) => l.stock > 0);
  const best = inStock.length
    ? inStock.reduce((a, b) => (b.price < a.price ? b : a))
    : undefined;

  const discountPct =
    best && book.maxMrp && book.maxMrp > best.price
      ? Math.round(((book.maxMrp - best.price) / book.maxMrp) * 100)
      : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warn("Please login to add items to cart");
      navigate("/login");
      return;
    }
    if (user?.role !== "CUSTOMER") {
      toast.warn("Only customers can purchase books");
      return;
    }
    if (!best) {
      toast.error("This book is currently out of stock");
      return;
    }
    const res = addItem({
      listingId: best.id,
      bookId: book.id,
      sellerId: best.sellerId,
      sellerName: best.seller?.businessName ?? "Seller",
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      price: best.price,
      quantity: 1,
      stock: best.stock,
    });
    res.ok
      ? toast.success(`"${book.title}" added to cart`)
      : toast.error(res.message);
  };

  return (
    <div className="group flex w-full flex-col transition-transform duration-300 hover:-translate-y-1">
      {/* Cover image: wider shelf-style spacing like the reference layout */}
      <Link
        to={`/books/${book.id}`}
        className="relative grid h-[230px] place-items-center overflow-hidden rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/[0.03] transition-shadow duration-300 group-hover:shadow-[0_18px_38px_-16px_rgba(139,92,246,0.38)] sm:h-[258px]"
      >
        <img
          src={book.coverImage}
          alt={book.title}
          className="h-[205px] max-w-[72%] object-contain drop-shadow-xl transition duration-300 group-hover:scale-105 sm:h-[238px]"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {!best && (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow"
              style={{ background: "linear-gradient(135deg,#ef4444,#be123c)" }}
            >
              Out of stock
            </span>
          )}
          {best && discountPct > 0 && (
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(245,158,11,0.8)]"
              style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899)" }}
            >
              {discountPct}% off
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d1a]/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </Link>

      {/* Info block */}
      <div className={compact ? "pt-3" : "pt-3.5"}>
        <StarRating rating={getBookRating(book.id)} />

        <Link to={`/books/${book.id}`}>
          <h3 className="mt-1.5 truncate text-[14px] font-bold leading-snug text-brand-dark transition-colors group-hover:text-purple-600">
            {book.title}
          </h3>
        </Link>

        <p className="mt-1 truncate text-[12px] text-gray-500">{book.author}</p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-1.5">
            <span className="text-[16px] font-extrabold text-brand-dark">
              {best ? formatPrice(best.price) : "—"}
            </span>
            {best && book.maxMrp && book.maxMrp > best.price && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(book.maxMrp)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!best}
            className={[
              "flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl px-4",
              "whitespace-nowrap text-[12px] font-semibold",
              "transition-all duration-200 active:scale-[.98]",
              best
                ? "text-white shadow-sm hover:shadow-[0_0_14px_rgba(139,92,246,0.45)]"
                : "cursor-not-allowed border border-gray-200 text-gray-400",
            ].join(" ")}
            style={
              best
                ? { background: "linear-gradient(135deg,#1a1625,#0f0d1a)" }
                : undefined
            }
            aria-label={best ? `Add ${book.title} to cart` : "Out of stock"}
          >
            <FiShoppingCart size={12} strokeWidth={2} className="shrink-0" aria-hidden="true" />
            <span>Add to cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
