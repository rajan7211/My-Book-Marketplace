import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { SellerLayout } from "./SellerLayout";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { sellerApi, type ListingWithBook } from "@/api/seller.api";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/utils";

/** Inline-editable inventory row: update price & stock (PDF Step 4). */
function InventoryRow({
  listing,
  sellerId,
}: {
  listing: ListingWithBook;
  sellerId: number;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(listing.price));
  const [stock, setStock] = useState(String(listing.stock));

  const update = useMutation({
    mutationFn: () => {
      const p = Number(price);
      const s = Number(stock);
      if (Number.isNaN(p) || p <= 0) throw new Error("Price must be a positive number");
      if (Number.isNaN(s) || s < 0 || !Number.isInteger(s))
        throw new Error("Stock must be a whole number ≥ 0"); // Rule 5
      return sellerApi.updateListing(listing.id, sellerId, { price: p, stock: s });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success(`"${listing.book?.title}" inventory updated`);
      setEditing(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex gap-4">
        {/* Book Cover */}
        <img
          src={listing.book?.coverImage}
          alt={listing.book?.title}
          className="h-20 w-14 rounded-lg object-cover ring-1 ring-gray-100"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-tight line-clamp-2">
            {listing.book?.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{listing.book?.author}</p>

          {/* Price & Stock */}
          <div className="mt-4 flex items-center gap-4">
            {/* Price */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Price</p>
              {editing ? (
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-9 w-24 rounded-lg border border-gray-300 px-3 text-sm focus:border-purple-500 focus:outline-none"
                />
              ) : (
                <p className="font-semibold text-lg">{formatPrice(listing.price)}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Stock</p>
              {editing ? (
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="h-9 w-20 rounded-lg border border-gray-300 px-3 text-sm focus:border-purple-500 focus:outline-none"
                />
              ) : (
                <Badge
                  variant={
                    listing.stock === 0
                      ? "destructive"
                      : listing.stock <= 5
                        ? "warning"
                        : "success"
                  }
                >
                  {listing.stock === 0 ? "Out of stock" : `${listing.stock} left`}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex justify-end border-t pt-4">
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => update.mutate()}
              disabled={update.isPending}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
            >
              <FiCheck size={16} /> Save
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setPrice(String(listing.price));
                setStock(String(listing.stock));
              }}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <FiX size={16} /> Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-black active:scale-[0.985]"
          >
            Edit Price & Stock <span className="text-lg leading-none">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function SellerInventoryPage() {
  const { user } = useAuthStore();
  const sellerId = user!.sellerId!;

  const { data: listings, isLoading } = useQuery({
    queryKey: ["seller", "listings", sellerId],
    queryFn: () => sellerApi.getMyListings(sellerId),
  });

  return (
    <SellerLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Inventory Management</h2>
        <p className="text-sm text-gray-500">
          Update your stock and price. Stock can never go negative, and you can
          only edit your own listings.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : !listings?.length ? (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <p className="text-lg font-medium">No listings yet</p>
          <p className="text-sm text-gray-500 mt-1">Start adding books to your inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <InventoryRow key={listing.id} listing={listing} sellerId={sellerId} />
          ))}
        </div>
      )}
    </SellerLayout>
  );
}



