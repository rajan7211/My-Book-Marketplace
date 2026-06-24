import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FiPlus, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { SellerLayout } from "./SellerLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FormField } from "@/components/ui/form-field";
import { sellerApi } from "@/api/seller.api";
import { useAuthStore } from "@/store/auth.store";
import { formatPrice, cn } from "@/lib/utils";

// validation 

const listingSchema = Yup.object({
  bookId: Yup.number().min(1, "Please select a book").required("Please select a book"),
  price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be greater than zero")
    .required("Price is required"),
  mrp: Yup.number()
    .typeError("MRP must be a number")
    .positive("MRP must be greater than zero")
    .min(Yup.ref("price"), "MRP cannot be lower than selling price")
    .required("MRP is required"),
  stock: Yup.number()
    .typeError("Stock must be a number")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative") // Rule 5
    .required("Stock is required"),
});

const newBookSchema = Yup.object({
  isbn: Yup.string()
    .matches(/^\d{13}$/, "ISBN must be exactly 13 digits")
    .required("ISBN is required"),
  title: Yup.string().trim().min(2, "Title is too short").required("Title is required"),
  author: Yup.string().trim().min(2, "Author is too short").required("Author is required"),
  publisher: Yup.string().trim().required("Publisher is required"),
  category: Yup.string().required("Category is required"),
  description: Yup.string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .required("Description is required"),
});

const CATEGORIES = ["Fictions", "Biography", "History", "Graphic Design", "Self Help"];

//  page 

