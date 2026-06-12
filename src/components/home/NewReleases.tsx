import { Link, useNavigate } from "react-router-dom";
import { FiChevronRight, FiShoppingCart } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { booksApi } from "@/api/books.api";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "react-toastify";
import type { BookWithListings } from "@/types";

function ReleaseCard({ book }: { book: BookWithListings }) {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { user, isAuthenticated } = useAuthStore();

  const inStock = book.listings.filter((l) => l.stock > 0);
  const best = inStock.length
    ? inStock.reduce((a, b) => (b.price < a.price ? b : a))
    : undefined;

  const handleAdd = () => {
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
    res.ok ? toast.success(`"${book.title}" added to basket`) : toast.error(res.message);
  };

  return (
    <div className="flex gap-4 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md">
      <Link to={`/books/${book.id}`} className="shrink-0">
        <img
          src={book.coverImage}
          alt={book.title}
          className="h-40 w-28 rounded-md object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-col justify-between py-1">
        <div>
          <Link to={`/books/${book.id}`}>
            <h3 className="truncate text-sm font-bold text-brand-dark hover:text-brand-yellow-dark">
              {book.title}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
            {book.description}
          </p>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold">
              {best ? formatPrice(best.price) : "—"}
            </span>
            {best && book.maxMrp && book.maxMrp > best.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(book.maxMrp)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="mt-2.5 flex items-center gap-1.5 rounded-md bg-brand-dark px-3.5 py-2 text-[11px] font-semibold text-white transition hover:bg-brand-dark-2"
          >
            <FiShoppingCart size={12} /> Add to basket
          </button>
        </div>
      </div>
    </div>
  );
}

export function NewReleases() {
  const { data, isLoading } = useQuery({
    queryKey: ["books", "new-release"],
    queryFn: () => booksApi.getBooksByTag("new-release", 3),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-2 flex items-end justify-between">
        <h2 className="section-title-underline font-serif text-2xl font-bold sm:text-3xl">
          New Releases
        </h2>
        <Link
          to="/books"
          className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-dark"
        >
          View all <FiChevronRight size={15} />
        </Link>
      </div>
      <p className="mb-7 text-sm text-gray-500">
        What's new? Browse latest titles in the new releases category to
        discover your next read!
      </p>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))
          : data?.map((book) => <ReleaseCard key={book.id} book={book} />)}
      </div>
    </section>
  );
}



