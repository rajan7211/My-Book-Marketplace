import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiHome, FiBook, FiPackage, FiHeart, FiBarChart2, 
  FiSettings, FiHelpCircle, FiMenu, FiBell, FiSearch,
  FiChevronDown, FiLogOut, FiUser, FiEdit3, FiCheck,
  FiX, FiPlus, FiMinus, FiTrash2, FiShoppingCart,
  FiArrowRight, FiTrendingUp, FiCalendar, FiClock,
  FiStar, FiMessageCircle, FiSend, 
  FiDownload, FiShare2,
  FiEye, FiMoon, FiSun, FiMonitor
} from "react-icons/fi";

// ═══════════════════════════════════════════════════════════
//  TYPES & MOCK DATA
// ═══════════════════════════════════════════════════════════
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  memberSince: string;
  tier: string;
  bio: string;
  phone: string;
  location: string;
}

interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  progress: number;
  totalPages: number;
  currentPage: number;
  cover: string;
  status: "Reading" | "Completed" | "Not Started";
  lastRead: string;
  rating: number;
  coverColor: string;
}

interface Order {
  id: string;
  title: string;
  date: string;
  status: "Delivered" | "In Transit" | "Processing" | "Cancelled";
  amount: string;
  items: number;
  seller: string;
  cover: string;
}

interface WishlistItem {
  id: number;
  title: string;
  author: string;
  price: string;
  rating: number;
  reviews: number;
  category: string;
  liked: boolean;
  cover: string;
  inStock: boolean;
}

interface Activity {
  id: number;
  action: string;
  target: string;
  time: string;
  icon: string;
  type: "read" | "purchase" | "wishlist" | "review" | "milestone";
}

interface MonthlyStat {
  month: string;
  books: number;
  pages: number;
  hours: number;
}

const MOCK_USER: User = {
  id: "usr_001",
  name: "Arjun Sharma",
  email: "arjun.sharma@example.com",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  role: "Premium Member",
  memberSince: "Jun 2024",
  tier: "Gold Reader",
  bio: "Avid reader and book collector. Passionate about philosophy, sci-fi, and self-improvement. Always looking for the next great story.",
  phone: "+91 98765 43210",
  location: "Mumbai, India",
};

const MY_BOOKS: Book[] = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", progress: 75, totalPages: 208, currentPage: 156, cover: "🌟", status: "Reading", lastRead: "2 hours ago", rating: 4.5, coverColor: "from-amber-400/20 to-purple-500/20" },
  { id: 2, title: "Atomic Habits", author: "James Clear", category: "Self-Help", progress: 32, totalPages: 320, currentPage: 102, cover: "⚛️", status: "Reading", lastRead: "1 day ago", rating: 4.8, coverColor: "from-blue-400/20 to-cyan-500/20" },
  { id: 3, title: "Sapiens", author: "Yuval Noah Harari", category: "History", progress: 100, totalPages: 443, currentPage: 443, cover: "🌍", status: "Completed", lastRead: "Completed", rating: 4.7, coverColor: "from-emerald-400/20 to-teal-500/20" },
  { id: 4, title: "Deep Work", author: "Cal Newport", category: "Productivity", progress: 0, totalPages: 304, currentPage: 0, cover: "🧠", status: "Not Started", lastRead: "—", rating: 4.4, coverColor: "from-violet-400/20 to-purple-500/20" },
  { id: 5, title: "Ikigai", author: "Héctor García", category: "Philosophy", progress: 60, totalPages: 208, currentPage: 125, cover: "🌸", status: "Reading", lastRead: "3 days ago", rating: 4.2, coverColor: "from-pink-400/20 to-rose-500/20" },
];

const ORDERS: Order[] = [
  { id: "#ORD-4821", title: "The Alchemist", date: "12 Jun 2026", status: "Delivered", amount: "₹349", items: 1, seller: "BookWorm Store", cover: "🌟" },
  { id: "#ORD-4790", title: "Atomic Habits", date: "5 Jun 2026", status: "In Transit", amount: "₹499", items: 1, seller: "ReadMore Hub", cover: "⚛️" },
  { id: "#ORD-4755", title: "Deep Work", date: "28 May 2026", status: "Processing", amount: "₹399", items: 2, seller: "PageTurner", cover: "🧠" },
  { id: "#ORD-4731", title: "Sapiens", date: "20 May 2026", status: "Delivered", amount: "₹599", items: 1, seller: "BookWorm Store", cover: "🌍" },
  { id: "#ORD-4700", title: "Ikigai", date: "15 May 2026", status: "Delivered", amount: "₹299", items: 3, seller: "Literary Lane", cover: "🌸" },
  { id: "#ORD-4680", title: "The Psychology of Money", date: "8 May 2026", status: "Cancelled", amount: "₹399", items: 1, seller: "ReadMore Hub", cover: "💰" },
];

