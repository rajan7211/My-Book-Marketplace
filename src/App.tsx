import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { PageLoader } from "@/components/layout/PageLoader";
import { ChunkErrorBoundary } from "@/components/layout/ChunkErrorBoundary";

// ── Lazily-loaded route pages 

const HomePage = lazy(() => import("@/pages/HomePage"));
const BooksPage = lazy(() => import("@/pages/BooksPage"));
const NewReleasesPage = lazy(() => import("@/pages/NewReleasesPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const BookDetailsPage = lazy(() => import("@/pages/BookDetailsPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const SellerRegisterPage = lazy(() => import("@/pages/auth/SellerRegisterPage"));
const VerifyOtpPage = lazy(() => import("@/pages/auth/VerifyOtpPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const ChangePasswordPage = lazy(
  () => import("@/pages/profile/ChangePasswordPage")
);

const SellerPendingPage = lazy(() => import("@/pages/seller/SellerPendingPage"));
const SellerDashboardPage = lazy(() => import("@/pages/seller/SellerDashboardPage"));
const SellerListingsPage = lazy(() => import("@/pages/seller/SellerListingsPage"));
const SellerInventoryPage = lazy(() => import("@/pages/seller/SellerInventoryPage"));
const SellerOrdersPage = lazy(() => import("@/pages/seller/SellerOrdersPage"));

const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminSellersPage = lazy(() => import("@/pages/admin/AdminSellersPage"));
const AdminBooksPage = lazy(() => import("@/pages/admin/AdminBooksPage"));
const AdminCatalogPage = lazy(() => import("@/pages/admin/AdminCatalogPage"));
const AdminCustomersPage = lazy(() => import("@/pages/admin/AdminCustomersPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage"));

const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));

export default function App() {
  // Once the app mounts successfully, clear the stale-chunk reload guard so a
  // future deploy can trigger a fresh one-time reload if needed.
  useEffect(() => {
    sessionStorage.removeItem("chunk-reloaded");
  }, []);

  return (
    <BrowserRouter>
      <ChunkErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/new-releases" element={<NewReleasesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/books/:id" element={<BookDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/seller/register" element={<SellerRegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/seller/pending" element={<SellerPendingPage />} />

            {/* Customer */}
            <Route element={<ProtectedRoute role="CUSTOMER" />}>
              <Route path="/cart" element={<CartPage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>

            {/* Seller */}
            <Route element={<ProtectedRoute roles={["SELLER"]} />}>
              <Route path="/seller" element={<SellerDashboardPage />} />
              <Route path="/seller/dashboard" element={<Navigate to="/seller" replace />} />
              <Route path="/seller/listings" element={<SellerListingsPage />} />
              <Route path="/seller/inventory" element={<SellerInventoryPage />} />
              <Route path="/seller/orders" element={<SellerOrdersPage />} />
            </Route>

            {/* Admin */}
            <Route element={<ProtectedRoute role="ADMIN" />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/sellers" element={<AdminSellersPage />} />
              <Route path="/admin/books" element={<AdminBooksPage />} />
              <Route path="/admin/catalog" element={<AdminCatalogPage />} />
              <Route path="/admin/customers" element={<AdminCustomersPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
            </Route>

            {/* Profile Page (any authenticated role) */}
            <Route element={<ProtectedRoute roles={["CUSTOMER", "SELLER", "ADMIN"]} />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="/profile/change-password"
                element={<ChangePasswordPage />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ChunkErrorBoundary>
    </BrowserRouter>
  );
}


