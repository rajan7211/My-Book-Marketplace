import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import BooksPage from "@/pages/BooksPage";
import BookDetailsPage from "@/pages/BookDetailsPage";
import CartPage from "@/pages/CartPage";
import OrdersPage from "@/pages/OrdersPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import SellerRegisterPage from "@/pages/auth/SellerRegisterPage";
import SellerPendingPage from "@/pages/seller/SellerPendingPage";
import SellerDashboardPage from "@/pages/seller/SellerDashboardPage";
import SellerListingsPage from "@/pages/seller/SellerListingsPage";
import SellerInventoryPage from "@/pages/seller/SellerInventoryPage";
import SellerOrdersPage from "@/pages/seller/SellerOrdersPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminSellersPage from "@/pages/admin/AdminSellersPage";
import AdminBooksPage from "@/pages/admin/AdminBooksPage";
import AdminCatalogPage from "@/pages/admin/AdminCatalogPage";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/seller/register" element={<SellerRegisterPage />} />
        <Route path="/seller/pending" element={<SellerPendingPage />} />

        {/* Customer */}
        <Route element={<ProtectedRoute role="CUSTOMER" />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>

        {/* Seller */}
        <Route element={<ProtectedRoute role="SELLER" />}>
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
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
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}







