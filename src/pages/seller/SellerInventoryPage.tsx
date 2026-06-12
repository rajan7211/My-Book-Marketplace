import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { SellerLayout } from "./SellerLayout";
import { Card, CardContent } from "@/components/ui/card";
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
    <tr className="hover:bg-gray-50/50">
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <img
            src={listing.book?.coverImage}
            alt=""
            className="h-12 w-9 rounded object-cover"
          />
          <div>
            <p className="font-semibold">{listing.book?.title}</p>
            <p className="text-xs text-gray-500">{listing.book?.author}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        {editing ? (
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="h-9 w-24 rounded-lg border border-gray-300 px-2 text-sm focus:border-brand-yellow focus:outline-none"
          />
        ) : (
          <span className="font-semibold">{formatPrice(listing.price)}</span>
        )}
      </td>

      <td className="px-4 py-3">
        {editing ? (
          <input
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="h-9 w-20 rounded-lg border border-gray-300 px-2 text-sm focus:border-brand-yellow focus:outline-none"
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
            {listing.stock === 0 ? "Out of stock" : `${listing.stock} in stock`}
          </Badge>
        )}
      </td>

      <td className="px-6 py-3 text-right">
        {editing ? (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => update.mutate()}
              disabled={update.isPending}
              className="grid h-8 w-8 place-items-center rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
              aria-label="Save"
            >
              <FiCheck size={15} />
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setPrice(String(listing.price));
                setStock(String(listing.stock));
              }}
              className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
              aria-label="Cancel"
            >
              <FiX size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-brand-dark hover:text-brand-dark"
          >
            <FiEdit2 size={12} /> Edit
          </button>
        )}
      </td>
    </tr>
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

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : !listings?.length ? (
            <p className="py-16 text-center text-sm text-gray-500">
              No listings to manage yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-4">Book</th>
                  <th className="px-4 py-4">Price</th>
                  <th className="px-4 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listings.map((l) => (
                  <InventoryRow key={l.id} listing={l} sellerId={sellerId} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </SellerLayout>
  );
}