const WISHLIST_DATA: WishlistItem[] = [
  { id: 1, title: "The Psychology of Money", author: "Morgan Housel", price: "₹399", rating: 4.8, reviews: 1240, category: "Finance", liked: true, cover: "💰", inStock: true },
  { id: 2, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", price: "₹549", rating: 4.6, reviews: 890, category: "Psychology", liked: true, cover: "🧠", inStock: true },
  { id: 3, title: "Zero to One", author: "Peter Thiel", price: "₹449", rating: 4.5, reviews: 670, category: "Business", liked: true, cover: "🚀", inStock: false },
  { id: 4, title: "The Lean Startup", author: "Eric Ries", price: "₹379", rating: 4.4, reviews: 520, category: "Business", liked: false, cover: "💡", inStock: true },
  { id: 5, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", price: "₹299", rating: 4.3, reviews: 2100, category: "Finance", liked: true, cover: "💵", inStock: true },
];

const RECENT_ACTIVITY: Activity[] = [
  { id: 1, action: "Started reading", target: "The Alchemist", time: "2 hours ago", icon: "📖", type: "read" },
  { id: 2, action: "Purchased", target: "Atomic Habits", time: "1 day ago", icon: "💳", type: "purchase" },
  { id: 3, action: "Added to wishlist", target: "The Psychology of Money", time: "2 days ago", icon: "❤️", type: "wishlist" },
  { id: 4, action: "Completed", target: "Sapiens", time: "3 days ago", icon: "🏆", type: "milestone" },
  { id: 5, action: "Reviewed", target: "Deep Work", time: "5 days ago", icon: "⭐", type: "review" },
  { id: 6, action: "Reading streak", target: "12 days", time: "Ongoing", icon: "🔥", type: "milestone" },
];

const MONTHLY_STATS: MonthlyStat[] = [
  { month: "Jan", books: 2, pages: 340, hours: 12 },
  { month: "Feb", books: 3, pages: 520, hours: 18 },
  { month: "Mar", books: 1, pages: 280, hours: 9 },
  { month: "Apr", books: 4, pages: 680, hours: 24 },
  { month: "May", books: 2, pages: 410, hours: 15 },
  { month: "Jun", books: 3, pages: 590, hours: 20 },
];

const SIDEBAR_ITEMS = [
  { id: "Dashboard", label: "Dashboard", icon: FiHome },
  { id: "MyBooks", label: "My Books", icon: FiBook },
  { id: "Orders", label: "My Orders", icon: FiPackage },
  { id: "Wishlist", label: "Wishlist", icon: FiHeart },
  { id: "Analytics", label: "Analytics", icon: FiBarChart2 },
  { id: "Settings", label: "Settings", icon: FiSettings },
  { id: "Support", label: "Support", icon: FiHelpCircle },
];

const STATUS_CONFIG = {
  Delivered:   { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500", border: "border-emerald-500/20" },
  "In Transit":{ bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500", border: "border-amber-500/20" },
  Processing:  { bg: "bg-violet-500/10", text: "text-violet-600", dot: "bg-violet-500", border: "border-violet-500/20" },
  Cancelled:   { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500", border: "border-red-500/20" },
};

const BOOK_STATUS_CONFIG = {
  Reading:     { bg: "bg-amber-500/10", text: "text-amber-600", label: "In Progress", bar: "#f59e0b" },
  Completed:   { bg: "bg-emerald-500/10", text: "text-emerald-600", label: "Completed", bar: "#10b981" },
  "Not Started":{ bg: "bg-gray-500/10", text: "text-gray-600", label: "Not Started", bar: "#6b7280" },
};

// ═══════════════════════════════════════════════════════════
//  UTILITY HOOKS & COMPONENTS
// ═══════════════════════════════════════════════════════════

function useAnimatedCounter(value: number, duration = 1500) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = value;
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

function ProgressBar({ progress, color = "#f59e0b", height = 6, animated = true }: { progress: number; color?: string; height?: number; animated?: boolean }) {
  return (
    <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={animated ? { width: 0 } : false}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const sizeClass = size === "md" ? "text-base" : "text-xs";
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <FiStar
          key={i}
          className={`${sizeClass} ${i < full ? "text-amber-500 fill-amber-500" : i === full && half ? "text-amber-500 fill-amber-500/50" : "text-gray-300"}`}
        />
      ))}
      <span className={`${size === "md" ? "text-sm" : "text-xs"} text-gray-500 ml-1 font-medium`}>{rating}</span>
    </div>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "danger" | "info" }) {
  const variants = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warning: "bg-amber-100 text-amber-700 border-amber-200",
    danger: "bg-red-100 text-red-700 border-red-200",
    info: "bg-violet-100 text-violet-700 border-violet-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
//  SIDEBAR COMPONENT - STICKY
// ═══════════════════════════════════════════════════════════
function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  isMobileOpen, 
  setIsMobileOpen, 
  user 
}: {
  activeTab: string;
  setActiveTab: (id: string) => void;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  user: User;
}) {
  const sidebarRef = useRef<HTMLElement>(null!);
  useClickOutside(sidebarRef, () => setIsMobileOpen(false));

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) setIsMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen, setIsMobileOpen]);

  const handleNav = (id: string) => {
    setActiveTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
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

      {/* Sidebar - STICKY */}
      <motion.aside
        ref={sidebarRef}
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 bg-white border-r border-gray-200 flex flex-col
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-72"}
          w-[280px]
        `}
        initial={false}
      >
        {/* Logo */}
        <div className={`p-6 border-b border-gray-200 flex items-center gap-3 ${isCollapsed ? "lg:justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
            <FiBook className="text-white text-lg" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h2 className="font-bold text-lg text-brand-dark whitespace-nowrap">BookHaven</h2>
                <p className="text-[10px] text-gray-500 whitespace-nowrap">Your reading journey</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3"
              >
                Menu
              </motion.p>
            )}
          </AnimatePresence>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-brand-dark"
                } ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}
              >
                <Icon className={`flex-shrink-0 ${isActive ? "text-white" : "text-gray-600 group-hover:text-brand-dark"}`} size={20} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !isCollapsed && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-t border-gray-200 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-gray border border-gray-200">
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-pink-500/30" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-dark truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button className="w-full mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all">
                <FiLogOut size={16} />
                <span>Log Out</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  TOP HEADER - STICKY
