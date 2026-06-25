import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FiHome, FiBook, FiPackage, FiUsers, FiUser, FiSettings, FiHelpCircle,
  FiMenu, FiBell, FiSearch, FiChevronDown, FiLogOut, FiArrowRight,
  FiTrendingUp, FiX, FiCheck, FiSend, FiMessageCircle,
  FiDollarSign, FiShoppingCart, FiLayers, FiAlertCircle, FiList,
  FiBarChart2, FiEdit3, FiClock,
} from "react-icons/fi";

import { useAuthStore } from "@/store/auth.store";
import { formatPrice } from "@/lib/utils";
import type { OrderStatus, RoleName } from "@/types";

import { ordersApi } from "@/api/orders.api";
import { sellerApi } from "@/api/seller.api";
import { adminApi } from "@/api/admin.api";
import { authApi } from "@/api/auth.api";

//  SHARED CONFIG & SMALL HELPERS

const ROLE_LABEL: Record<RoleName, string> = {
  CUSTOMER: "Customer",
  SELLER: "Seller",
  ADMIN: "Administrator",
};

const ROLE_SUBTITLE: Record<RoleName, string> = {
  CUSTOMER: "Here's what's happening with your orders.",
  SELLER: "Here's how your store is performing.",
  ADMIN: "Here's the health of your marketplace.",
};

/** Sidebar items per role — same look, role-specific entries */
const SIDEBAR_BY_ROLE: Record<
  RoleName,
  { id: string; label: string; icon: typeof FiHome }[]
> = {
  CUSTOMER: [
    { id: "Dashboard", label: "Dashboard", icon: FiHome },
    { id: "Orders", label: "My Orders", icon: FiPackage },
    { id: "Analytics", label: "Analytics", icon: FiBarChart2 },
    { id: "Settings", label: "Settings", icon: FiSettings },
    { id: "Support", label: "Support", icon: FiHelpCircle },
  ],
  SELLER: [
    { id: "Dashboard", label: "Dashboard", icon: FiHome },
    { id: "Orders", label: "Orders", icon: FiPackage },
    { id: "Settings", label: "Settings", icon: FiSettings },
    { id: "Support", label: "Support", icon: FiHelpCircle },
  ],
  ADMIN: [
    { id: "Dashboard", label: "Dashboard", icon: FiHome },
    { id: "Orders", label: "Orders", icon: FiPackage },
    { id: "Settings", label: "Settings", icon: FiSettings },
    { id: "Support", label: "Support", icon: FiHelpCircle },
  ],
};

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { bg: string; text: string; dot: string; border: string; label: string }
> = {
  CREATED:   { bg: "bg-amber-500/10",   text: "text-amber-600",   dot: "bg-amber-500",   border: "border-amber-500/20",   label: "Created" },
  ACCEPTED:  { bg: "bg-blue-500/10",    text: "text-blue-600",    dot: "bg-blue-500",    border: "border-blue-500/20",    label: "Accepted" },
  SHIPPED:   { bg: "bg-violet-500/10",  text: "text-violet-600",  dot: "bg-violet-500",  border: "border-violet-500/20",  label: "Shipped" },
  DELIVERED: { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500", border: "border-emerald-500/20", label: "Delivered" },
  CANCELLED: { bg: "bg-red-500/10",     text: "text-red-600",     dot: "bg-red-500",     border: "border-red-500/20",     label: "Cancelled" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "U";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

//  Reusable visual atoms 

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 bg-gradient-to-br from-amber-500 to-pink-500 select-none"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const map = {
    default: "bg-gray-100 text-gray-600 border-gray-200",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[variant]}`}>
      {children}
    </span>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function ProgressBar({ progress, color = "#f5a623", height = 6 }: { progress: number; color?: string; height?: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}

function useAnimatedCounter(value: number, duration = 1200) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = value || 0;
    let start = 0;
    const step = Math.max(1, Math.ceil(num / (duration / 16)));
    let raf: number;
    const animate = () => {
      start = Math.min(start + step, num);
      setDisplay(start);
      if (start < num) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

type StatDef = {
  label: string;
  value: number;
  prefix?: string;
  color: string;
  icon: typeof FiHome;
  trend?: string;
  max?: number;
};

function StatCard({ stat, index }: { stat: StatDef; index: number }) {
  const animated = useAnimatedCounter(stat.value);
  const [hovered, setHovered] = useState(false);
  const ratio = stat.max && stat.max > 0 ? (stat.value / stat.max) * 100 : 100;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-default group"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition"
          style={{ color: stat.color }}
        >
          <stat.icon size={18} />
        </div>
        {stat.trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            <FiTrendingUp size={10} />
            {stat.trend}
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">{stat.label}</p>
      <p className="text-2xl font-black text-brand-dark">
        {stat.prefix}
        {animated.toLocaleString("en-IN")}
      </p>
      {/* Hover progress (no layout shift) */}
      <div className="mt-3 pt-3 border-t border-gray-200 min-h-[22px]">
        {hovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <ProgressBar progress={ratio} color={stat.color} height={4} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function SectionHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
      <div>
        <p className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 bg-clip-text text-transparent uppercase">{eyebrow}</p>
        <h3 className="text-xl font-bold text-brand-dark mt-0.5">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-amber-500 animate-spin mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function EmptyState({ icon = "📭", title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
      <span className="text-5xl block mb-4">{icon}</span>
      <p className="text-gray-700 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-gray-200 ${className}`}>{children}</div>;
}


