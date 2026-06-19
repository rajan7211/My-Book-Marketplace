import { NavLink, useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import { FiLogOut, FiHome } from "react-icons/fi";
import { GiBookmarklet } from "react-icons/gi";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth.store";
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

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="portal-luxury flex min-h-screen bg-brand-gray">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-brand-dark text-white">
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
              {badge !== undefined && badge > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

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

      {/* Main */}
      <div className="relative ml-60 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0f0d1a] px-8">
          <div className="flex items-center gap-3 text-sm">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-yellow text-xs font-bold text-brand-dark">
              {user?.name.charAt(0).toUpperCase()}
            </span>
            <div className="leading-tight">
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-[11px] text-[#8b86a8]">{user?.email}</p>
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}





















