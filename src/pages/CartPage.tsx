import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { toast } from "react-toastify";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { ordersApi } from "@/api/orders.api";
import { formatPrice } from "@/lib/utils";

const addressSchema = Yup.object({
  shippingAddress: Yup.string()
    .trim()
    .min(10, "Please enter a complete shipping address (min 10 characters)")
    .required("Shipping address is required"),
});

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, updateQuantity, removeItem, clear, totalAmount } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const placeOrder = useMutation({
    mutationFn: (shippingAddress: string) =>
      ordersApi.placeOrder({
        customerId: user!.customerId!,
        shippingAddress,
        items,
      }),
    onSuccess: (orders) => {
      clear();
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

  // group cart lines by seller for display
  const bySeller = items.reduce<Record<string, typeof items>>((acc, item) => {
    (acc[item.sellerName] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen flex-col bg-brand-gray">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-8 font-serif text-3xl font-bold">Shopping Cart</h1>

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

            {/* Summary + shipping address + place order */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({items.length} items)</span>
                      <span>{formatPrice(totalAmount())}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold">
                      <span>Total</span>
                      <span>{formatPrice(totalAmount())}</span>
                    </div>
                  </div>

                  {isAuthenticated && user?.role === "CUSTOMER" ? (
                    <Formik
                      initialValues={{ shippingAddress: "" }}
                      validationSchema={addressSchema}
                      onSubmit={(values) =>
                        placeOrder.mutate(values.shippingAddress.trim())
                      }
                    >
                      {({ values, errors, touched, handleChange, handleBlur }) => (
                        <Form className="space-y-3">
                          <div>
                            <label
                              htmlFor="shippingAddress"
                              className="mb-1.5 block text-sm font-medium"
                            >
                              Shipping Address
                            </label>
                            <textarea
                              id="shippingAddress"
                              name="shippingAddress"
                              rows={3}
                              value={values.shippingAddress}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              placeholder="House no, Street, City, State, PIN code"
                              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow/60 ${
                                touched.shippingAddress && errors.shippingAddress
                                  ? "border-red-400"
                                  : "border-gray-200"
                              }`}
                            />
                            {touched.shippingAddress && errors.shippingAddress && (
                              <p className="mt-1 text-xs font-medium text-red-500">
                                {errors.shippingAddress}
                              </p>
                            )}
                          </div>
                          <Button
                            type="submit"
                            className="h-11 w-full rounded-lg font-bold"
                            disabled={placeOrder.isPending}
                          >
                            {placeOrder.isPending
                              ? "Placing order..."
                              : "Place Order"}
                          </Button>
                          <p className="text-center text-[11px] text-gray-400">
                            No payment required — this marketplace simulates
                            checkout via order statuses.
                          </p>
                        </Form>
                      )}
                    </Formik>
                  ) : (
                    <Button
                      className="h-11 w-full rounded-lg font-bold"
                      onClick={() => navigate("/login?redirect=/cart")}
                    >
                      Login to Place Order
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}



