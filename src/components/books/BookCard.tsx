import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import type { BookWithListings } from "@/types";
import { formatPrice } from "@/lib/utils";
import { toast } from "react-toastify";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";

interface BookCardProps {
  book: BookWithListings;
  compact?: boolean;
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
      {/* ── Cover image ── */}
      <Link
        to={`/books/${book.id}`}
        className="relative block overflow-hidden rounded-lg bg-gray-100 shadow-sm ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-[0_14px_30px_-10px_rgba(139,92,246,0.35)]"
      >
        <img
          src={book.coverImage}
          alt={book.title}
          className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-110"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {!best && (
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow"
              style={{ background: "linear-gradient(135deg,#ef4444,#be123c)" }}
            >
              Out of stock
            </span>
          )}
          {best && discountPct > 0 && (
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow"
              style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899)" }}
            >
              {discountPct}% off
            </span>
          )}
        </div>

        {/* subtle gradient wash on hover, ties back to the rest of the page */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d1a]/40 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </Link>

      {/* ── Info block ── */}
      <div className={compact ? "pt-2.5" : "pt-3"}>
        {/* Title */}
        <Link to={`/books/${book.id}`}>
          <h3 className="truncate text-[13px] font-semibold leading-snug text-brand-dark transition-colors group-hover:text-purple-600">
            {book.title}
          </h3>
        </Link>

        {/* Author */}
        <p className="mt-0.5 truncate text-[11px] text-gray-500">{book.author}</p>

        {/* Price row */}
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-[13px] font-bold text-brand-dark">
            {best ? formatPrice(best.price) : "—"}
          </span>
          {best && book.maxMrp && book.maxMrp > best.price && (
            <span className="text-[10px] text-gray-400 line-through">
              {formatPrice(book.maxMrp)}
            </span>
          )}
        </div>

        {/* ── Add to cart button — gradient fill, glow on hover ── */}
        <button
          onClick={handleAdd}
          disabled={!best}
          className={[
            "mt-2.5 flex w-full items-center justify-center gap-1.5",
            "h-8 rounded-md px-3",
            "whitespace-nowrap text-[11px] font-semibold",
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
  );
}