//  SIDEBAR  (shared shell — items come from role)

function Sidebar({
  items,
  activeTab,
  setActiveTab,
  isCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  name,
  email,
  roleLabel,
  onLogout,
  onGoHome,
}: {
  items: { id: string; label: string; icon: typeof FiHome }[];
  activeTab: string;
  setActiveTab: (id: string) => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  name: string;
  email: string;
  roleLabel: string;
  onLogout: () => void;
  onGoHome: () => void;
}) {
  const sidebarRef = useRef<HTMLElement>(null!);
  useClickOutside(sidebarRef, () => setIsMobileOpen(false));

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) setIsMobileOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isMobileOpen, setIsMobileOpen]);

  const handleNav = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        ref={sidebarRef}
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 bg-brand-dark text-white border-r border-white/10 flex flex-col transition-[width] duration-300
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-72"}
          w-[280px]`}
        initial={false}
      >
        {/* Logo */}
        <div className={`p-6 border-b border-white/10 flex items-center gap-3 ${isCollapsed ? "lg:justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-yellow text-brand-dark">
            <FiBook className="text-lg" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="font-serif font-bold text-lg lux-text-gradient whitespace-nowrap">BookHaven</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">{roleLabel} Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">Menu</p>
          )}
          {items.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-amber-400/25 to-pink-500/10 font-semibold text-amber-200 shadow-[inset_0_0_0_1px_rgba(245,166,35,0.3)]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                } ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}
              >
                <Icon className={`flex-shrink-0 transition-all duration-200 ${isActive ? "text-amber-300" : "text-gray-400 group-hover:text-amber-300"}`} size={20} />
                {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <motion.span layoutId="activeIndicator" className="absolute right-3 w-1.5 h-1.5 rounded-full bg-amber-300" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User card */}
        {!isCollapsed && (
          <div className="p-4 border-t border-white/10 overflow-hidden">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Avatar name={name} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{name}</p>
                <p className="text-[10px] text-gray-400 truncate">{email}</p>
              </div>
            </div>
            <button
              onClick={onGoHome}
              className="w-full mt-3 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all"
            >
              <FiHome size={16} />
              <span>Back to Home</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-white/10 transition-all"
            >
              <FiLogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </motion.aside>
    </>
  );
}


