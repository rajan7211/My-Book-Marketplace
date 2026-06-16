import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiChevronDown, FiShoppingCart, FiLogOut, FiUser, FiMenu } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { Logo } from "./Logo";
import { SideMenu } from "./SideMenu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { toast } from "react-toastify";


const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Categories", to: "/books", icon: true },
  { label: "About", to: "/about" },
];

export function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
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
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0f0d1a] text-white">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[#b0aac8] transition hover:bg-white/[0.07] hover:text-white"
            aria-label="Open menu"
          >
            <FiMenu size={20} />
            <span className="hidden text-sm sm:block">All</span>
          </button>
          <Logo />
        </div>

        {/* Centre nav */}
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {NAV_LINKS.map(({ label, to, icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={label}
                to={to}
                className={`relative flex items-center gap-1 transition ${
                  active
                    ? "text-white after:absolute after:-bottom-[21px] after:left-0 after:h-[2px] after:w-full after:bg-amber-400"
                    : "text-[#8b86a8] hover:text-white"
                }`}
              >
                {label}
                {icon && <FiChevronDown size={12} />}
              </Link>
            );
          })}
        </nav>

        {/* Right: cart + user */}
        <div className="flex items-center gap-2.5">
          {user?.role !== "SELLER" && user?.role !== "ADMIN" && (
            <Link
              to="/cart"
              className="relative grid h-9 w-9 place-items-center rounded-full border border-white/[0.12] bg-white/[0.06] text-[#b0aac8] transition hover:bg-white/[0.12] hover:text-white"
              aria-label="Cart"
            >
              <FiShoppingCart size={17} />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[9px] font-bold text-amber-900">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] py-1.5 pl-1.5 pr-3 text-sm text-white transition hover:bg-white/[0.12]"
              >
                <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-purple-600 text-[11px] font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[100px] truncate sm:block">
                  {user.name}
                </span>
                <FiChevronDown size={12} className="text-[#8b86a8]" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 text-[#0f0d1a] shadow-xl">
                  <Link
                    to={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                  >
                    <FiUser size={14} />
                    {user.role === "CUSTOMER" ? "My Orders" : "Dashboard"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50"
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => navigate("/register")}
              className="h-[34px] rounded-lg bg-purple-600 px-5 text-sm font-medium hover:bg-purple-700"
            >
              Sign up
            </Button>
          )}
        </div>
      </div>

      <SideMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}




