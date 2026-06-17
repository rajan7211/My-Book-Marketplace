import { Link } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export function PromoBanners() {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-14 sm:px-6 lg:grid-cols-3">
      {/* Flash Sale */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-brand-dark p-7 text-white">
        <FaBookOpen className="absolute -bottom-4 -right-4 text-white/10" size={110} />
        <div>
          <h3 className="font-serif text-2xl font-bold tracking-wide">
            FLASH SALE
          </h3>
          <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-gray-400">
            Limited time offers on selected titles across the marketplace.
            Compare sellers and grab the best price.
          </p>
        </div>
        <Link to="/books" className="mt-6">
          <Button size="sm" className="rounded px-5 text-xs font-bold uppercase">
            Explore now
          </Button>
        </Link>
      </div>

      {/* Deal of the day */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-7">
        <div>
          <h3 className="font-serif text-2xl font-bold text-brand-dark">
            DEAL OF
            <br />
            THE DAY
          </h3>
          <p className="mt-2 text-xs text-gray-500">
            70 day's special offer going
            <br /> for as low as <span className="font-bold text-brand-dark">80% off</span>
          </p>
          <Link to="/books">
            <Button variant="dark" size="sm" className="mt-4 rounded px-5 text-xs font-bold">
              Buy Now
            </Button>
          </Link>
        </div>
        <img
          src="https://covers.openlibrary.org/b/isbn/9781501124020-L.jpg"
          alt="Deal of the day"
          className="h-36 w-24 rotate-6 rounded shadow-lg"
        />
      </div>

      {/* Latest Arrival */}
      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl bg-brand-dark p-7 text-white">
        <FaBookOpen className="absolute -top-4 -right-4 text-white/10" size={110} />
        <div>
          <h3 className="font-serif text-2xl font-bold tracking-wide">
            LATEST
            <br />
            ARRIVAL
          </h3>
          <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-gray-400">
            Take a sneak peek at the newest titles added by our sellers this
            week.
          </p>
        </div>
        <Link to="/books" className="mt-6">
          <Button
            variant="outline"
            size="sm"
            className="rounded border-white px-5 text-xs font-bold uppercase text-white hover:bg-white hover:text-brand-dark"
          >
            Explore Collection
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function CreatedForYou() {
  return (
    <section className="bg-brand-dark py-12">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-3">
        <div className="text-white">
          <h3 className="font-serif text-3xl font-bold leading-tight">
            CREATED
            <br />
            FOR YOU
          </h3>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-gray-400">
            Hand-picked business & startup reads our sellers think you'll
            love. One book, many sellers — always the best price.
          </p>
          <Link to="/books?category=Graphic%20Design">
            <Button size="sm" className="mt-5 rounded px-5 text-xs font-bold uppercase">
              Explore now
            </Button>
          </Link>
        </div>
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
      {data?.slice(0, 2).map((book) => {
        const best = book.listings.filter((l) => l.stock > 0)
          .reduce<typeof book.listings[number] | undefined>(
            (a, b) => (!a || b.price < a.price ? b : a),
            undefined
          );
        return (
          <Link
            key={book.id}
            to={`/books/${book.id}`}
            className="flex gap-4 rounded-xl bg-white p-4 shadow transition hover:shadow-lg"
          >
            <img
              src={book.coverImage}
              alt={book.title}
              className="h-36 w-24 rounded object-cover"
            />
            <div className="flex min-w-0 flex-col justify-center">
              <h4 className="truncate text-sm font-bold text-brand-dark">
                {book.title}
              </h4>
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                {book.description}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-sm font-bold text-brand-dark">
                  {best ? formatPrice(best.price) : "—"}
                </span>
                {best && book.maxMrp && book.maxMrp > best.price && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(book.maxMrp)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}



