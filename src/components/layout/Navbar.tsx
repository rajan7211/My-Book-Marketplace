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
  { label: "Shop", to: "/books" },
   { label: "New Release", to: "/new-releases" },

];


export function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout, isImpersonating, exitImpersonation } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const closeDrawerOnDesktop = () => {
      if (desktopQuery.matches) setDrawerOpen(false);
    };

    closeDrawerOnDesktop();
    desktopQuery.addEventListener("change", closeDrawerOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeDrawerOnDesktop);
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
    <>
      {/* Impersonation Banner */}
      {isImpersonating && user && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4 text-center text-sm font-medium flex items-center justify-center gap-4">
          <span>
            🔒 You are impersonating <strong>{user.name}</strong> ({user.role})
          </span>
          <button
            onClick={exitImpersonation}
            className="px-4 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition"
          >
            Exit Impersonation
          </button>
        </div>
      )}

      <header
        className={`sticky top-0 z-50 border-b text-white transition-colors duration-300 ${
          scrolled
            ? "nav-glass border-white/[0.08]"
            : "border-white/[0.07] bg-[#0f0d1a]"
        }`}
      >
      <div className="mx-auto flex h-[60px] max-w-[1400px] items-center justify-between px-6 sm:px-8 lg:px-10">

        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[#b0aac8] transition hover:bg-white/[0.07] hover:text-white md:hidden"
            aria-label="Open menu"
          >
            <FiMenu size={20} />
            <span className="hidden text-sm sm:block">All</span>
          </button>
          <Logo />
        </div>

        {/* Centre nav */}
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {NAV_LINKS.map(({ label, to }) => {
            const active = pathname === to;
            return (
              <Link
                key={label}
                to={to}
                className={`relative flex items-center gap-1 py-1 transition ${
                  active ? "text-white" : "text-[#8b86a8] hover:text-white"
                }`}
              >
                {label}
                {active && (
                  <span
                    className="absolute -bottom-[20px] left-0 h-[2px] w-full rounded-full"
                    style={{ background: "linear-gradient(90deg,#f5a623,#ec4899)" }}
                  />
                )}
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
                <span
                  className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full text-[9px] font-bold text-white shadow-[0_0_8px_rgba(236,72,153,0.7)]"
                  style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}
                >
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 text-sm text-white transition hover:bg-white/10"
              >
                <span
                  className="grid h-8 w-8 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[110px] truncate font-medium sm:block">
                  {user.name}
                </span>
                <FiChevronDown size={14} className="text-[#8b86a8]" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1625] py-1 text-white shadow-2xl">
                  
                  {/* Profile Link */}
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-white/5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <FiUser size={15} />
                    </div>
                    <span>Profile</span>
                  </Link>

                  {/* Dashboard / My Orders */}
                  <Link
                    to={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-white/5"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <FiUser size={15} />
                    </div>
                    <span>
                      {user.role === "CUSTOMER" ? "My Orders" : "Dashboard"}
                    </span>
                  </Link>

                  <div className="mx-3 my-1 h-px bg-white/10" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                      <FiLogOut size={15} />
                    </div>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => navigate("/register")}
              className="h-[34px] rounded-lg border-0 px-5 text-sm font-medium text-white shadow-[0_0_18px_rgba(139,92,246,0.45)] transition hover:shadow-[0_0_24px_rgba(236,72,153,0.55)]"
              style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}
            >
              Sign up
            </Button>
          )}
        </div>
      </div>

      <SideMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </header>
    </>
  );
}


