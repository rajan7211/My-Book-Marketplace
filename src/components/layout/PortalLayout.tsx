import { NavLink, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiLogOut, FiHome, FiMenu, FiX } from "react-icons/fi";
import { GiBookmarklet } from "react-icons/gi";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface PortalNavItem {
  to: string;
  label: string;
  icon: IconType;
  end?: boolean;
  badge?: number;
}


interface PortalLayoutProps {
  title: string;
  nav: PortalNavItem[];
  children: React.ReactNode;
}

/** Sidebar layout shared by the Seller and Admin portals. */
export function PortalLayout({ title, nav, children }: PortalLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="portal-luxury flex min-h-screen bg-brand-gray">
      {/* Desktop Sidebar (visible on md and above) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-60 flex-col bg-brand-dark text-white">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-yellow text-brand-dark">
            <GiBookmarklet size={20} />
          </span>
          <div className="font-serif text-[12px] font-semibold uppercase leading-tight tracking-[0.15em] lux-text-gradient">
            World
            <br />
            Knowledge
          </div>
        </div>

        <p className="px-5 pb-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
          {title}
        </p>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-amber-400/25 to-pink-500/10 font-semibold text-amber-200 shadow-[inset_0_0_0_1px_rgba(245,166,35,0.3)]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-0.5 active:scale-[0.985]"
                )
              }
            >
              <span className="flex items-center gap-3 relative z-10">
                <Icon 
                  size={16} 
                  className="transition-all duration-200 group-hover:scale-110 group-hover:text-amber-300 group-hover:rotate-3" 
                />
                {label}
              </span>
              {badge !== undefined && badge > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white transition relative z-10">
                  {badge}
                </span>
              )}
              {/* Active indicator line */}
              <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-amber-400 to-pink-500 opacity-0 group-[.active]:opacity-100 transition-all duration-200" />
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer - Rating & Quick Info */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400">Your Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-lg font-bold text-white">4.8</span>
                  <div className="flex text-amber-400">
                    <FaStar size={14} />
                    <FaStar size={14} />
                    <FaStar size={14} />
                    <FaStar size={14} />
                    <FaStarHalfAlt size={14} />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400">Based on</p>
                <p className="text-sm font-semibold text-white">124 reviews</p>
              </div>
            </div>

            {/* Extra Interactive Stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div>
                <p className="text-[10px] text-gray-400">Books Sold</p>
                <p className="font-bold text-white">1,284</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Active Listings</p>
                <p className="font-bold text-white">32</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1 border-t border-white/10 p-3">
          <NavLink
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            <FiHome size={16} /> Storefront
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-white/10"
          >
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-dark text-white md:hidden">
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-yellow text-brand-dark">
                  <GiBookmarklet size={20} />
                </span>
                <div className="font-serif text-[12px] font-semibold uppercase leading-tight tracking-[0.15em] lux-text-gradient">
                  World<br />Knowledge
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400">
                <FiX size={22} />
              </button>
            </div>

            <p className="px-5 pb-2 pt-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              {title}
            </p>

            <nav className="flex-1 space-y-1 px-3">
              {nav.map(({ to, label, icon: Icon, end, badge }) => (
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
                  {badge !== undefined && badge > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Drawer Footer - Rating */}
            <div className="border-t border-white/10 p-4">
              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Your Rating</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-lg font-bold text-white">4.8</span>
                      <div className="flex text-amber-400">
                        <FaStar size={14} />
                        <FaStar size={14} />
                        <FaStar size={14} />
                        <FaStar size={14} />
                        <FaStarHalfAlt size={14} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">124 reviews</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-[10px] text-gray-400">Books Sold</p>
                    <p className="font-bold text-white">1,284</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Active Listings</p>
                    <p className="font-bold text-white">32</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1 border-t border-white/10 p-3">
              <NavLink
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <FiHome size={16} /> Storefront
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition hover:bg-white/10"
              >
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:ml-60">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0f0d1a] px-6 md:px-8">
          <div className="flex items-center gap-4">
            {/* Hamburger - Visible only on mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-white"
              aria-label="Open menu"
            >
              <FiMenu size={22} />
            </button>

            <div className="flex items-center gap-3 text-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-yellow text-xs font-bold text-brand-dark">
                {user?.name.charAt(0).toUpperCase()}
              </span>
              <div className="leading-tight">
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-[11px] text-[#8b86a8]">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}





