export default function SellerListingsPage() {
  const { user } = useAuthStore();
  const sellerId = user!.sellerId!;
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<"closed" | "listing" | "book">("closed");

  const { data: listings, isLoading } = useQuery({
    queryKey: ["seller", "listings", sellerId],
    queryFn: () => sellerApi.getMyListings(sellerId),
  });

  const { data: approvedBooks } = useQuery({
    queryKey: ["seller", "approvedBooks"],
    queryFn: sellerApi.getApprovedBooks,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["seller"] });
    queryClient.invalidateQueries({ queryKey: ["books"] });
  };

  const createListing = useMutation({
    mutationFn: (v: { bookId: number; price: number; mrp: number; stock: number }) =>
      sellerApi.createListing({ sellerId, ...v }),
    onSuccess: () => {
      invalidate();
      toast.success("Listing created and live on the marketplace!");
      setModal("closed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createBook = useMutation({
    mutationFn: sellerApi.createBook,
    onSuccess: (book) => {
      invalidate();
      toast.success(
        `"${book.title}" submitted. Status: Pending Approval — you can create a listing after the admin approves it.`
      );
      setModal("closed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // books this seller has NOT listed yet (avoid duplicate listings)
  const listedBookIds = new Set(listings?.map((l) => l.bookId));
  const availableBooks = approvedBooks?.filter((b) => !listedBookIds.has(b.id)) ?? [];

  return (
    <SellerLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">My Listings</h2>
          <p className="text-sm text-gray-500">
            Your offers on marketplace books — price & stock are yours alone.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="dark" onClick={() => setModal("book")}>
            <FiPlus size={15} /> Submit New Book
          </Button>
          <Button onClick={() => setModal("listing")}>
            <FiPlus size={15} /> Create Listing
          </Button>
        </div>
      </div>

      {/* Listings - Interactive Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : !listings?.length ? (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <p className="text-lg font-medium">No listings yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first listing to start selling!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex gap-4">
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

                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 font-mono">
                    {listing.book?.isbn}
                  </div>
                </div>
              </div>

              {/* Price & Stock Info */}
              <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Price</p>
                  <p className="font-semibold text-lg">{formatPrice(listing.price)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">MRP</p>
                  <p className="font-medium text-gray-400 line-through">
                    {formatPrice(listing.mrp)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Stock</p>
                  <Badge
                    variant={
                      listing.stock === 0
                        ? "destructive"
                        : listing.stock <= 5
                          ? "warning"
                          : "success"
                    }
                  >
                    {listing.stock} left
                  </Badge>
                </div>
              </div>

              {/* Status */}
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <Badge variant={listing.status === "ACTIVE" ? "success" : "outline"}>
                  {listing.status.toLowerCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === "listing" && (
        <Modal title="Create Listing" onClose={() => setModal("closed")}>
          <p className="mb-4 text-xs text-gray-500">
            Select an approved book from the catalog and set your own price &
            stock. Can't find the book?{" "}
            <button
              className="font-semibold text-brand-yellow-dark underline"
              onClick={() => setModal("book")}
            >
              Submit a new book
            </button>
          </p>
          <Formik
            initialValues={{ bookId: 0, price: "", mrp: "", stock: "" }}
            validationSchema={listingSchema}
            onSubmit={(v) =>
              createListing.mutate({
                bookId: Number(v.bookId),
                price: Number(v.price),
                mrp: Number(v.mrp),
                stock: Number(v.stock),
              })
            }
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Book</label>
                  <select
                    value={values.bookId}
                    onChange={(e) => setFieldValue("bookId", Number(e.target.value))}
                    className={cn(
                      "h-11 w-full rounded-lg border bg-white px-3 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/50",
                      touched.bookId && errors.bookId ? "border-red-400" : "border-gray-200"
                    )}
                  >
                    <option value={0}>— Select an approved book —</option>
                    {availableBooks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} — {b.author} ({b.isbn})
                      </option>
                    ))}
                  </select>
                  {touched.bookId && errors.bookId && (
                    <p className="mt-1 text-xs font-medium text-red-500">{errors.bookId}</p>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <FormField name="price" label="Price (₹)" placeholder="399" />
                  <FormField name="mrp" label="MRP (₹)" placeholder="499" />
                  <FormField name="stock" label="Stock" placeholder="50" />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full font-bold"
                  disabled={createListing.isPending}
                >
                  {createListing.isPending ? "Creating..." : "Create Listing"}
                </Button>
              </Form>
            )}
          </Formik>
        </Modal>
      )}

      {modal === "book" && (
        <Modal title="Submit New Book" onClose={() => setModal("closed")}>
          <p className="mb-4 text-xs text-gray-500">
            The book will be <b>Pending Approval</b> until the admin reviews it.
            Duplicate ISBNs are rejected automatically.
          </p>
          <Formik
            initialValues={{
              isbn: "",
              title: "",
              author: "",
              publisher: "",
              category: "",
              description: "",
            }}
            validationSchema={newBookSchema}
            onSubmit={(v) => createBook.mutate(v)}
          >
            {({ values, setFieldValue, errors, touched, handleChange, handleBlur }) => (
              <Form className="space-y-4">
                <FormField name="isbn" label="ISBN (13 digits)" placeholder="9781847941831" />
                <FormField name="title" label="Title" placeholder="Book title" />
                <div className="grid grid-cols-2 gap-3">
                  <FormField name="author" label="Author" placeholder="Author name" />
                  <FormField name="publisher" label="Publisher" placeholder="Publisher" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Category</label>
                  <select
                    value={values.category}
                    onChange={(e) => setFieldValue("category", e.target.value)}
                    className={cn(
                      "h-11 w-full rounded-lg border bg-white px-3 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/50",
                      touched.category && errors.category ? "border-red-400" : "border-gray-200"
                    )}
                  >
                    <option value="">— Select category —</option>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  {touched.category && errors.category && (
                    <p className="mt-1 text-xs font-medium text-red-500">{errors.category}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Short description of the book (min 20 characters)"
                    className={cn(
                      "w-full rounded-lg border px-3.5 py-2.5 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/50",
                      touched.description && errors.description
                        ? "border-red-400"
                        : "border-gray-200"
                    )}
                  />
                  {touched.description && errors.description && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {errors.description}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full font-bold"
                  disabled={createBook.isPending}
                >
                  {createBook.isPending ? "Submitting..." : "Submit for Approval"}
                </Button>
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </SellerLayout>
  );
}


function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <FiX size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}