// ═══════════════════════════════════════════════════════════
function TopHeader({
  user,
  onMenuToggle,
  onCollapseToggle,
  isCollapsed,
  searchQuery,
  setSearchQuery,
  notifications,
}: {
  user: User;
  onMenuToggle: () => void;
  onCollapseToggle: () => void;
  isCollapsed: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  notifications: number;
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null!);
  const notifRef = useRef<HTMLDivElement>(null!);

  useClickOutside(menuRef, () => setShowUserMenu(false));
  useClickOutside(notifRef, () => setShowNotif(false));

  const greeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <FiMenu className="text-gray-700" size={18} />
          </button>
          <button
            onClick={onCollapseToggle}
            className="hidden lg:flex w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 items-center justify-center hover:bg-gray-200 transition"
          >
            <FiArrowRight className={`text-gray-700 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`} size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-brand-dark truncate">
              {greeting()}, <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{user.name.split(" ")[0]}</span>!
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">What do you want to read today?</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2.5 gap-2 w-72 border border-gray-200 focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-200 transition-all">
            <FiSearch className="text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-brand-dark placeholder:text-gray-400 outline-none w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 transition">
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition relative"
            >
              <FiBell className="text-gray-600" size={18} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-purple-500/30">
                  {notifications}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-brand-dark">Notifications</p>
                    <button className="text-[10px] text-pink-600 hover:text-pink-700 transition">Mark all read</button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { icon: "📦", title: "Order Update", desc: "Your order #ORD-4790 is now in transit!", time: "10 min ago", unread: true },
                      { icon: "📖", title: "Reading Reminder", desc: "You have 52 pages left in The Alchemist.", time: "2 hours ago", unread: true },
                      { icon: "💰", title: "Price Drop", desc: "The Psychology of Money is now ₹349 (was ₹399)", time: "5 hours ago", unread: false },
                    ].map((n, i) => (
                      <div key={i} className={`p-3 rounded-xl transition cursor-pointer ${n.unread ? "bg-brand-gray" : "hover:bg-brand-gray"}`}>
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-brand-dark">{n.title}</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">{n.desc}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                          </div>
                          {n.unread && <span className="w-2 h-2 rounded-full bg-pink-600 flex-shrink-0 mt-1" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 pl-1 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
            >
              <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-brand-dark leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-500">{user.tier}</p>
              </div>
              <FiChevronDown className="text-gray-500 hidden sm:block" size={14} />
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
                    <p className="text-sm font-semibold text-brand-dark">{user.name}</p>
                    <p className="text-[10px] text-gray-500">{user.email}</p>
                  </div>
                  <button className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-dark transition flex items-center gap-2">
                    <FiUser size={14} /> Profile
                  </button>
                  <button className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-100 hover:text-brand-dark transition flex items-center gap-2">
                    <FiSettings size={14} /> Settings
                  </button>
                  <div className="border-t border-gray-200 my-1" />
                  <button className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition flex items-center gap-2">
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

// ═══════════════════════════════════════════════════════════
//  DASHBOARD TAB
// ═══════════════════════════════════════════════════════════
function DashboardTab({ user }: { user: User }) {
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const ordersCount = useAnimatedCounter(9);
  const booksCount = useAnimatedCounter(21);
  const spentCount = useAnimatedCounter(11743);
  const readCount = useAnimatedCounter(14);

  const stats = [
    { label: "Total Orders", value: ordersCount, raw: 9, suffix: "", color: "#f97316", icon: FiPackage, trend: "+12%", trendUp: true },
    { label: "Books Bought", value: booksCount, raw: 21, suffix: "", color: "#ec4899", icon: FiBook, trend: "+5%", trendUp: true },
    { label: "Total Spent", value: spentCount, raw: 11743, suffix: "₹", color: "#f97316", icon: FiShoppingCart, trend: "+8%", trendUp: true },
    { label: "Books Read", value: readCount, raw: 14, suffix: "", color: "#10b981", icon: FiCheck, trend: "+3", trendUp: true },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-[#0f0d1a] border border-white/10 p-6 sm:p-8 text-white"
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0f0d1a] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">⭐ {user.tier}</Badge>
              <span className="text-[10px] text-[#6b6888] tracking-widest uppercase">Member since {user.memberSince}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#f1f0f9]">{user.name}</h2>
            <p className="text-sm text-[#8b86a8] mt-1">{user.bio}</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-[10px] text-[#6b6888] tracking-widest uppercase">Reading Streak</p>
              <p className="text-2xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">12 <span className="text-sm font-normal text-[#6b6888]">days</span></p>
            </div>
          </div>
        </div>
      </motion.div>

     {/* Stat Cards */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map((s, i) => (
    <motion.div
      key={s.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 transition-all duration-300 cursor-default group"
      onMouseEnter={() => setHoveredStat(i)}
      onMouseLeave={() => setHoveredStat(null)}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition"
          style={{ color: s.color }}
        >
          <s.icon size={18} />
        </div>

        <div
          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            s.trendUp
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <FiTrendingUp size={10} />
          {s.trend}
        </div>
      </div>

      {/* Label */}
      <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">
        {s.label}
      </p>

      {/* Value */}
      <p className="text-2xl font-black text-brand-dark">
        {s.suffix}
        {s.value.toLocaleString("en-IN")}
      </p>

      {/* Progress section (NO layout shift fix) */}
      <div className="mt-3 pt-3 border-t border-gray-200 min-h-[44px]">
        {hoveredStat === i && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <ProgressBar
              progress={Math.min(100, (s.raw / 30) * 100)}
              color={s.color}
              height={4}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  ))}
</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currently Reading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent uppercase">In Progress</p>
              <h3 className="text-lg font-bold text-brand-dark">Currently Reading</h3>
            </div>
            <button className="text-xs font-semibold text-gray-500 hover:text-brand-dark transition flex items-center gap-1">
              View all <FiArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {MY_BOOKS.filter(b => b.status === "Reading").map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-brand-gray border border-gray-200 hover:border-purple-300 transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${book.coverColor} flex-shrink-0 border border-gray-200`}>
                  {book.cover}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-brand-dark truncate">{book.title}</p>
                    <Badge variant="warning">{BOOK_STATUS_CONFIG[book.status].label}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{book.author} · {book.currentPage} of {book.totalPages} pages</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <ProgressBar progress={book.progress} color={BOOK_STATUS_CONFIG[book.status].bar} height={5} />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">{book.progress}%</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition opacity-0 group-hover:opacity-100 flex-shrink-0">
                  Continue
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent uppercase">Activity</p>
            <button className="text-xs font-semibold text-gray-500 hover:text-brand-dark transition">View all</button>
          </div>
          <div className="space-y-4">
            {RECENT_ACTIVITY.slice(0, 5).map((act, i) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm flex-shrink-0 border border-gray-200">
                  {act.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold text-brand-dark">{act.action}</span>{" "}
                    <span className="text-gray-600">{act.target}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                    <FiClock size={8} /> {act.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Promo Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="relative overflow-hidden rounded-2xl bg-[#1a1625] border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold tracking-widest text-[#6b6888] uppercase mb-1">Premium Access</p>
          <h3 className="text-xl font-bold text-[#f1f0f9] mb-1">Explore 10K+ books with 1 year full access</h3>
          <p className="text-sm text-[#8b86a8]">Unlimited reading, exclusive discounts, and early access.</p>
        </div>
        <button className="relative z-10 px-6 py-3 rounded-xl text-sm font-bold text-white transition shadow-[0_0_18px_rgba(139,92,246,0.45)] hover:shadow-[0_0_24px_rgba(236,72,153,0.55)] flex-shrink-0" style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}>
          Upgrade to PRO
        </button>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MY BOOKS TAB
// ═══════════════════════════════════════════════════════════
function MyBooksTab() {
  const [filter, setFilter] = useState<"All" | "Reading" | "Completed" | "Not Started">("All");
  const [books, setBooks] = useState<Book[]>(MY_BOOKS);

  const filters: ("All" | "Reading" | "Completed" | "Not Started")[] = ["All", "Reading", "Completed", "Not Started"];
  const filtered = filter === "All" ? books : books.filter(b => b.status === filter);

  const updateProgress = (id: number, delta: number) => {
    setBooks(prev => prev.map(b => {
      if (b.id !== id) return b;
      const newPage = Math.max(0, Math.min(b.totalPages, b.currentPage + delta));
      const newProgress = Math.round((newPage / b.totalPages) * 100);
      const newStatus: Book["status"] = newProgress === 100 ? "Completed" : newProgress > 0 ? "Reading" : "Not Started";
      return { ...b, currentPage: newPage, progress: newProgress, status: newStatus };
    }));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent uppercase">Library</p>
          <h3 className="text-xl font-bold text-brand-dark">My Books</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === f
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-brand-dark"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-all group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-16 h-20 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br ${book.coverColor} flex-shrink-0 border border-gray-200`}>
                {book.cover}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm text-brand-dark truncate">{book.title}</p>
                </div>
                <p className="text-xs text-gray-600 mb-1">{book.author}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={book.status === "Completed" ? "success" : book.status === "Reading" ? "warning" : "default"}>
                    {BOOK_STATUS_CONFIG[book.status].label}
                  </Badge>
                  <span className="text-[10px] text-gray-500">{book.category}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-600">{book.progress}% completed</span>
                <span className="text-[10px] text-gray-500">{book.currentPage}/{book.totalPages} pages</span>
              </div>
              <ProgressBar progress={book.progress} color={BOOK_STATUS_CONFIG[book.status].bar} height={6} />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateProgress(book.id, -10)}
                disabled={book.currentPage <= 0}
                className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 hover:text-brand-dark transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <FiMinus size={12} /> 10
              </button>
              <button
                onClick={() => updateProgress(book.id, 10)}
                disabled={book.currentPage >= book.totalPages}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                <FiPlus size={12} /> 10
              </button>
            </div>

            {book.status === "Reading" && (
              <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-1">
                <FiClock size={10} /> Last read {book.lastRead}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ORDERS TAB
// ═══════════════════════════════════════════════════════════
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [filter, setFilter] = useState<"All" | "Delivered" | "In Transit" | "Processing" | "Cancelled">("All");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filters: ("All" | "Delivered" | "In Transit" | "Processing" | "Cancelled")[] = ["All", "Delivered", "In Transit", "Processing", "Cancelled"];
  const filtered = filter === "All" ? orders : orders.filter(o => o.status === filter);

  const reorder = (orderId: string) => {
    alert(`Re-ordering ${orderId}...`);
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Cancelled" as const } : o));
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent uppercase">Purchase History</p>
          <h3 className="text-xl font-bold text-brand-dark">My Orders</h3>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-brand-dark"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-brand-gray text-[10px] font-bold tracking-widest text-gray-500 uppercase">
          <div className="col-span-4">Book</div>
          <div className="col-span-2">Order ID</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        <div className="divide-y divide-gray-200">
          {filtered.map((order, i) => {
            const s = STATUS_CONFIG[order.status];
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 sm:px-6 sm:py-4 hover:bg-brand-gray transition-all group cursor-pointer"
                onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
              >
                <div className="sm:hidden mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-brand-dark">{order.title}</span>
                    <span className="text-sm font-bold text-brand-dark">{order.amount}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{order.id} · {order.date}</p>
                </div>
                <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gray-100 border border-gray-200">{order.cover}</div>
                    <div>
                      <p className="font-semibold text-sm text-brand-dark">{order.title}</p>
                      <p className="text-[10px] text-gray-600">{order.seller} · {order.items} item{order.items > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-gray-600 font-mono">{order.id}</div>
                  <div className="col-span-2 text-xs text-gray-600">{order.date}</div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {order.status}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-bold text-brand-dark">{order.amount}</span>
                  </div>
                </div>
                <div className="sm:hidden flex items-center justify-between mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text} ${s.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                    {order.status}
                  </span>
                  {order.status === "Delivered" && (
                    <button onClick={(e) => { e.stopPropagation(); reorder(order.id); }} className="text-xs font-semibold text-pink-600 hover:text-pink-700 transition">Reorder →</button>
                  )}
                </div>
                <AnimatePresence>
                  {selectedOrder === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 mt-3 border-t border-gray-200 flex items-center gap-3">
                        {order.status === "Delivered" && (
                          <button onClick={(e) => { e.stopPropagation(); reorder(order.id); }} className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 hover:text-brand-dark transition flex items-center gap-1.5">
                            <FiShoppingCart size={12} /> Reorder
                          </button>
                        )}
                        {order.status === "In Transit" && (
                          <button className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 hover:text-brand-dark transition flex items-center gap-1.5">
                            <FiPackage size={12} /> Track Order
                          </button>
                        )}
                        {(order.status === "Processing" || order.status === "In Transit") && (
                          <button onClick={(e) => { e.stopPropagation(); cancelOrder(order.id); }} className="px-4 py-2 rounded-xl bg-red-100 text-xs font-semibold text-red-700 hover:bg-red-200 transition flex items-center gap-1.5">
                            <FiX size={12} /> Cancel
                          </button>
                        )}
                        <button className="px-4 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 hover:bg-gray-200 hover:text-brand-dark transition flex items-center gap-1.5 ml-auto">
                          <FiDownload size={12} /> Invoice
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  WISHLIST TAB
// ═══════════════════════════════════════════════════════════
function WishlistTab() {
  const [items, setItems] = useState<WishlistItem[]>(WISHLIST_DATA);
  const [sortBy, setSortBy] = useState<"rating" | "price" | "reviews">("rating");

  const toggleLike = (id: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, liked: !item.liked } : item));
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const moveToCart = (title: string) => {
    alert(`Added "${title}" to cart!`);
  };

  const sorted = [...items].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price") return parseInt(a.price.replace(/[^0-9]/g, "")) - parseInt(b.price.replace(/[^0-9]/g, ""));
    return b.reviews - a.reviews;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent uppercase">Saved Books</p>
          <h3 className="text-xl font-bold text-brand-dark">My Wishlist</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600">{items.filter(i => i.liked).length} items</span>
          <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
            {(["rating", "price", "reviews"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  sortBy === s
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "text-gray-600 hover:text-brand-dark"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sorted.map((book, i) => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 transition-all group relative"
            >
              <button
                onClick={() => removeItem(book.id)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition opacity-0 group-hover:opacity-100 z-10"
              >
                <FiTrash2 size={14} />
              </button>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-18 rounded-xl flex items-center justify-center text-2xl bg-gray-100 border border-gray-200 flex-shrink-0">
                  {book.cover}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-brand-dark truncate pr-6">{book.title}</p>
                  <p className="text-xs text-gray-600">{book.author}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-medium text-gray-600 border border-gray-200">{book.category}</span>
                    {!book.inStock && (
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-[10px] font-medium text-red-700 border border-red-200">Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <StarRating rating={book.rating} />
                <span className="text-xs text-gray-500">{book.reviews.toLocaleString()} reviews</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-brand-dark">{book.price}</span>
                  <button
                    onClick={() => toggleLike(book.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                      book.liked ? "text-red-500" : "text-gray-300 hover:text-red-500"
                    }`}
                  >
                    <FiHeart className={book.liked ? "fill-red-500" : ""} size={16} />
                  </button>
                </div>
                <button
                  onClick={() => moveToCart(book.title)}
                  disabled={!book.inStock}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold border border-transparent hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <FiShoppingCart size={12} /> Add
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-2xl border border-gray-200"
        >
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-600 font-medium">Your wishlist is empty</p>
          <p className="text-xs text-gray-500 mt-1">Start exploring books to save them here!</p>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ANALYTICS TAB
// ═══════════════════════════════════════════════════════════
function AnalyticsTab() {
  const [metric, setMetric] = useState<"books" | "pages" | "hours">("books");
  const maxVal = Math.max(...MONTHLY_STATS.map(s => s[metric]));

  const metrics = [
    { key: "books" as const, label: "Books Read", color: "#f97316", icon: FiBook },
    { key: "pages" as const, label: "Pages Read", color: "#ec4899", icon: FiBook },
    { key: "hours" as const, label: "Hours Spent", color: "#f97316", icon: FiClock },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent uppercase">Insights</p>
        <h3 className="text-xl font-bold text-brand-dark mt-0.5">Reading Analytics</h3>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 w-fit">
        {metrics.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              metric === m.key
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                : "text-gray-600 hover:text-brand-dark"
            }`}
          >
            <m.icon size={14} /> {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          key={metric}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-bold text-brand-dark">{metrics.find(m => m.key === metric)?.label} Per Month</p>
            <span className="text-xs text-gray-500">Last 6 months</span>
          </div>
          <div className="flex items-end gap-3 h-52">
            {MONTHLY_STATS.map((stat) => (
              <div key={stat.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex justify-center">
                  <motion.div
                    className="w-full max-w-[48px] rounded-t-xl relative cursor-pointer"
                    style={{ background: metrics.find(m => m.key === metric)?.color }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(stat[metric] / maxVal) * 180}px` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-brand-dark text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-200 shadow-xl">
                      {stat[metric]} {metric}
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] font-semibold text-gray-500">{stat.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm font-bold text-brand-dark mb-6">Reading Distribution</p>
          <div className="space-y-4">
            {[
              { label: "Fiction", value: 35, color: "#f97316" },
              { label: "Self-Help", value: 25, color: "#ec4899" },
              { label: "History", value: 20, color: "#f97316" },
              { label: "Business", value: 15, color: "#10b981" },
              { label: "Other", value: 5, color: "#9ca3af" },
            ].map((cat) => (
              <div key={cat.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs text-gray-600">{cat.label}</span>
                  <span className="text-xs text-brand-dark font-medium">{cat.value}%</span>
                </div>
                <ProgressBar progress={cat.value} color={cat.color} height={8} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Books Read", value: 15, icon: FiBook, color: "#f97316" },
          { label: "Total Pages", value: 2820, icon: FiBook, color: "#ec4899" },
          { label: "Avg per Month", value: 2.5, suffix: "", icon: FiTrendingUp, color: "#f97316" },
          { label: "Reading Streak", value: 12, suffix: " days", icon: FiCalendar, color: "#10b981" },
        ].map((s, i) => (
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
            <p className="text-2xl font-black text-brand-dark">{s.value}{s.suffix || ""}</p>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SETTINGS TAB
// ═══════════════════════════════════════════════════════════
function SettingsTab() {
  const [settings, setSettings] = useState({
    emailFreq: "Daily Digest",
    genres: ["Philosophy", "Sci-Fi"],
    readingGoal: 3,
    theme: "Dark" as "Light" | "Dark" | "System",
    notifications: true,
    emailNotifications: true,
    pushNotifications: true,
    publicProfile: false,
    twoFactor: false,
  });
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<"general" | "privacy" | "notifications">("general");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const genres = ["Fiction", "Sci-Fi", "Philosophy", "History", "Self-Help", "Business", "Psychology", "Biography"];

  const sections = [
    { id: "general" as const, label: "General", icon: FiSettings },
    { id: "privacy" as const, label: "Privacy", icon: FiEye },
    { id: "notifications" as const, label: "Notifications", icon: FiBell },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Preferences</p>
          <h3 className="text-xl font-bold text-brand-dark">Account Settings</h3>
        </div>
        <motion.button
          onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 ${
            saved ? "bg-emerald-600" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
          }`}
          whileTap={{ scale: 0.95 }}
        >
          {saved ? <FiCheck size={16} /> : <FiEdit3 size={16} />}
          {saved ? "Saved!" : "Save Changes"}
        </motion.button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Nav */}
        <div className="lg:w-48 flex lg:flex-col gap-2">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeSection === s.id
                  ? "bg-gray-100 text-brand-dark border border-gray-300"
                  : "text-gray-600 hover:text-brand-dark hover:bg-brand-gray"
              }`}
            >
              <s.icon size={16} />
              <span className="hidden lg:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-4 max-w-2xl">
          {activeSection === "general" && (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">📧 Email Frequency</p>
                    <p className="text-xs text-gray-600">How often should we email you?</p>
                  </div>
                  <select
                    value={settings.emailFreq}
                    onChange={(e) => setSettings({ ...settings, emailFreq: e.target.value })}
                    className="text-sm border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-brand-dark focus:outline-none focus:border-pink-500 cursor-pointer"
                  >
                    {["Instantly", "Daily Digest", "Weekly", "Never"].map(o => <option key={o} className="bg-white">{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-brand-dark mb-1">🎯 Preferred Genres</p>
                <p className="text-xs text-gray-600 mb-3">Personalise your book recommendations</p>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => {
                    const active = settings.genres.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          genres: active ? prev.genres.filter(x => x !== g) : [...prev.genres, g]
                        }))}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent"
                            : "bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">🎯 Reading Goal</p>
                    <p className="text-xs text-gray-600">Books per month target</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, readingGoal: Math.max(1, prev.readingGoal - 1) }))}
                      className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-brand-dark font-bold flex items-center justify-center transition border border-gray-300"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="text-xl font-black text-brand-dark w-6 text-center">{settings.readingGoal}</span>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, readingGoal: Math.min(20, prev.readingGoal + 1) }))}
                      className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center transition hover:opacity-90"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-dark">🎨 Interface Theme</p>
                    <p className="text-xs text-gray-600">Choose your display preference</p>
                  </div>
                  <div className="flex gap-2">
                    {(["Light", "Dark", "System"] as const).map((o) => (
                      <button
                        key={o}
                        onClick={() => setSettings({ ...settings, theme: o })}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          settings.theme === o
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent"
                            : "bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {o === "Light" && <FiSun size={12} />}
                        {o === "Dark" && <FiMoon size={12} />}
                        {o === "System" && <FiMonitor size={12} />}
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "privacy" && (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                {[
                  { key: "publicProfile" as const, label: "👁️ Public Profile", desc: "Allow others to see your reading list and reviews" },
                  { key: "twoFactor" as const, label: "🔐 Two-Factor Authentication", desc: "Add an extra layer of security to your account" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">{label}</p>
                      <p className="text-xs text-gray-600">{desc}</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                        settings[key] ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all duration-300 ${
                        settings[key] ? "left-6" : "left-0.5"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === "notifications" && (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                {[
                  { key: "notifications" as const, label: "🔔 All Notifications", desc: "Master switch for all notifications" },
                  { key: "emailNotifications" as const, label: "📧 Email Notifications", desc: "Get order updates and reading reminders via email" },
                  { key: "pushNotifications" as const, label: "📱 Push Notifications", desc: "Receive push notifications on your device" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-brand-dark">{label}</p>
                      <p className="text-xs text-gray-600">{desc}</p>
                    </div>
                    <button
                      onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                        settings[key] ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all duration-300 ${
                        settings[key] ? "left-6" : "left-0.5"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-300 p-5">
            <p className="text-sm font-semibold text-red-700 mb-1">⚠️ Danger Zone</p>
            <p className="text-xs text-gray-600 mb-3">Once deleted, your account and all data cannot be recovered.</p>
            <button className="px-5 py-2.5 rounded-xl bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 transition border border-red-300 flex items-center gap-2">
              <FiTrash2 size={14} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SUPPORT TAB
// ═══════════════════════════════════════════════════════════
function SupportTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketType, setTicketType] = useState("General");
  const [searchFaq, setSearchFaq] = useState("");

  const faqs = [
    { q: "How do I track my order?", a: "Go to the Orders tab and click on any order to see real-time tracking details and estimated delivery date. You can also click 'Track Order' for in-transit items." },
    { q: "Can I return a book?", a: "Yes! We offer a 7-day return policy for unused books in original condition. Initiate returns from your Orders page by clicking on any delivered order." },
    { q: "How do I change my email?", a: "Visit the Settings tab, update your email address under General settings, and verify the new email via the confirmation link sent to your inbox." },
    { q: "What payment methods are accepted?", a: "We accept UPI, Credit/Debit cards, Net Banking, and Cash on Delivery for orders above ₹200. All transactions are secured with 256-bit encryption." },
    { q: "How does the reading tracker work?", a: "Manually update your progress in My Books using the +10/-10 buttons, or sync with our mobile app for automatic tracking via page detection." },
    { q: "How do I upgrade to PRO?", a: "Click the 'Upgrade to PRO' banner on your Dashboard or visit the Settings tab. PRO members get unlimited access to 10K+ books and exclusive discounts." },
  ];

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(searchFaq.toLowerCase()) || f.a.toLowerCase().includes(searchFaq.toLowerCase()));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setMessage(""); }, 2500);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-widest bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent uppercase">Help Center</p>
        <h3 className="text-xl font-bold text-brand-dark mt-0.5">Support & FAQ</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ Accordion */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-brand-dark">❓ Frequently Asked Questions</p>
          </div>
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchFaq}
              onChange={(e) => setSearchFaq(e.target.value)}
              className="w-full bg-brand-gray border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm text-brand-dark placeholder:text-gray-400 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-200 transition"
            />
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <AnimatePresence>
              {filteredFaqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-gray transition-all"
                  >
                    <span className="text-sm font-semibold text-brand-dark pr-4">{faq.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-400 flex-shrink-0"
                    >
                      <FiChevronDown size={16} />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
            {filteredFaqs.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-8">No FAQs found matching your search.</p>
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm font-bold text-brand-dark mb-1">💬 Contact Support</p>
          <p className="text-xs text-gray-600 mb-4">We typically reply within 24 hours</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Issue Type</label>
              <div className="flex flex-wrap gap-2">
                {["General", "Order", "Technical", "Billing"].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTicketType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      ticketType === t
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-brand-dark"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
                className="w-full bg-brand-gray border border-gray-300 rounded-xl px-4 py-3 text-sm text-brand-dark placeholder:text-gray-400 resize-none outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-200 transition-all"
              />
            </div>
            <motion.button
              type="submit"
              disabled={submitted}
              className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${
                submitted ? "bg-emerald-600" : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {submitted ? <FiCheck size={16} /> : <FiSend size={16} />}
              {submitted ? "Ticket Submitted!" : "Submit Ticket"}
            </motion.button>
          </form>

          <div className="mt-4 p-4 rounded-xl bg-brand-gray border border-gray-200">
            <p className="text-xs font-semibold text-brand-dark mb-1">📞 Other ways to reach us</p>
            <p className="text-xs text-gray-600">support@bookhaven.com · +91 98765 43210</p>
            <div className="flex gap-3 mt-3">
              <button className="px-3 py-2 rounded-lg bg-white text-xs text-gray-600 hover:text-brand-dark hover:bg-gray-100 transition flex items-center gap-1.5 border border-gray-300">
                <FiMessageCircle size={12} /> Live Chat
              </button>
              <button className="px-3 py-2 rounded-lg bg-white text-xs text-gray-600 hover:text-brand-dark hover:bg-gray-100 transition flex items-center gap-1.5 border border-gray-300">
                <FiShare2 size={12} /> Share Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  const renderTab = () => {
    switch (activeTab) {
      case "Dashboard": return <DashboardTab user={MOCK_USER} />;
      case "MyBooks":   return <MyBooksTab />;
      case "Orders":    return <OrdersTab />;
      case "Wishlist":  return <WishlistTab />;
      case "Analytics": return <AnalyticsTab />;
      case "Settings":  return <SettingsTab />;
      case "Support":   return <SupportTab />;
      default:          return <DashboardTab user={MOCK_USER} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray text-brand-dark">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.2); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.4); }
      `}</style>

      <div className="flex min-h-screen">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          user={MOCK_USER}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader
            user={MOCK_USER}
            onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
            onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
            isCollapsed={isCollapsed}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            notifications={2}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <motion.div
              key={activeTab}
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