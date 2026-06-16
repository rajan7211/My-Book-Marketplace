import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FiArrowRight,
  FiCheck,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi } from "@/api/orders.api";
import { formatPrice } from "@/lib/utils";

const checkoutSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .required("Full name is required"),
  mobile: Yup.string()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .required("Mobile number is required"),
  address: Yup.string()
    .trim()
    .min(6, "Please enter a complete address")
    .required("Address is required"),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().trim().required("State is required"),
  pincode: Yup.string()
    .matches(/^\d{6}$/, "Enter a valid 6-digit pincode")
    .required("Pincode is required"),
});

interface CheckoutValues {
  fullName: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

type AddressMode = "saved" | "another";

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, updateQuantity, removeItem, clear, totalAmount } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addressMode, setAddressMode] = useState<AddressMode>("saved");

  const savedAddress: CheckoutValues = {
    fullName: user?.name ?? "",
    mobile: "9845436272",
    address: "1324 , sector 80",
    city: "mohali",
    state: "punjab",
    pincode: "149004",
  };

  const emptyAddress: CheckoutValues = {
    fullName: user?.name ?? "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  };

  const placeOrder = useMutation({
    mutationFn: (shippingAddress: string) =>
      ordersApi.placeOrder({
        customerId: user!.customerId!,
        shippingAddress,
        items,
      }),
    onSuccess: (orders) => {
      clear();
      setCheckoutOpen(false);
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(
        orders.length > 1
          ? `${orders.length} orders placed (one per seller). Status: Created`
          : "Order placed successfully! Status: Created"
      );
      navigate("/orders");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const bySeller = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.sellerName] ??= []).push(item);
    return acc;
  }, {});

  const openCheckout = () => {
    if (!isAuthenticated || user?.role !== "CUSTOMER") {
      navigate("/login?redirect=/cart");
      return;
    }
    if (items.length === 0) {
      toast.info("Your cart is empty");
      return;
    }
    setCheckoutOpen(true);
  };

  const buildShippingAddress = (values: CheckoutValues) =>
    [
      values.fullName.trim(),
      values.mobile.trim(),
      values.address.trim(),
      values.city.trim(),
      values.state.trim(),
      values.pincode.trim(),
    ].join(", ");

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F1E6]">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-8 font-serif text-3xl font-bold text-brand-dark">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="rounded-xl bg-white py-24 text-center shadow-sm">
            <FiShoppingBag className="mx-auto text-gray-300" size={56} />
            <h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2>
            <p className="mt-1 text-sm text-gray-500">
              Browse the marketplace and add some books!
            </p>
            <Link to="/books">
              <Button className="mt-6">Browse Books</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Cart items grouped by seller */}
            <div className="space-y-6">
              {Object.entries(bySeller).map(([sellerName, sellerItems]) => (
                <Card key={sellerName}>
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-sm text-gray-500">
                      Sold by{" "}
                      <span className="text-brand-dark">{sellerName}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y divide-gray-100 p-0">
                    {sellerItems.map((item) => (
                      <div key={item.listingId} className="flex gap-4 p-5">
                        <Link to={`/books/${item.bookId}`} className="shrink-0">
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="h-28 w-20 rounded-md object-cover"
                          />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <Link to={`/books/${item.bookId}`}>
                              <h3 className="truncate text-sm font-bold hover:text-brand-yellow-dark">
                                {item.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-gray-500">{item.author}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              {item.stock} available from this seller
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center rounded-lg border border-gray-200">
                              <button
                                onClick={() =>
                                  updateQuantity(item.listingId, item.quantity - 1)
                                }
                                className="grid h-8 w-8 place-items-center text-gray-600 hover:text-brand-dark"
                                aria-label="Decrease"
                              >
                                <FiMinus size={12} />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  if (item.quantity >= item.stock) {
                                    toast.warn(
                                      `Only ${item.stock} in stock for this seller`
                                    );
                                    return;
                                  }
                                  updateQuantity(item.listingId, item.quantity + 1);
                                }}
                                className="grid h-8 w-8 place-items-center text-gray-600 hover:text-brand-dark"
                                aria-label="Increase"
                              >
                                <FiPlus size={12} />
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <button
                                onClick={() => {
                                  removeItem(item.listingId);
                                  toast.info(`Removed "${item.title}" from cart`);
                                }}
                                className="text-gray-400 transition hover:text-red-500"
                                aria-label="Remove item"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* New dark order summary */}
            <aside>
              <div className="sticky top-24 rounded-2xl bg-brand-dark p-6 text-white shadow-xl">
                <h2 className="text-xl font-extrabold uppercase tracking-wide text-brand-yellow">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Items ({items.length})</span>
                    <span>{formatPrice(totalAmount())}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>Delivery</span>
                    <span className="font-bold text-emerald-400">Free</span>
                  </div>
                </div>

                <div className="my-5 h-px bg-white/15" />

                <div className="flex items-center justify-between text-lg font-extrabold">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount())}</span>
                </div>

                <button
                  onClick={openCheckout}
                  className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-yellow text-sm font-bold text-brand-dark transition hover:bg-brand-yellow-dark disabled:opacity-60"
                  disabled={placeOrder.isPending}
                >
                  Proceed to Checkout <FiArrowRight size={16} />
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>

      <Footer />

      {checkoutOpen && (
        <CheckoutModal
          amount={totalAmount()}
          addressMode={addressMode}
          setAddressMode={setAddressMode}
          savedAddress={savedAddress}
          emptyAddress={emptyAddress}
          isPlacing={placeOrder.isPending}
          onClose={() => setCheckoutOpen(false)}
          onPlaceOrder={(values) =>
            placeOrder.mutate(buildShippingAddress(values))
          }
        />
      )}
    </div>
  );
}

