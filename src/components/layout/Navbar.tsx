import { Link, useNavigate } from "react-router-dom";
import { FiChevronDown, FiShoppingCart, FiLogOut, FiUser, FiMenu } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { Logo } from "./Logo";
import { SideMenu } from "./SideMenu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { toast } from "react-toastify";

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    useCartStore.getState().clear();
    toast.info("Logged out successfully");
    navigate("/");
  };

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "SELLER"
        ? "/seller"
        : "/orders";

  return (
    <header className="sticky top-0 z-50 bg-brand-dark text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          {/* Amazon-style hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="-ml-1 flex items-center gap-1.5 rounded-md px-2 py-2 text-gray-200 transition hover:bg-white/10 hover:text-white"
            aria-label="Open menu"
          >
            <FiMenu size={22} />
            <span className="hidden text-sm font-semibold sm:block">All</span>
          </button>
          <Logo />
        </div>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link
            to="/"
            className="relative font-medium text-white after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:bg-brand-yellow"
          >
            Home
          </Link>
          <Link
            to="/books"
            className="flex items-center gap-1 text-gray-300 transition hover:text-white"
          >
            Categories <FiChevronDown size={14} />
          </Link>
          <Link
            to="/books"
            className="text-gray-300 transition hover:text-white"
          >
            Collections
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user?.role !== "SELLER" && user?.role !== "ADMIN" && (
            <Link
              to="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full text-gray-200 transition hover:bg-white/10"
              aria-label="Cart"
            >
              <FiShoppingCart size={19} />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-brand-yellow text-[10px] font-bold text-brand-dark">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-2 pr-3 text-sm transition hover:bg-white/20"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-yellow text-xs font-bold text-brand-dark">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate sm:block">
                  {user.name}
                </span>
                <FiChevronDown size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 text-brand-dark shadow-xl">
                  <Link
                    to={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                  >
                    <FiUser size={15} />
                    {user.role === "CUSTOMER" ? "My Orders" : "Dashboard"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <FiLogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => navigate("/register")}
              className="rounded-lg px-6"
            >
              Sign Up
            </Button>
          )}
        </div>
      </div>

      <SideMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}


