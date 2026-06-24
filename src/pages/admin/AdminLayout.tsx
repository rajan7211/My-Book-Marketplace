import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiBookOpen,
  FiList,
  FiUserCheck,
  FiPackage,
  FiLogOut,
  FiArrowLeft,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { GiBookmarklet } from "react-icons/gi";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminApi } from "@/api/admin.api";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";
import { cn } from "@/lib/utils";

// fixed 
interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  badge: "pendingSellers" | "pendingBooks" | null;
}

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true, badge: null },
  {
    to: "/admin/sellers",
    label: "Seller Approval",
    icon: FiUsers,
    badge: "pendingSellers",
  },
  {
    to: "/admin/books",
    label: "Book Approval",
    icon: FiBookOpen,
    badge: "pendingBooks",
  },
  { to: "/admin/catalog", label: "Catalog", icon: FiList, badge: null },
  {
    to: "/admin/customers",
    label: "Customers",
    icon: FiUserCheck,
    badge: null,
  },
  { to: "/admin/orders", label: "Orders", icon: FiPackage, badge: null },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
  });

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="portal-luxury flex min-h-screen bg-brand-gray">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-60 flex-col bg-brand-dark text-white">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-yellow text-brand-dark">
            <GiBookmarklet size={22} />
          </span>
          <div className="leading-tight">
            <p className="font-serif text-[15px] font-bold lux-text-gradient">Marketplace Admin</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
              ADMIN
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 pt-2">
          {NAV.map(({ to, label, icon: Icon, end, badge }) => {
            const badgeValue = badge ? stats?.[badge] : undefined;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition",
                    isActive
                      ? "bg-gradient-to-r from-amber-400/25 to-pink-500/10 font-semibold text-amber-200 shadow-[inset_0_0_0_1px_rgba(245,166,35,0.3)]"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {label}
                </span>
                {badgeValue !== undefined && badgeValue > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {badgeValue}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="space-y-1 border-t border-white/10 p-3">
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
          >
            <FiArrowLeft size={16} /> Back to store
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-white/5"
          >
            <FiLogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-dark text-white md:hidden">
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-yellow text-brand-dark">
                  <GiBookmarklet size={22} />
                </span>
                <div>
                  <p className="font-serif text-[15px] font-bold lux-text-gradient">Marketplace Admin</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">ADMIN</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400">
                <FiX size={22} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-3 pt-2">
              {NAV.map(({ to, label, icon: Icon, end, badge }) => {
                const badgeValue = badge ? stats?.[badge] : undefined;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition",
                        isActive
                          ? "bg-gradient-to-r from-amber-400/25 to-pink-500/10 font-semibold text-amber-200"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )
                    }
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={16} />
                      {label}
                    </span>
                    {badgeValue !== undefined && badgeValue > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {badgeValue}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="space-y-1 border-t border-white/10 p-3">
              <NavLink
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                <FiArrowLeft size={16} /> Back to store
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-white/5"
              >
                <FiLogOut size={16} /> Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-60">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0f0d1a] px-6 md:px-8">
          <div className="flex items-center gap-4">
            {/* Hamburger - Visible only on mobile (Left side) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-white"
            >
              <FiMenu size={22} />
            </button>

            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-yellow text-brand-dark">
                <GiBookmarklet size={18} />
              </span>
              <div className="leading-tight">
                <p className="font-serif text-[15px] font-bold lux-text-gradient">My Book Store</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8b86a8]">
                  BUY • EXPLORE • DISCOVER
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}

