//  TOP HEADER (shared shell)
function TopHeader({
  name,
  email,
  roleLabel,
  subtitle,
  onMenuToggle,
  onCollapseToggle,
  isCollapsed,
  searchQuery,
  setSearchQuery,
  onLogout,
  onGoHome,
}: {
  name: string;
  email: string;
  roleLabel: string;
  subtitle: string;
  onMenuToggle: () => void;
  onCollapseToggle: () => void;
  isCollapsed: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onLogout: () => void;
  onGoHome: () => void;
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null!);
  useClickOutside(menuRef, () => setShowUserMenu(false));

  const greeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <header className="bg-[#0f0d1a] backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuToggle} className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
            <FiMenu className="text-gray-300" size={18} />
          </button>
          <button onClick={onCollapseToggle} className="hidden lg:flex w-10 h-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center hover:bg-white/10 transition">
            <FiArrowRight className={`text-gray-300 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`} size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">
              {greeting()}, <span className="bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">{name.split(" ")[0]}</span>!
            </h1>
            <p className="text-xs text-[#8b86a8] hidden sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center bg-white/5 rounded-xl px-4 py-2.5 gap-2 w-64 border border-white/10 focus-within:border-amber-400/50 focus-within:ring-1 focus-within:ring-amber-400/20 transition-all">
            <FiSearch className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ backgroundColor: "transparent" }}
              className="bg-transparent text-sm text-white placeholder:text-gray-500 outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-200 transition">
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Back to Home — always visible */}
          <button
            onClick={onGoHome}
            title="Back to Home"
            className="flex items-center gap-2 h-10 px-3 sm:px-4 rounded-xl text-sm font-semibold text-brand-dark bg-brand-yellow hover:bg-brand-yellow-dark transition shadow-lg shadow-amber-500/20"
          >
            <FiHome size={16} />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition relative">
            <FiBell className="text-gray-300" size={18} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 pl-1 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/10"
            >
              <Avatar name={name} size={36} />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">{name}</p>
                <p className="text-[10px] text-[#8b86a8]">{roleLabel}</p>
              </div>
              <FiChevronDown className="text-gray-400 hidden sm:block" size={14} />
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-60 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50"
                >
                  <div className="p-3 border-b border-gray-200 mb-2">
                    <p className="text-sm font-semibold text-brand-dark">{name}</p>
                    <p className="text-[10px] text-gray-500">{email}</p>
                    <span className="inline-block mt-2"><Badge variant="info">{roleLabel}</Badge></span>
                  </div>
                  <button onClick={onGoHome} className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-dark transition flex items-center gap-2">
                    <FiHome size={14} /> Back to Home
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button onClick={onLogout} className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition flex items-center gap-2">
                    <FiLogOut size={14} /> Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

//  WELCOME BANNER (shared)
function WelcomeBanner({ name, roleLabel, headline }: { name: string; roleLabel: string; headline: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-[#0f0d1a] border border-white/10 p-6 sm:p-8 text-white"
    >
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-pink-500/10 blur-3xl" />
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <Avatar name={name} size={80} />
        <div className="flex-1">
          <span className="inline-block mb-2"><Badge variant="warning">⭐ {roleLabel}</Badge></span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f0f9]">{name}</h2>
          <p className="text-sm text-[#8b86a8] mt-1">{headline}</p>
        </div>
      </div>
    </motion.div>
  );
}

//  GENERIC ORDERS TABLE (customer / seller / admin reuse)
type AnyOrder = {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  sellerName?: string;
  customerId?: number;
};

