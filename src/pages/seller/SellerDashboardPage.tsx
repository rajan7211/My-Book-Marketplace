import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiActivity,
  FiAlertTriangle,
  FiArchive,
  FiArrowRight,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiEdit3,
  FiPackage,
  FiPlusCircle,
  FiShoppingBag,
  FiTrendingUp,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";
import { SellerLayout } from "./SellerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { sellerApi } from "@/api/seller.api";
import { useAuthStore } from "@/store/auth.store";
import { cn, formatPrice } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    icon: typeof FiClock;
    badge: "warning" | "default" | "dark" | "success" | "destructive";
    color: string;
  }
> = {
  CREATED: {
    label: "New",
    icon: FiClock,
    badge: "warning",
    color: "bg-amber-100 text-amber-700",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: FiCheckCircle,
    badge: "default",
    color: "bg-yellow-100 text-yellow-700",
  },
  SHIPPED: {
    label: "Shipped",
    icon: FiTruck,
    badge: "dark",
    color: "bg-blue-100 text-blue-700",
  },
  DELIVERED: {
    label: "Delivered",
    icon: FiCheckCircle,
    badge: "success",
    color: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: FiXCircle,
    badge: "destructive",
    color: "bg-red-100 text-red-700",
  },
};

export default function SellerDashboardPage() {
  const { user } = useAuthStore();
  const sellerId = user?.sellerId ?? 0;

  const { data: listings, isLoading: loadingListings } = useQuery({
    queryKey: ["seller", "listings", sellerId],
    queryFn: () => sellerApi.getMyListings(sellerId),
    enabled: sellerId > 0,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ["seller", "orders", sellerId],
    queryFn: () => sellerApi.getMyOrders(sellerId),
    enabled: sellerId > 0,
  });

  const isLoading = loadingListings || loadingOrders;
  const sellerListings = useMemo(() => listings ?? [], [listings]);
  const sellerOrders = useMemo(() => orders ?? [], [orders]);

  const activeListings = sellerListings.filter((l) => l.status === "ACTIVE");
  const inactiveListings = sellerListings.filter((l) => l.status === "INACTIVE");
  const lowStock = sellerListings.filter((l) => l.stock > 0 && l.stock <= 5);
  const outOfStock = sellerListings.filter((l) => l.stock === 0);
  const totalStock = sellerListings.reduce((sum, l) => sum + l.stock, 0);
  const inventoryValue = sellerListings.reduce(
    (sum, l) => sum + l.price * l.stock,
    0
  );

  const newOrders = sellerOrders.filter((o) => o.status === "CREATED");
  const openOrders = sellerOrders.filter((o) =>
    ["CREATED", "ACCEPTED", "SHIPPED"].includes(o.status)
  );
  const completedOrders = sellerOrders.filter((o) => o.status === "DELIVERED");
  const revenue = sellerOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const orderCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      CREATED: 0,
      ACCEPTED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    sellerOrders.forEach((order) => {
      counts[order.status] += 1;
    });
    return counts;
  }, [sellerOrders]);

  const topBooks = useMemo(() => {
    const map = new Map<string, { title: string; quantity: number; revenue: number }>();

    sellerOrders
      .filter((order) => order.status !== "CANCELLED")
      .forEach((order) => {
        order.items.forEach((item) => {
          const current = map.get(item.title) ?? {
            title: item.title,
            quantity: 0,
            revenue: 0,
          };
          current.quantity += item.quantity;
          current.revenue += item.price * item.quantity;
          map.set(item.title, current);
        });
      });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sellerOrders]);

  const stats = [
    {
      label: "Active Listings",
      value: activeListings.length,
      helper: `${inactiveListings.length} inactive listing${inactiveListings.length === 1 ? "" : "s"}`,
      icon: FiBookOpen,
      color: "bg-blue-100 text-blue-600",
      to: "/seller/listings",
    },
    {
      label: "New Orders",
      value: newOrders.length,
      helper: `${openOrders.length} open order${openOrders.length === 1 ? "" : "s"}`,
      icon: FiPackage,
      color: "bg-amber-100 text-amber-600",
      to: "/seller/orders",
    },
    {
      label: "Inventory Stock",
      value: totalStock,
      helper: `${outOfStock.length} out of stock`,
      icon: FiArchive,
      color: "bg-purple-100 text-purple-600",
      to: "/seller/inventory",
    },
    {
      label: "Revenue",
      value: formatPrice(revenue),
      helper: "non-cancelled orders",
      icon: FiTrendingUp,
      color: "bg-green-100 text-green-600",
      to: "/seller/orders",
    },
  ];

  return (
    <SellerLayout>
      {/* Seller-only welcome panel */}
      <section className="mb-6 overflow-hidden rounded-2xl bg-brand-dark text-white shadow-sm">
        <div className="relative p-6 sm:p-7">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brand-yellow/20 blur-3xl" />
          <div className="absolute bottom-0 right-28 h-24 w-24 rounded-full bg-purple-500/20 blur-2xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge className="mb-3 bg-brand-yellow text-brand-dark">
                Seller Dashboard
              </Badge>
              <h1 className="font-serif text-2xl font-bold sm:text-3xl lux-text-gradient">
                Welcome back, {user?.name ?? "Seller"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-300">
                Manage your listings, inventory, and orders from one seller-only
                control center. No admin sections are shown here.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/seller/listings"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-yellow px-4 text-sm font-bold text-brand-dark transition hover:bg-brand-yellow-dark"
              >
                <FiPlusCircle size={16} /> Create Listing
              </Link>
              <Link
                to="/seller/inventory"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <FiEdit3 size={16} /> Update Stock
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Seller stats */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, helper, icon: Icon, color, to }) => (
          <Link key={label} to={to} className="group block">
            <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:shadow-md">
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
                      color
                    )}
                  >
                    <Icon size={21} />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-brand-dark">
                      {isLoading ? "…" : value}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">{helper}</p>
                  </div>
                </div>
                <FiArrowRight
                  size={16}
                  className="mt-1 text-gray-300 transition group-hover:translate-x-1 group-hover:text-brand-yellow-dark"
                />
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      {/* Quick seller sections */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        <SellerSectionCard
          icon={FiBookOpen}
          title="Listings"
          description="Create offers for approved books and submit new books for approval."
          to="/seller/listings"
          primary="Manage Listings"
          meta={`${sellerListings.length} total listing${sellerListings.length === 1 ? "" : "s"}`}
        />
        <SellerSectionCard
          icon={FiArchive}
          title="Inventory"
          description="Update stock, price, MRP, and active/inactive status for your books."
          to="/seller/inventory"
          primary="Open Inventory"
          meta={`${formatPrice(inventoryValue)} stock value`}
        />
        <SellerSectionCard
          icon={FiShoppingBag}
          title="Orders"
          description="Accept, ship, deliver, or cancel orders using valid seller transitions."
          to="/seller/orders"
          primary="Process Orders"
          meta={`${sellerOrders.length} total order${sellerOrders.length === 1 ? "" : "s"}`}
        />
      </section>

      {/* Attention + status */}
      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-dark">Needs Attention</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Seller actions that may need quick follow-up.
                </p>
              </div>
              <FiAlertTriangle className="text-amber-500" size={20} />
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : (
              <div className="space-y-3">
                <AttentionRow
                  label="New orders waiting"
                  value={newOrders.length}
                  detail="Accept or cancel new orders from customers."
                  variant={newOrders.length > 0 ? "warning" : "success"}
                  to="/seller/orders"
                />
                <AttentionRow
                  label="Low stock listings"
                  value={lowStock.length}
                  detail="Restock books with 1 to 5 items remaining."
                  variant={lowStock.length > 0 ? "warning" : "success"}
                  to="/seller/inventory"
                />
                <AttentionRow
                  label="Out of stock listings"
                  value={outOfStock.length}
                  detail="Add stock or mark listings inactive."
                  variant={outOfStock.length > 0 ? "danger" : "success"}
                  to="/seller/inventory"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-dark">Order Pipeline</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Current status of your seller orders.
                </p>
              </div>
              <Link
                to="/seller/orders"
                className="text-xs font-bold text-brand-yellow-dark hover:underline"
              >
                View all orders →
              </Link>
            </div>

            {isLoading ? (
              <Skeleton className="h-40 rounded-xl" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-5">
                {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((status) => {
                  const meta = ORDER_STATUS_META[status];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={status}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center"
                    >
                      <span
                        className={cn(
                          "mx-auto grid h-9 w-9 place-items-center rounded-full",
                          meta.color
                        )}
                      >
                        <Icon size={16} />
                      </span>
                      <p className="mt-2 text-lg font-bold text-brand-dark">
                        {orderCounts[status]}
                      </p>
                      <p className="text-[11px] font-medium text-gray-500">
                        {meta.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Inventory + orders */}
      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-dark">Inventory Health</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Low and out-of-stock seller listings.
                </p>
              </div>
              <Link
                to="/seller/inventory"
                className="text-xs font-bold text-brand-yellow-dark hover:underline"
              >
                Manage Inventory →
              </Link>
            </div>

            {loadingListings ? (
              <Skeleton className="h-40 rounded-xl" />
            ) : lowStock.length === 0 && outOfStock.length === 0 ? (
              <EmptyState
                icon={FiCheckCircle}
                title="All listings are well stocked"
                text="No low-stock alerts right now."
              />
            ) : (
              <div className="space-y-3">
                {[...outOfStock, ...lowStock].slice(0, 6).map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={listing.book?.coverImage}
                        alt={listing.book?.title ?? "Book"}
                        className="h-12 w-9 rounded-md object-cover ring-1 ring-black/5"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-brand-dark">
                          {listing.book?.title ?? "Untitled book"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPrice(listing.price)} · MRP {formatPrice(listing.mrp)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={listing.stock === 0 ? "destructive" : "warning"}>
                      {listing.stock === 0 ? "Out" : `${listing.stock} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-dark">Recent Orders</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Latest orders placed with your seller account.
                </p>
              </div>
              <Link
                to="/seller/orders"
                className="text-xs font-bold text-brand-yellow-dark hover:underline"
              >
                Process Orders →
              </Link>
            </div>

            {loadingOrders ? (
              <Skeleton className="h-40 rounded-xl" />
            ) : sellerOrders.length === 0 ? (
              <EmptyState
                icon={FiPackage}
                title="No orders yet"
                text="When customers buy from you, orders will appear here."
              />
            ) : (
              <div className="space-y-3">
                {sellerOrders.slice(0, 6).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-brand-dark">
                        Order #{order.id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-dark">
                        {formatPrice(order.totalAmount)}
                      </p>
                      <Badge variant={ORDER_STATUS_META[order.status].badge}>
                        {ORDER_STATUS_META[order.status].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Top books */}
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-brand-dark">Top Selling Books</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Ranked by seller revenue from non-cancelled orders.
                </p>
              </div>
              <FiBarChart2 className="text-brand-yellow-dark" size={20} />
            </div>

            {loadingOrders ? (
              <Skeleton className="h-40 rounded-xl" />
            ) : topBooks.length === 0 ? (
              <EmptyState
                icon={FiActivity}
                title="No sales data yet"
                text="Top books will appear after your first successful order."
              />
            ) : (
              <div className="space-y-3">
                {topBooks.map((book, index) => (
                  <div
                    key={book.title}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-dark text-xs font-bold text-white">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-brand-dark">
                          {book.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {book.quantity} sold
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-brand-dark">
                      {formatPrice(book.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-100 text-green-700">
                <FiDollarSign size={19} />
              </span>
              <div>
                <h2 className="font-bold text-brand-dark">Seller Summary</h2>
                <p className="text-xs text-gray-500">Your marketplace snapshot</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <SummaryLine label="Completed orders" value={completedOrders.length} />
              <SummaryLine label="Open orders" value={openOrders.length} />
              <SummaryLine label="Average order value" value={formatPrice(sellerOrders.length ? revenue / sellerOrders.filter((o) => o.status !== "CANCELLED").length || 0 : 0)} />
              <SummaryLine label="Inventory value" value={formatPrice(inventoryValue)} />
              <SummaryLine label="Total stock units" value={totalStock} />
            </div>
          </CardContent>
        </Card>
      </section>
    </SellerLayout>
  );
}

function SellerSectionCard({
  icon: Icon,
  title,
  description,
  to,
  primary,
  meta,
}: {
  icon: typeof FiBookOpen;
  title: string;
  description: string;
  to: string;
  primary: string;
  meta: string;
}) {
  return (
    <Card className="h-full transition-all hover:shadow-lg group">
      <CardContent className="flex h-full flex-col p-6">
        <div className="mb-4 flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-yellow/20 text-brand-yellow-dark">
            <Icon size={20} />
          </span>
          <Badge variant="outline">{meta}</Badge>
        </div>

        <h3 className="font-bold text-xl text-brand-dark">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">
          {description}
        </p>

        {/* Luxury Black Button - Interactive */}
        <Link
          to={to}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 text-sm font-semibold text-white transition-all hover:bg-black active:scale-[0.985]"
        >
          {primary} <span className="text-lg leading-none">→</span>
        </Link>
      </CardContent>
    </Card>
  );
}

function AttentionRow({
  label,
  value,
  detail,
  variant,
  to,
}: {
  label: string;
  value: number;
  detail: string;
  variant: "success" | "warning" | "danger";
  to: string;
}) {
  const cls = {
    success: "bg-green-50 text-green-700 border-green-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-red-50 text-red-700 border-red-100",
  }[variant];

  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 transition hover:border-brand-yellow/50 hover:shadow-sm"
    >
      <div>
        <p className="font-semibold text-brand-dark">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{detail}</p>
      </div>
      <span
        className={cn(
          "grid h-10 min-w-10 place-items-center rounded-full border px-2 text-sm font-bold",
          cls
        )}
      >
        {value}
      </span>
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof FiPackage;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
      <Icon className="mx-auto text-gray-300" size={30} />
      <p className="mt-3 font-semibold text-brand-dark">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{text}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold text-brand-dark">{value}</span>
    </div>
  );
}











