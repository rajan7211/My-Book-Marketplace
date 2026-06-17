import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string }> = {
  Fictions: { icon: GiSpellBook, color: "#8b5cf6" },
  Biography: { icon: GiScrollQuill, color: "#ec4899" },
  History: { icon: GiBookshelf, color: "#f59e0b" },
  "Graphic Design": { icon: GiPencilBrush, color: "#06b6d4" },
  "Self Help": { icon: GiSun, color: "#10b981" },
};
const FALLBACK_META = { icon: FiBookOpen, color: "#8b86a8" };

/** Dark-themed left slide-in navigation drawer matching the navbar/hero palette. */
export function SideMenu({ open, onClose }: SideMenuProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: booksApi.getCategories,
    enabled: open,
  });

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
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        style={{ backgroundColor: "#13111f" }}
        className={`fixed inset-y-0 left-0 z-[70] flex w-[300px] max-w-[85vw] flex-col shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Main menu"
      >
        <button
          onClick={onClose}
          className={`absolute -right-12 top-3 grid h-10 w-10 place-items-center rounded-full text-white/80 transition hover:bg-white/10 ${
            open ? "block" : "hidden"
          }`}
          aria-label="Close menu"
        >
          <FiX size={22} />
        </button>

        {/* Header — avatar + greeting */}
        <button
          onClick={() =>
            go(
              isAuthenticated
                ? user?.role === "ADMIN"
                  ? "/admin"
                  : user?.role === "SELLER"
                  ? "/seller"
                  : "/orders"
                : "/login"
            )
          }
          style={{ backgroundColor: "#1e1b30" }}
          className="flex items-center gap-3 border-b border-white/10 px-5 py-4 text-left transition hover:brightness-110"
        >
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-[0_0_16px_rgba(245,166,35,0.4)]"
            style={{ background: "linear-gradient(135deg,#f5a623,#f97316)" }}
          >
            {isAuthenticated ? user?.name.charAt(0).toUpperCase() : <FiUser size={17} />}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] text-white/50">Welcome back</p>
            <p className="truncate text-[15px] font-bold text-white">
              {isAuthenticated ? `Hello, ${user?.name.split(" ")[0]}` : "Hello, Sign in"}
            </p>
          </div>
          <FiChevronRight size={16} className="ml-auto shrink-0 text-white/30" />
        </button>

        <div className="flex-1 overflow-y-auto">
          <Section title="Trending">
            <Item icon={FiTrendingUp} label="Trending Now" color="#ec4899" onClick={() => go("/books?sort=newest")} />
            <Item icon={FiStar} label="Bestsellers" color="#f59e0b" onClick={() => go("/books")} />
            <Item icon={FiClock} label="New Releases" color="#06b6d4" onClick={() => go("/books?sort=newest")} />
          </Section>

          <Divider />

          <Section title="Shop by Category">
            <Item icon={FiGrid} label="All Books" color="#8b86a8" onClick={() => go("/books")} chevron />
            {(categories ?? []).map((c) => {
              const meta = CATEGORY_META[c] ?? FALLBACK_META;
              return (
                <Item
                  key={c}
                  icon={meta.icon}
                  label={c}
                  color={meta.color}
                  onClick={() => go(`/books?category=${encodeURIComponent(c)}`)}
                  chevron
                />
              );
            })}
          </Section>

          <Divider />

          <Section title="Programs & Features">
            <Item icon={MdStorefront} label="Sell on World Knowledge" color="#10b981" onClick={() => go("/seller/register")} chevron />
            {user?.role === "SELLER" && (
              <Item icon={FiPackage} label="Seller Dashboard" color="#8b86a8" onClick={() => go("/seller")} chevron />
            )}
            {user?.role === "ADMIN" && (
              <Item icon={FiGrid} label="Admin Dashboard" color="#8b86a8" onClick={() => go("/admin")} chevron />
            )}
          </Section>

          <Divider />

          <Section title="Help & Settings">
            {(!user || user.role === "CUSTOMER") && (
              <>
                <Item icon={FiShoppingCart} label="My Cart" color="#8b86a8" onClick={() => go("/cart")} />
                <Item icon={FiPackage} label="My Orders" color="#8b86a8" onClick={() => go("/orders")} />
              </>
            )}
            <Item
              icon={FiHelpCircle}
              label="Customer Service"
              color="#8b86a8"
              onClick={() => {
                onClose();
                toast.info("Customer service is simulated in this demo.");
              }}
            />
            {isAuthenticated ? (
              <Item icon={FiLogOut} label="Sign Out" onClick={handleLogout} danger />
            ) : (
              <Item icon={FiLogIn} label="Sign In" onClick={() => go("/login")} highlight />
            )}
          </Section>

          <p className="px-5 pb-6 pt-3 text-[11px] text-white/25">
            © 2026 World Knowledge — One book, many sellers.
          </p>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <h3
        className="px-5 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[.12em]"
        style={{ background: "linear-gradient(90deg,#f5a623,#ec4899)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Divider() {
  return <hr className="border-white/10" />;
}

function Item({
  icon: Icon,
  label,
  onClick,
  color,
  chevron = false,
  danger = false,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
  chevron?: boolean;
  danger?: boolean;
  highlight?: boolean;
}) {
  const textColor = danger ? "text-red-400" : highlight ? "text-purple-400" : "text-white/80";

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-5 py-2.5 text-left text-[13.5px] transition-colors hover:bg-white/5 ${textColor}`}
    >
      <span className="flex items-center gap-3.5">
        <Icon
          size={16}
          style={{ color: danger ? "#f87171" : highlight ? "#a78bfa" : color ?? "rgba(255,255,255,0.4)" }}
        />
        {label}
      </span>
      {chevron && <FiChevronRight size={14} className="text-white/20" />}
    </button>
  );
}


