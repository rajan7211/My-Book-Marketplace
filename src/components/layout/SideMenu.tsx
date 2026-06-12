import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiX,
  FiUser,
  FiChevronRight,
  FiTrendingUp,
  FiStar,
  FiClock,
  FiPackage,
  FiShoppingCart,
  FiLogOut,
  FiLogIn,
  FiGrid,
  FiHelpCircle,
  FiBookOpen,
} from "react-icons/fi";
import { GiBookshelf, GiSpellBook, GiScrollQuill, GiPencilBrush, GiSun } from "react-icons/gi";
import { MdStorefront } from "react-icons/md";
import { booksApi } from "@/api/books.api";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { toast } from "react-toastify";

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Fictions: GiSpellBook,
  Biography: GiScrollQuill,
  History: GiBookshelf,
  "Graphic Design": GiPencilBrush,
  "Self Help": GiSun,
};

/** Amazon-style left slide-in navigation drawer. */
export function SideMenu({ open, onClose }: SideMenuProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: booksApi.getCategories,
    enabled: open,
  });

  // lock body scroll + close on Escape
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    useCartStore.getState().clear();
    toast.info("Logged out successfully");
    go("/");
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[320px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Main menu"
      >
        {/* Close button (outside-right, like Amazon) */}
        <button
          onClick={onClose}
          className={`absolute -right-12 top-3 grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/10 ${
            open ? "block" : "hidden"
          }`}
          aria-label="Close menu"
        >
          <FiX size={24} />
        </button>

        {/* Header — "Hello, Sign in" */}
        <button
          onClick={() => go(isAuthenticated ? (user?.role === "ADMIN" ? "/admin" : user?.role === "SELLER" ? "/seller" : "/orders") : "/login")}
          className="flex items-center gap-3 bg-brand-dark px-5 py-4 text-left text-white transition hover:bg-brand-dark-2"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-yellow text-sm font-bold text-brand-dark">
            {isAuthenticated ? user?.name.charAt(0).toUpperCase() : <FiUser size={17} />}
          </span>
          <span className="text-[15px] font-bold">
            {isAuthenticated ? `Hello, ${user?.name.split(" ")[0]}` : "Hello, Sign in"}
          </span>
        </button>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Trending */}
          <Section title="Trending">
            <Item icon={FiTrendingUp} label="Trending Now" onClick={() => go("/books?sort=newest")} />
            <Item icon={FiStar} label="Bestsellers" onClick={() => go("/books")} />
            <Item icon={FiClock} label="New Releases" onClick={() => go("/books?sort=newest")} />
          </Section>

          <Divider />

          {/* Shop by Category */}
          <Section title="Shop by Category">
            <Item icon={FiGrid} label="All Books" onClick={() => go("/books")} chevron />
            {(categories ?? []).map((c) => {
              const Icon = CATEGORY_ICONS[c] ?? FiBookOpen;
              return (
                <Item
                  key={c}
                  icon={Icon}
                  label={c}
                  onClick={() => go(`/books?category=${encodeURIComponent(c)}`)}
                  chevron
                />
              );
            })}
          </Section>

          <Divider />

          {/* Programs */}
          <Section title="Programs & Features">
            <Item icon={MdStorefront} label="Sell on World Knowledge" onClick={() => go("/seller/register")} chevron />
            {user?.role === "SELLER" && (
              <Item icon={FiPackage} label="Seller Dashboard" onClick={() => go("/seller")} chevron />
            )}
            {user?.role === "ADMIN" && (
              <Item icon={FiGrid} label="Admin Dashboard" onClick={() => go("/admin")} chevron />
            )}
          </Section>

          <Divider />

          {/* Help & Settings */}
          <Section title="Help & Settings">
            {(!user || user.role === "CUSTOMER") && (
              <>
                <Item icon={FiShoppingCart} label="My Cart" onClick={() => go("/cart")} />
                <Item icon={FiPackage} label="My Orders" onClick={() => go("/orders")} />
              </>
            )}
            <Item
              icon={FiHelpCircle}
              label="Customer Service"
              onClick={() => {
                onClose();
                toast.info("Customer service is simulated in this demo.");
              }}
            />
            {isAuthenticated ? (
              <Item icon={FiLogOut} label="Sign Out" onClick={handleLogout} danger />
            ) : (
              <Item icon={FiLogIn} label="Sign In" onClick={() => go("/login")} />
            )}
          </Section>

          {/* Footer note */}
          <p className="px-5 pb-6 pt-2 text-[11px] text-gray-400">
            © 2026 World Knowledge — One book, many sellers.
          </p>
        </div>
      </aside>
    </>
  );
}

/* ---------- building blocks ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <h3 className="px-5 pb-1 pt-3 text-[15px] font-bold text-brand-dark">{title}</h3>
      {children}
    </div>
  );
}

function Divider() {
  return <hr className="border-gray-200" />;
}

function Item({
  icon: Icon,
  label,
  onClick,
  chevron = false,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  chevron?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-5 py-2.5 text-left text-sm transition hover:bg-gray-100 ${
        danger ? "text-red-600" : "text-gray-700"
      }`}
    >
      <span className="flex items-center gap-3.5">
        <Icon size={17} className={danger ? "text-red-500" : "text-gray-500"} />
        {label}
      </span>
      {chevron && <FiChevronRight size={15} className="text-gray-400" />}
    </button>
  );
}