function CheckoutModal({
  amount,
  addressMode,
  setAddressMode,
  savedAddress,
  emptyAddress,
  isPlacing,
  onClose,
  onPlaceOrder,
}: {
  amount: number;
  addressMode: AddressMode;
  setAddressMode: (mode: AddressMode) => void;
  savedAddress: CheckoutValues;
  emptyAddress: CheckoutValues;
  isPlacing: boolean;
  onClose: () => void;
  onPlaceOrder: (values: CheckoutValues) => void;
}) {
  const initialValues = addressMode === "saved" ? savedAddress : emptyAddress;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold uppercase tracking-wide text-brand-dark">
            Shipping Address
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-brand-dark"
            aria-label="Close checkout modal"
          >
            <FiX size={18} />
          </button>
        </div>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={checkoutSchema}
          onSubmit={(values) => onPlaceOrder(values)}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="mb-2 text-sm font-bold text-brand-dark">
                  Choose delivery address
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <AddressChoice
                    active={addressMode === "saved"}
                    title="Use saved address"
                    text={`${savedAddress.address}, ${savedAddress.city}, ${savedAddress.state} — ${savedAddress.pincode}`}
                    onClick={() => setAddressMode("saved")}
                  />
                  <AddressChoice
                    active={addressMode === "another"}
                    title="Use another address"
                    text="Enter a different delivery address for this order."
                    onClick={() => setAddressMode("another")}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <CheckoutInput
                  label="Full Name"
                  name="fullName"
                  value={values.fullName}
                  error={touched.fullName ? errors.fullName : undefined}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <CheckoutInput
                  label="Mobile Number"
                  name="mobile"
                  value={values.mobile}
                  error={touched.mobile ? errors.mobile : undefined}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="mt-3">
                <CheckoutInput
                  label="Address"
                  name="address"
                  value={values.address}
                  error={touched.address ? errors.address : undefined}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <CheckoutInput
                  label="City"
                  name="city"
                  value={values.city}
                  error={touched.city ? errors.city : undefined}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <CheckoutInput
                  label="State"
                  name="state"
                  value={values.state}
                  error={touched.state ? errors.state : undefined}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <CheckoutInput
                  label="Pincode"
                  name="pincode"
                  value={values.pincode}
                  error={touched.pincode ? errors.pincode : undefined}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-gray px-4 py-3">
                <span className="text-sm text-gray-500">Payable Amount</span>
                <span className="text-xl font-extrabold text-brand-dark">
                  {formatPrice(amount)}
                </span>
              </div>

              <button
                type="submit"
                disabled={isPlacing}
                className="mt-4 h-11 w-full rounded-full bg-brand-yellow text-sm font-bold text-brand-dark transition hover:bg-brand-yellow-dark disabled:opacity-60"
              >
                {isPlacing ? "Placing Order..." : "Place Order"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

function AddressChoice({
  active,
  title,
  text,
  onClick,
}: {
  active: boolean;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border p-3 text-left transition ${
        active
          ? "border-brand-yellow bg-amber-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {active && (
        <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-brand-yellow text-brand-dark">
          <FiCheck size={12} />
        </span>
      )}
      <p className="pr-6 text-sm font-bold text-brand-dark">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{text}</p>
    </button>
  );
}

function CheckoutInput({
  label,
  name,
  value,
  error,
  onChange,
  onBlur,
}: {
  label: string;
  name: keyof CheckoutValues;
  value: string;
  error?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`h-10 w-full rounded-xl border px-3.5 text-sm outline-none transition focus:ring-2 focus:ring-brand-yellow/30 ${
          error ? "border-red-400" : "border-gray-200 focus:border-brand-yellow"
        }`}
      />
      {error && <span className="mt-1 block text-xs font-medium text-red-500">{error}</span>}
    </label>
  );
}


