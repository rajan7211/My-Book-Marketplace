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
    <div className="group flex w-full flex-col transition-transform duration-200 hover:-translate-y-0.5">
      {/* ── Cover image ── */}
      <Link
        to={`/books/${book.id}`}
        className="relative block overflow-hidden rounded-lg bg-gray-100 shadow-sm ring-1 ring-black/5 transition-shadow duration-300 group-hover:shadow-md"
      >
        <img
          src={book.coverImage}
          alt={book.title}
          className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {!best && (
          <span className="absolute left-2 top-2 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Out of stock
          </span>
        )}
      </Link>

      {/* ── Info block ── */}
      <div className={compact ? "pt-2.5" : "pt-3"}>
        {/* Title */}
        <Link to={`/books/${book.id}`}>
          <h3 className="truncate text-[13px] font-semibold leading-snug text-brand-dark transition-colors hover:text-brand-yellow-dark">
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

        {/* ── Add to cart button — modern, compact, full-width ── */}
        <button
          onClick={handleAdd}
          disabled={!best}
          className={[
            "mt-2.5 flex w-full items-center justify-center gap-1.5",
            "h-8 rounded-md border px-3",
            "whitespace-nowrap text-[11px] font-semibold",
            "transition-colors duration-150",
            best
              ? "border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white active:scale-[.98]"
              : "cursor-not-allowed border-gray-200 text-gray-400",
          ].join(" ")}
          aria-label={best ? `Add ${book.title} to cart` : "Out of stock"}
        >
          <FiShoppingCart
            size={12}
            strokeWidth={2}
            className="shrink-0"
            aria-hidden="true"
          />
          <span>Add to cart</span>
        </button>
      </div>
    </div>
  );
}


