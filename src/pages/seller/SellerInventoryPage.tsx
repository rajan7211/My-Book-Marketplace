import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import { SellerLayout } from "./SellerLayout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { sellerApi, type ListingWithBook } from "@/api/seller.api";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/utils";

/** =========================
 *  Inventory Row (UPGRADED UI)
 *  ========================= */
function InventoryRow({
  listing,
  sellerId,
  index,
}: {
  listing: ListingWithBook;
  sellerId: number;
  index: number;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(listing.price));
  const [stock, setStock] = useState(String(listing.stock));

  const update = useMutation({
    mutationFn: () => {
      const p = Number(price);
      const s = Number(stock);

      if (Number.isNaN(p) || p <= 0)
        throw new Error("Price must be a positive number");

      if (Number.isNaN(s) || s < 0 || !Number.isInteger(s))
        throw new Error("Stock must be a whole number ≥ 0");

      return sellerApi.updateListing(listing.id, sellerId, {
        price: p,
        stock: s,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });

      toast.success(`"${listing.book?.title}" updated`);
      setEditing(false);
    },

    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Top Section */}
      <div className="flex gap-4">
        <img
          src={listing.book?.coverImage}
          alt={listing.book?.title}
          className="h-20 w-14 rounded-lg object-cover ring-1 ring-gray-100"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base line-clamp-2">
            {listing.book?.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {listing.book?.author}
          </p>

          {/* Price + Stock */}
          <div className="mt-4 flex items-center gap-6">
            {/* Price */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Price
              </p>

              {editing ? (
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 h-9 w-24 rounded-lg border border-gray-300 px-3 text-sm focus:border-purple-500 focus:outline-none"
                />
              ) : (
                <p className="font-semibold text-lg mt-1">
                  {formatPrice(listing.price)}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">
                Stock
              </p>

              {editing ? (
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="mt-1 h-9 w-20 rounded-lg border border-gray-300 px-3 text-sm focus:border-purple-500 focus:outline-none"
                />
              ) : (
                <Badge
                  className="mt-1"
                  variant={
                    listing.stock === 0
                      ? "destructive"
                      : listing.stock <= 5
                      ? "warning"
                      : "success"
                  }
                >
                  {listing.stock === 0
                    ? "Out of stock"
                    : `${listing.stock} left`}
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
className="flex items-center gap-1.5 rounded-md bg-black px-2.5 py-1 text-[11px] font-medium text-white hover:bg-gray-900 transition"          >
            Edit Price & Stock <span className="text-lg">→</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

/** =========================
 *  MAIN PAGE
 *  ========================= */
export default function SellerInventoryPage() {
  const { user } = useAuthStore();
  const sellerId = user!.sellerId!;

  const { data: listings, isLoading } = useQuery({
    queryKey: ["seller", "listings", sellerId],
    queryFn: () => sellerApi.getMyListings(sellerId),
  });

  return (
    <SellerLayout>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Inventory Management</h2>
        <p className="text-sm text-gray-500">
          Update price & stock. Stock cannot go below 0.
        </p>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : !listings?.length ? (
        /* Empty */
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <p className="text-lg font-medium">No listings yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Start adding books to your inventory.
          </p>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((listing, i) => (
            <InventoryRow
              key={listing.id}
              listing={listing}
              sellerId={sellerId}
              index={i}
            />
          ))}
        </div>
      )}
    </SellerLayout>
  );
}