function OrdersTable({
  orders,
  thirdCol,
  thirdLabel,
}: {
  orders: AnyOrder[];
  thirdCol?: (o: AnyOrder) => React.ReactNode;
  thirdLabel?: string;
}) {
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const filters: ("All" | OrderStatus)[] = ["All", "CREATED", "ACCEPTED", "SHIPPED", "DELIVERED", "CANCELLED"];
  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1 border border-gray-200 w-fit mb-5">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === f ? "bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow" : "text-gray-600 hover:text-brand-dark"
            }`}
          >
            {f === "All" ? "All" : ORDER_STATUS_CONFIG[f].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🧾" title="No orders here" subtitle="Orders matching this filter will appear here." />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-brand-gray text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            <div className="col-span-2">Order</div>
            <div className="col-span-3">{thirdLabel ?? "Reference"}</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          <div className="divide-y divide-gray-200">
            {filtered.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 sm:px-6 sm:py-4 hover:bg-brand-gray transition-all"
              >
                {/* mobile */}
                <div className="sm:hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-brand-dark">#ORD-{o.id}</span>
                    <span className="text-sm font-bold text-brand-dark">{formatPrice(o.totalAmount)}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{formatDate(o.createdAt)}{thirdCol ? <> · {thirdCol(o)}</> : null}</p>
                  <div className="mt-2"><StatusPill status={o.status} /></div>
                </div>
                {/* desktop */}
                <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2 font-mono text-xs text-gray-700">#ORD-{o.id}</div>
                  <div className="col-span-3 text-sm text-brand-dark truncate">{thirdCol ? thirdCol(o) : "—"}</div>
                  <div className="col-span-3 text-xs text-gray-600">{formatDate(o.createdAt)}</div>
                  <div className="col-span-2"><StatusPill status={o.status} /></div>
                  <div className="col-span-2 text-right text-sm font-bold text-brand-dark">{formatPrice(o.totalAmount)}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

//  CUSTOMER TABS
function useCustomerOrders(customerId?: number) {
  return useQuery({
    queryKey: ["profile", "customer-orders", customerId],
    queryFn: () => ordersApi.getCustomerOrders(customerId!),
    enabled: !!customerId,
  });
}

function CustomerDashboard({ name, customerId }: { name: string; customerId?: number }) {
  const { data: orders = [], isLoading } = useCustomerOrders(customerId);

  const stats = useMemo<StatDef[]>(() => {
    const active = orders.filter((o) => o.status !== "CANCELLED");
    const itemsBought = orders.reduce(
      (s, o) => s + (o.items?.reduce((a, it) => a + it.quantity, 0) ?? 0),
      0
    );
    const spent = active.reduce((s, o) => s + o.totalAmount, 0);
    const delivered = orders.filter((o) => o.status === "DELIVERED").length;
    return [
      { label: "Total Orders", value: orders.length, max: Math.max(orders.length, 10), color: "#f5a623", icon: FiPackage },
      { label: "Books Bought", value: itemsBought, max: Math.max(itemsBought, 20), color: "#ec4899", icon: FiBook },
      { label: "Total Spent", value: Math.round(spent), max: Math.max(spent, 10000), prefix: "₹", color: "#8b5cf6", icon: FiShoppingCart },
      { label: "Delivered", value: delivered, max: Math.max(orders.length, 1), color: "#10b981", icon: FiCheck },
    ];
  }, [orders]);

  if (!customerId) return <EmptyState icon="🔒" title="No customer profile linked" subtitle="Log in with a customer account to see your dashboard." />;
  if (isLoading) return <Loader label="Loading your dashboard…" />;

  return (
    <div className="space-y-6">
      <WelcomeBanner name={name} roleLabel="Customer" headline="Track your orders and keep building your library." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
      </div>
      <Card className="p-6">
        <SectionHeader eyebrow="Recent" title="Latest Orders" />
        {orders.length === 0 ? (
          <EmptyState icon="🛒" title="No orders yet" subtitle="Browse the catalog to place your first order." />
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-gray border border-gray-200">
                <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500">
                  <FiPackage size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-brand-dark">#ORD-{o.id} · {o.sellerName}</p>
                  <p className="text-xs text-gray-600">{formatDate(o.createdAt)} · {o.items?.length ?? 0} item(s)</p>
                </div>
                <StatusPill status={o.status} />
                <span className="text-sm font-bold text-brand-dark w-24 text-right">{formatPrice(o.totalAmount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function CustomerOrdersTab({ customerId }: { customerId?: number }) {
  const { data: orders = [], isLoading } = useCustomerOrders(customerId);
  if (!customerId) return <EmptyState icon="🔒" title="No customer profile linked" />;
  if (isLoading) return <Loader />;
  return (
    <div>
      <SectionHeader eyebrow="Purchase History" title="My Orders" />
      <OrdersTable orders={orders} thirdLabel="Seller" thirdCol={(o) => o.sellerName} />
    </div>
  );
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function CustomerAnalyticsTab({ customerId }: { customerId?: number }) {
  const { data: orders = [], isLoading } = useCustomerOrders(customerId);
  const [metric, setMetric] = useState<"orders" | "books" | "spend">("orders");

  // Build last-6-months buckets from real orders
  const monthly = useMemo(() => {
    const now = new Date();
    const buckets: { key: string; month: string; orders: number; books: number; spend: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: MONTH_NAMES[d.getMonth()],
        orders: 0,
        books: 0,
        spend: 0,
      });
    }
    const idx = new Map(buckets.map((b, i) => [b.key, i]));
    for (const o of orders) {
      if (o.status === "CANCELLED") continue;
      const d = new Date(o.createdAt);
      const k = `${d.getFullYear()}-${d.getMonth()}`;
      const i = idx.get(k);
      if (i === undefined) continue;
      buckets[i].orders += 1;
      buckets[i].books += o.items?.reduce((a, it) => a + it.quantity, 0) ?? 0;
      buckets[i].spend += o.totalAmount;
    }
    return buckets;
  }, [orders]);

  // Spending distribution by seller (real data)
  const distribution = useMemo(() => {
    const bySeller = new Map<string, number>();
    let total = 0;
    for (const o of orders) {
      if (o.status === "CANCELLED") continue;
      bySeller.set(o.sellerName, (bySeller.get(o.sellerName) ?? 0) + o.totalAmount);
      total += o.totalAmount;
    }
    const palette = ["#f5a623", "#ec4899", "#8b5cf6", "#10b981", "#9ca3af"];
    return Array.from(bySeller.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, amount], i) => ({
        label,
        value: total ? Math.round((amount / total) * 100) : 0,
        color: palette[i % palette.length],
      }));
  }, [orders]);

  const metrics = [
    { key: "orders" as const, label: "Orders", color: "#f5a623", icon: FiPackage },
    { key: "books" as const, label: "Books Bought", color: "#ec4899", icon: FiBook },
    { key: "spend" as const, label: "Amount Spent", color: "#8b5cf6", icon: FiDollarSign },
  ];

  const activeOrders = orders.filter((o) => o.status !== "CANCELLED");
  const totalSpend = activeOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalBooks = activeOrders.reduce((s, o) => s + (o.items?.reduce((a, it) => a + it.quantity, 0) ?? 0), 0);
  const avgOrder = activeOrders.length ? totalSpend / activeOrders.length : 0;

  const summary = [
    { label: "Total Orders", value: orders.length, icon: FiPackage, color: "#f5a623", fmt: (v: number) => `${v}` },
    { label: "Books Bought", value: totalBooks, icon: FiBook, color: "#ec4899", fmt: (v: number) => `${v}` },
    { label: "Total Spent", value: Math.round(totalSpend), icon: FiShoppingCart, color: "#8b5cf6", fmt: (v: number) => `₹${v.toLocaleString("en-IN")}` },
    { label: "Avg / Order", value: Math.round(avgOrder), icon: FiTrendingUp, color: "#10b981", fmt: (v: number) => `₹${v.toLocaleString("en-IN")}` },
  ];

  if (!customerId) return <EmptyState icon="🔒" title="No customer profile linked" />;
  if (isLoading) return <Loader label="Crunching your numbers…" />;

  const maxVal = Math.max(1, ...monthly.map((m) => m[metric]));
  const activeMetric = metrics.find((m) => m.key === metric)!;

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Insights" title="Shopping Analytics" />

      {/* Metric switcher */}
      <div className="flex flex-wrap bg-gray-100 rounded-xl p-1 border border-gray-200 w-fit gap-1">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              metric === m.key
                ? "bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg"
                : "text-gray-600 hover:text-brand-dark"
            }`}
          >
            <m.icon size={14} /> {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly bar chart */}
        <motion.div key={metric} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-bold text-brand-dark">{activeMetric.label} Per Month</p>
              <span className="text-xs text-gray-500">Last 6 months</span>
            </div>
            <div className="flex items-end gap-3 h-52">
              {monthly.map((stat) => (
                <div key={stat.key} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex justify-center">
                    <motion.div
                      className="w-full max-w-[48px] rounded-t-xl relative cursor-pointer"
                      style={{ background: activeMetric.color }}
                      initial={{ height: 0 }}
                      animate={{ height: `${(stat[metric] / maxVal) * 180}px` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-brand-dark text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-200 shadow-xl">
                        {metric === "spend" ? `₹${stat[metric].toLocaleString("en-IN")}` : stat[metric]}
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500">{stat.month}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Spending distribution */}
        <Card className="p-6">
          <p className="text-sm font-bold text-brand-dark mb-6">Spending by Seller</p>
          {distribution.length === 0 ? (
            <p className="text-sm text-gray-500">No spending data yet.</p>
          ) : (
            <div className="space-y-4">
              {distribution.map((cat) => (
                <div key={cat.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-gray-600 truncate pr-2">{cat.label}</span>
                    <span className="text-xs text-brand-dark font-medium">{cat.value}%</span>
                  </div>
                  <ProgressBar progress={cat.value} color={cat.color} height={8} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summary.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3" style={{ color: s.color }}>
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-black text-brand-dark">{s.fmt(s.value)}</p>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

//  SELLER TABS
function useSellerListings(sellerId?: number) {
  return useQuery({
    queryKey: ["profile", "seller-listings", sellerId],
    queryFn: () => sellerApi.getMyListings(sellerId!),
    enabled: !!sellerId,
  });
}
function useSellerOrders(sellerId?: number) {
  return useQuery({
    queryKey: ["profile", "seller-orders", sellerId],
    queryFn: () => sellerApi.getMyOrders(sellerId!),
    enabled: !!sellerId,
  });
}

function SellerDashboard({ name, sellerId }: { name: string; sellerId?: number }) {
  const { data: listings = [], isLoading: l1 } = useSellerListings(sellerId);
  const { data: orders = [], isLoading: l2 } = useSellerOrders(sellerId);

  const stats = useMemo<StatDef[]>(() => {
    const stock = listings.reduce((s, l) => s + l.stock, 0);
    const revenue = orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.totalAmount, 0);
    return [
      { label: "Active Listings", value: listings.length, color: "#f5a623", icon: FiLayers },
      { label: "Units in Stock", value: stock, color: "#ec4899", icon: FiBook },
      { label: "Total Orders", value: orders.length, color: "#8b5cf6", icon: FiPackage },
      { label: "Revenue", value: Math.round(revenue), prefix: "₹", color: "#10b981", icon: FiDollarSign },
    ];
  }, [listings, orders]);

  if (!sellerId) return <EmptyState icon="🔒" title="No seller profile linked" subtitle="Log in with an approved seller account." />;
  if (l1 || l2) return <Loader label="Loading your store…" />;

  const lowStock = listings.filter((l) => l.stock <= 3);

  return (
    <div className="space-y-6">
      <WelcomeBanner name={name} roleLabel="Seller" headline="Monitor your listings, stock and incoming orders." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <SectionHeader eyebrow="Activity" title="Recent Orders" />
          {orders.length === 0 ? (
            <EmptyState icon="📦" title="No orders yet" />
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-gray border border-gray-200">
                  <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500"><FiPackage size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-brand-dark">#ORD-{o.id}</p>
                    <p className="text-xs text-gray-600">{formatDate(o.createdAt)} · {o.items?.length ?? 0} item(s)</p>
                  </div>
                  <StatusPill status={o.status} />
                  <span className="text-sm font-bold text-brand-dark w-24 text-right">{formatPrice(o.totalAmount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-6">
          <SectionHeader eyebrow="Inventory" title="Low Stock" />
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-500 flex items-center gap-2"><FiCheck className="text-emerald-500" /> All listings well stocked.</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((l) => (
                <div key={l.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"><FiAlertCircle size={14} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-brand-dark truncate">{l.book?.title ?? `Book #${l.bookId}`}</p>
                    <p className="text-[10px] text-gray-500">{l.stock} left</p>
                  </div>
                  <Badge variant="danger">Low</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function SellerOrdersTab({ sellerId }: { sellerId?: number }) {
  const { data: orders = [], isLoading } = useSellerOrders(sellerId);
  if (!sellerId) return <EmptyState icon="🔒" title="No seller profile linked" />;
  if (isLoading) return <Loader />;
  return (
    <div>
      <SectionHeader eyebrow="Fulfilment" title="Incoming Orders" />
      <OrdersTable orders={orders} thirdLabel="Customer" thirdCol={(o) => `Customer #${o.customerId}`} />
    </div>
  );
}

//  ADMIN TABS
function AdminDashboard({ name }: { name: string }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["profile", "admin-stats"],
    queryFn: () => adminApi.getStats(),
  });

  if (isLoading || !stats) return <Loader label="Loading marketplace…" />;

  const cards: StatDef[] = [
    { label: "Sellers", value: stats.totalSellers, color: "#f5a623", icon: FiUsers },
    { label: "Customers", value: stats.totalCustomers, color: "#ec4899", icon: FiUser },
    { label: "Books", value: stats.totalBooks, color: "#8b5cf6", icon: FiBook },
    { label: "Orders", value: stats.totalOrders, color: "#10b981", icon: FiPackage },
  ];

  return (
    <div className="space-y-6">
      <WelcomeBanner name={name} roleLabel="Administrator" headline="Approve sellers & books, and keep the marketplace healthy." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center"><FiUsers size={20} /></div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Pending Sellers</p>
            <p className="text-2xl font-black text-brand-dark">{stats.pendingSellers}</p>
          </div>
          {stats.pendingSellers > 0 && <span className="ml-auto"><Badge variant="warning">Action needed</Badge></span>}
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center"><FiBook size={20} /></div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Pending Books</p>
            <p className="text-2xl font-black text-brand-dark">{stats.pendingBooks}</p>
          </div>
          {stats.pendingBooks > 0 && <span className="ml-auto"><Badge variant="warning">Action needed</Badge></span>}
        </Card>
      </div>
    </div>
  );
}

function AdminOrdersTab() {
  const { data: orders = [], isLoading } = useQuery({ queryKey: ["profile", "admin-orders"], queryFn: () => adminApi.getOrders() });
  if (isLoading) return <Loader />;
  return (
    <div>
      <SectionHeader eyebrow="Transactions" title="All Orders" />
      <OrdersTable orders={orders} thirdLabel="Seller" thirdCol={(o) => o.sellerName} />
    </div>
  );
}

//  SETTINGS & SUPPORT (shared for all roles)
function SettingsTab({
  name,
  email,
  roleLabel,
  role,
  customerId,
  sellerId,
}: {
  name: string;
  email: string;
  roleLabel: string;
  role: RoleName;
  customerId?: number;
  sellerId?: number;
}) {
  const [prefs, setPrefs] = useState({ email: true, push: false, marketing: false });
  const [saved, setSaved] = useState(false);
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  // ── Editable profile (all roles)
  const canEdit =
    (role === "CUSTOMER" && !!customerId) ||
    (role === "SELLER" && !!sellerId) ||
    role === "ADMIN";

  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Customer fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  // Seller fields
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [mobile, setMobile] = useState("");
  // Admin field
  const [displayName, setDisplayName] = useState("");

  const startEdit = async () => {
    if (role === "CUSTOMER") {
      setFirstName(name.split(" ")[0] ?? "");
      setLastName(name.split(" ").slice(1).join(" ") ?? "");
    } else if (role === "SELLER" && sellerId) {
      setBusinessName(name);
      setContactPerson("");
      setMobile("");
      try {
        const s = await sellerApi.getSeller(sellerId);
        setBusinessName(s.businessName);
        setContactPerson(s.contactPerson);
        setMobile(s.mobile);
      } catch {
        /* keep defaults */
      }
    } else if (role === "ADMIN") {
      setDisplayName(name);
    }
    setEditing(true);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      if (role === "CUSTOMER" && customerId) {
        if (!firstName.trim()) { toast.error("First name is required."); setSavingProfile(false); return; }
        const fullName = await authApi.updateCustomerProfile(customerId, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
        updateUser({ name: fullName });
      } else if (role === "SELLER" && sellerId) {
        if (!businessName.trim()) { toast.error("Business name is required."); setSavingProfile(false); return; }
        const newName = await authApi.updateSellerProfile(sellerId, {
          businessName: businessName.trim(),
          contactPerson: contactPerson.trim(),
          mobile: mobile.trim(),
        });
        updateUser({ name: newName });
      } else if (role === "ADMIN") {
        if (!displayName.trim()) { toast.error("Display name is required."); setSavingProfile(false); return; }
        // No admin table in the data model — persist locally to the auth session.
        updateUser({ name: displayName.trim() });
      }
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully.");
      setEditing(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const inputCls =
    "w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-brand-dark outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-200 transition";

  return (
    <div>
      <SectionHeader
        eyebrow="Preferences"
        title="Account Settings"
        action={
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800); }}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 ${saved ? "bg-emerald-600" : "bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90"}`}
          >
            {saved ? <FiCheck size={16} /> : <FiSettings size={16} />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-brand-dark">👤 Account Information</p>
            {canEdit && !editing && (
              <button
                onClick={startEdit}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition flex items-center gap-1.5"
              >
                <FiEdit3 size={13} /> Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              {role === "CUSTOMER" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5">First Name</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5">Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}

              {role === "SELLER" && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5">Business Name</label>
                    <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5">Contact Person</label>
                      <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5">Mobile</label>
                      <input value={mobile} onChange={(e) => setMobile(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </>
              )}

              {role === "ADMIN" && (
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5">Display Name</label>
                  <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5">Email</label>
                <div className="w-full bg-brand-gray border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500">{email} <span className="text-[10px]">(read-only)</span></div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90 transition flex items-center gap-2 disabled:opacity-60"
                >
                  {savingProfile ? <FiClock size={14} className="animate-spin" /> : <FiCheck size={14} />}
                  {savingProfile ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <FiX size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: role === "SELLER" ? "Business Name" : "Full Name", value: name },
                { label: "Email", value: email },
                { label: "Role", value: roleLabel },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1.5">{f.label}</label>
                  <div className="w-full bg-brand-gray border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-brand-dark">{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card className="p-6">
          <p className="text-sm font-bold text-brand-dark mb-4">🔔 Notifications</p>
          <div className="space-y-4">
            {([
              { key: "email" as const, label: "Email notifications", desc: "Order updates & important alerts" },
              { key: "push" as const, label: "Push notifications", desc: "Real-time updates on your device" },
              { key: "marketing" as const, label: "Marketing emails", desc: "Offers, news and recommendations" },
            ]).map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-dark">{label}</p>
                  <p className="text-xs text-gray-600">{desc}</p>
                </div>
                <button
                  onClick={() => toggle(key)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${prefs[key] ? "bg-gradient-to-r from-amber-500 to-pink-500" : "bg-gray-300"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all duration-300 ${prefs[key] ? "left-6" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SupportTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    { q: "How do I track my order?", a: "Open the Orders tab — each order shows its live status (Created, Accepted, Shipped, Delivered)." },
    { q: "How do sellers get approved?", a: "After registering as a seller, an administrator reviews and approves your account before you can list books." },
    { q: "Why is a book pending approval?", a: "Books submitted by sellers must be approved by an admin before they appear in the marketplace." },
    { q: "Can I cancel an order?", a: "Orders can be cancelled before they are shipped. Cancelling restores the seller's stock automatically." },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setMessage(""); }, 2200);
    }
  };

  return (
    <div>
      <SectionHeader eyebrow="Help Center" title="Support & FAQ" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <p className="text-sm font-bold text-brand-dark mb-4 flex items-center gap-2"><FiList /> Frequently Asked Questions</p>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-gray transition">
                  <span className="text-sm font-semibold text-brand-dark pr-4">{faq.q}</span>
                  <motion.span animate={{ rotate: openFaq === i ? 180 : 0 }} className="text-gray-400 flex-shrink-0"><FiChevronDown size={16} /></motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-bold text-brand-dark mb-1 flex items-center gap-2"><FiMessageCircle /> Contact Support</p>
          <p className="text-xs text-gray-600 mb-4">We typically reply within 24 hours</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue…"
              rows={5}
              className="w-full bg-brand-gray border border-gray-300 rounded-xl px-4 py-3 text-sm text-brand-dark placeholder:text-gray-400 resize-none outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-200 transition"
            />
            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${submitted ? "bg-emerald-600" : "bg-gradient-to-r from-amber-500 to-pink-500 hover:opacity-90"}`}
            >
              {submitted ? <FiCheck size={16} /> : <FiSend size={16} />}
              {submitted ? "Ticket Submitted!" : "Submit Ticket"}
            </button>
          </form>
          <div className="mt-4 p-4 rounded-xl bg-brand-gray border border-gray-200">
            <p className="text-xs font-semibold text-brand-dark mb-1">📞 Other ways to reach us</p>
            <p className="text-xs text-gray-600">support@bookhaven.com · +91 98765 43210</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

//  MAIN PAGE
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  // Not logged in → bounce to login
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const goHome = () => navigate("/");

  if (!user) return null;

  const role = user.role;
  const items = SIDEBAR_BY_ROLE[role];
  const roleLabel = ROLE_LABEL[role];

  // keep active tab valid for the role
  const validIds = items.map((i) => i.id);
  const safeTab = validIds.includes(activeTab) ? activeTab : "Dashboard";

  const renderTab = () => {
    // Shared tabs
    if (safeTab === "Settings") return <SettingsTab name={user.name} email={user.email} roleLabel={roleLabel} role={role} customerId={user.customerId} sellerId={user.sellerId} />;
    if (safeTab === "Support") return <SupportTab />;

    if (role === "CUSTOMER") {
      switch (safeTab) {
        case "Dashboard": return <CustomerDashboard name={user.name} customerId={user.customerId} />;
        case "Orders": return <CustomerOrdersTab customerId={user.customerId} />;
        case "Analytics": return <CustomerAnalyticsTab customerId={user.customerId} />;
      }
    }
    if (role === "SELLER") {
      switch (safeTab) {
        case "Dashboard": return <SellerDashboard name={user.name} sellerId={user.sellerId} />;
        case "Orders": return <SellerOrdersTab sellerId={user.sellerId} />;
      }
    }
    if (role === "ADMIN") {
      switch (safeTab) {
        case "Dashboard": return <AdminDashboard name={user.name} />;
        case "Orders": return <AdminOrdersTab />;
      }
    }
    return null;
  };

  return (
    <div className="portal-luxury min-h-screen bg-brand-gray text-brand-dark">
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(245, 166, 35, 0.25); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(245, 166, 35, 0.45); }
      `}</style>

      <div className="flex min-h-screen">
        <Sidebar
          items={items}
          activeTab={safeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          name={user.name}
          email={user.email}
          roleLabel={roleLabel}
          onLogout={handleLogout}
          onGoHome={goHome}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader
            name={user.name}
            email={user.email}
            roleLabel={roleLabel}
            subtitle={ROLE_SUBTITLE[role]}
            onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
            onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
            isCollapsed={isCollapsed}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onLogout={handleLogout}
            onGoHome={goHome}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <motion.div
              key={safeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              {renderTab()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}









