import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiMinus, FiPlus, FiShoppingCart, FiChevronRight, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { booksApi } from "@/api/books.api";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { cn, formatPrice } from "@/lib/utils";

export default function BookDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { user, isAuthenticated } = useAuthStore();

  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", id],
    queryFn: () => booksApi.getBookById(Number(id)),
    enabled: Boolean(id),
  });

  const selected = book?.listings.find((l) => l.id === selectedListingId);

  const handleAddToCart = () => {
    if (!book) return;
    if (!isAuthenticated) {
      toast.warn("Please login to add items to cart");
      navigate(`/login?redirect=/books/${book.id}`);
      return;
    }
    if (user?.role !== "CUSTOMER") {
      toast.warn("Only customers can purchase books");
      return;
    }
    // PDF: customer MUST select a seller before adding to cart
    if (!selected) {
      toast.error("Please select a seller first");
      return;
    }
    if (selected.stock <= 0) {
      toast.error("This seller is out of stock");
      return;
    }
    if (quantity > selected.stock) {
      toast.error(`Only ${selected.stock} available from this seller`);
      return;
    }

    const res = addItem({
      listingId: selected.id,
      bookId: book.id,
      sellerId: selected.sellerId,
      sellerName: selected.seller?.businessName ?? "Seller",
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      price: selected.price,
      quantity,
      stock: selected.stock,
    });
    res.ok
      ? toast.success(`Added ${quantity} × "${book.title}" to cart`)
      : toast.error(res.message);
  };

  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-7 flex items-center gap-1.5 text-sm text-gray-500">
          <Link to="/" className="hover:text-brand-dark">Home</Link>
          <FiChevronRight size={13} />
          <Link to="/books" className="hover:text-brand-dark">Books</Link>
          <FiChevronRight size={13} />
          <span className="truncate font-medium text-brand-dark">
            {book?.title ?? "..."}
          </span>
        </nav>

        {isLoading || !book ? (
          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            <Skeleton className="aspect-[2/3] rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-9 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-32" />
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
            {/* Cover */}
            <div>
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full rounded-xl shadow-lg"
              />
            </div>

            {/* Info + seller comparison */}
            <div>
              <Badge variant="outline" className="mb-3">{book.category}</Badge>
              <h1 className="font-serif text-3xl font-bold text-brand-dark sm:text-4xl">
                {book.title}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                by <span className="font-semibold">{book.author}</span>
                <span className="mx-2 text-gray-300">|</span>
                Publisher: {book.publisher}
                <span className="mx-2 text-gray-300">|</span>
                ISBN: <span className="font-mono">{book.isbn}</span>
              </p>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-gray-600">
                {book.description}
              </p>

              {/* Seller listings — compare available sellers */}
              <div className="mt-8">
                <h2 className="mb-1 text-lg font-bold text-brand-dark">
                  Available Sellers ({book.listings.length})
                </h2>
                <p className="mb-4 text-xs text-gray-500">
                  Select a seller to add this book to your cart. Prices and
                  stock are managed independently by each seller.
                </p>

                {book.listings.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                    No sellers are currently offering this book.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {book.listings
                      .slice()
                      .sort((a, b) => a.price - b.price)
                      .map((listing, idx) => {
                        const out = listing.stock <= 0;
                        const isSelected = selectedListingId === listing.id;
                        return (
                          <button
                            key={listing.id}
                            disabled={out}
                            onClick={() => {
                              setSelectedListingId(listing.id);
                              setQuantity(1);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between gap-4 rounded-xl border-2 bg-white p-4 text-left transition",
                              out && "opacity-50",
                              isSelected
                                ? "border-brand-yellow shadow-md"
                                : "border-transparent shadow-sm hover:border-gray-200"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                                  isSelected
                                    ? "border-brand-yellow bg-brand-yellow text-brand-dark"
                                    : "border-gray-300"
                                )}
                              >
                                {isSelected && <FiCheck size={12} />}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-brand-dark">
                                  {listing.seller?.businessName}
                                  {idx === 0 && !out && (
                                    <Badge className="ml-2">Best Price</Badge>
                                  )}
                                </p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                  {out ? (
                                    <span className="font-semibold text-red-500">
                                      Out of stock
                                    </span>
                                  ) : (
                                    <>
                                      {listing.stock} in stock
                                      {listing.stock <= 5 && (
                                        <span className="ml-1 font-semibold text-amber-600">
                                          — only a few left!
                                        </span>
                                      )}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-brand-dark">
                                {formatPrice(listing.price)}
                              </p>
                              {listing.mrp > listing.price && (
                                <p className="text-xs text-gray-400 line-through">
                                  {formatPrice(listing.mrp)}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Quantity + Add to cart */}
              {selected && selected.stock > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="grid h-11 w-10 place-items-center text-gray-600 hover:text-brand-dark"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => {
                          if (q >= selected.stock) {
                            toast.warn(
                              `Only ${selected.stock} available from this seller`
                            );
                            return q;
                          }
                          return q + 1;
                        })
                      }
                      className="grid h-11 w-10 place-items-center text-gray-600 hover:text-brand-dark"
                      aria-label="Increase quantity"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>

                  <Button onClick={handleAddToCart} className="h-11 rounded-lg px-8">
                    <FiShoppingCart size={16} />
                    Add to Cart — {formatPrice(selected.price * quantity)}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}



