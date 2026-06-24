import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════════════════
const mockUser = {
  name: "Arjun Sharma",
  email: "arjun.sharma@example.com",
  role: "Customer",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  memberSince: "Jun 2026",
  tier: "Gold Reader",
};

const useAuthStore = () => ({ user: mockUser, isImpersonating: false });

const SIDEBAR_ITEMS = [
  { id: "Dashboard", label: "Dashboard", icon: "🏠" },
  { id: "MyBooks",   label: "My Books",   icon: "📚" },
  { id: "Orders",    label: "My Orders",  icon: "📦" },
  { id: "Wishlist",  label: "Wishlist",   icon: "❤️" },
  { id: "Analytics", label: "Analytics",  icon: "📊" },
  { id: "Settings",  label: "Settings",   icon: "⚙️" },
  { id: "Support",   label: "Support",    icon: "💬" },
];

const MY_BOOKS = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", progress: 75, totalPages: 208, currentPage: 156, cover: "🌟", status: "Reading", lastRead: "2 hours ago" },
  { id: 2, title: "Atomic Habits", author: "James Clear", category: "Self-Help", progress: 32, totalPages: 320, currentPage: 102, cover: "⚛️", status: "Reading", lastRead: "1 day ago" },
  { id: 3, title: "Sapiens", author: "Yuval Noah Harari", category: "History", progress: 100, totalPages: 443, currentPage: 443, cover: "🌍", status: "Completed", lastRead: "Completed" },
  { id: 4, title: "Deep Work", author: "Cal Newport", category: "Productivity", progress: 0, totalPages: 304, currentPage: 0, cover: "🧠", status: "Not Started", lastRead: "—" },
];

const ORDERS = [
  { id: "#ORD-4821", title: "The Alchemist", date: "12 Jun 2026", status: "Delivered", amount: "₹349", items: 1 },
  { id: "#ORD-4790", title: "Atomic Habits", date: "5 Jun 2026", status: "In Transit", amount: "₹499", items: 1 },
  { id: "#ORD-4755", title: "Deep Work", date: "28 May 2026", status: "Processing", amount: "₹399", items: 2 },
  { id: "#ORD-4731", title: "Sapiens", date: "20 May 2026", status: "Delivered", amount: "₹599", items: 1 },
  { id: "#ORD-4700", title: "Ikigai", date: "15 May 2026", status: "Delivered", amount: "₹299", items: 3 },
];

const WISHLIST_DATA = [
  { id: 1, title: "The Psychology of Money", author: "Morgan Housel", price: "₹399", rating: 4.8, reviews: 1240, category: "Finance", liked: true },
  { id: 2, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", price: "₹549", rating: 4.6, reviews: 890, category: "Psychology", liked: true },
  { id: 3, title: "Zero to One", author: "Peter Thiel", price: "₹449", rating: 4.5, reviews: 670, category: "Business", liked: true },
  { id: 4, title: "The Lean Startup", author: "Eric Ries", price: "₹379", rating: 4.4, reviews: 520, category: "Business", liked: false },
];

const RECENT_ACTIVITY = [
  { id: 1, action: "Started reading", target: "The Alchemist", time: "2 hours ago", icon: "📖" },
  { id: 2, action: "Purchased", target: "Atomic Habits", time: "1 day ago", icon: "💳" },
  { id: 3, action: "Added to wishlist", target: "The Psychology of Money", time: "2 days ago", icon: "❤️" },
  { id: 4, action: "Completed", target: "Sapiens", time: "3 days ago", icon: "✅" },
  { id: 5, action: "Reviewed", target: "Deep Work", time: "5 days ago", icon: "⭐" },
];

const MONTHLY_STATS = [
  { month: "Jan", books: 2, pages: 340 },
  { month: "Feb", books: 3, pages: 520 },
  { month: "Mar", books: 1, pages: 280 },
  { month: "Apr", books: 4, pages: 680 },
  { month: "May", books: 2, pages: 410 },
  { month: "Jun", books: 3, pages: 590 },
];

const STATUS_STYLE = {
  Delivered:   { bg: "#ecfdf5", text: "#059669", dot: "#10b981", border: "#a7f3d0" },
  "In Transit":{ bg: "#fffbeb", text: "#d97706", dot: "#f59e0b", border: "#fde68a" },
  Processing:  { bg: "#f5f3ff", text: "#7c3aed", dot: "#8b5cf6", border: "#ddd6fe" },
};

const BOOK_STATUS = {
  Reading:     { bg: "#fef3c7", text: "#d97706", label: "In Progress" },
  Completed:   { bg: "#d1fae5", text: "#059669", label: "Completed" },
  "Not Started":{ bg: "#f3f4f6", text: "#6b7280", label: "Not Started" },
};

// ═══════════════════════════════════════════════════════════
//  UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════

function AnimatedCounter({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = parseInt(value.toString().replace(/,/g, ""), 10);
    let cur = 0;
    const step = Math.ceil(num / 30);
    const timer = setInterval(() => {
      cur = Math.min(cur + step, num);
      setDisplay(cur);
      if (cur >= num) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString("en-IN")}{suffix}</span>;
}

function ProgressBar({ progress, color = "#f5a623", height = 8 }) {
  return (
    <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${progress}%`, background: color }}
      />
    </div>
  );
}

function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-xs">
          {i < fullStars ? "⭐" : i === fullStars && hasHalf ? "⯪" : "☆"}
        </span>
      ))}
      <span className="text-xs text-gray-500 ml-1 font-medium">{rating}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════════════════════
function Sidebar({ activeTab, setActiveTab, isCollapsed, isMobileOpen, setIsMobileOpen, user }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen, setIsMobileOpen]);

  useEffect(() => {
    function handleEscape(e) { if (e.key === "Escape" && isMobileOpen) setIsMobileOpen(false); }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen, setIsMobileOpen]);

  const handleNav = (id) => { setActiveTab(id); setIsMobileOpen(false); };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />
      <aside
        ref={sidebarRef}
        className={`fixed lg:static top-0 left-0 h-full z-50 bg-[#1a1a2e] text-white transition-all duration-300 ease-out flex flex-col
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
          w-[260px]
        `}
      >
        <div className={`p-6 border-b border-white/10 flex items-center gap-3 ${isCollapsed ? "lg:justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br from-[#f5a623] to-[#ec4899] flex-shrink-0">
            📖
          </div>
          <span className={`font-bold text-lg transition-opacity duration-200 ${isCollapsed ? "lg:hidden" : ""}`}>
            BookHaven
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className={`px-3 text-[10px] font-bold tracking-widest text-white/40 uppercase mb-3 ${isCollapsed ? "lg:hidden" : ""}`}>
            Menu
          </p>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-[#f5a623] text-[#1a1a2e] shadow-lg shadow-[#f5a623]/20"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                } ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className={`transition-opacity duration-200 ${isCollapsed ? "lg:hidden" : ""}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className={`absolute right-3 w-1.5 h-1.5 rounded-full bg-white ${isCollapsed ? "lg:hidden" : ""}`} />
                )}
              </button>
            );
          })}
        </nav>
        <div className={`p-4 border-t border-white/10 ${isCollapsed ? "lg:hidden" : ""}`}>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#f5a623]/50" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-[10px] text-white/50 truncate">{user.email}</p>
            </div>
          </div>
          <button className="w-full mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  TOP HEADER
// ═══════════════════════════════════════════════════════════
function TopHeader({ user, onMenuToggle, onCollapseToggle, isCollapsed, searchQuery, setSearchQuery, notifications }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
          >
            <span className="text-lg">☰</span>
          </button>
          <button
            onClick={onCollapseToggle}
            className="hidden lg:flex w-10 h-10 rounded-xl bg-gray-100 items-center justify-center hover:bg-gray-200 transition"
          >
            <span className="text-lg">{isCollapsed ? "→" : "←"}</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-[#1a1a2e] truncate">
              {greeting()}, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">What do you want to read today?</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2.5 gap-2 w-64">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-[#1a1a2e] placeholder-gray-400 outline-none w-full"
            />
          </div>
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition relative"
            >
              <span className="text-lg">🔔</span>
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                <p className="text-sm font-bold text-[#1a1a2e] mb-3">Notifications</p>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#fafaf8] text-xs">
                    <span className="font-semibold text-[#1a1a2e]">📦 Order Update</span>
                    <p className="text-gray-500 mt-1">Your order #ORD-4790 is now in transit!</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#fafaf8] text-xs">
                    <span className="font-semibold text-[#1a1a2e]">📖 Reading Reminder</span>
                    <p className="text-gray-500 mt-1">You have 52 pages left in The Alchemist.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 pl-1 pr-2 sm:pr-3 py-1 rounded-xl hover:bg-gray-100 transition"
            >
              <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-[#f5a623]/30" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[#1a1a2e] leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-400">{user.email}</p>
              </div>
              <span className="text-gray-400 text-xs">▼</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-[#1a1a2e] hover:bg-gray-100 transition">👤 Profile</button>
                <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-[#1a1a2e] hover:bg-gray-100 transition">⚙️ Settings</button>
                <div className="border-t border-gray-100 my-1" />
                <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition">🚪 Log Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD TAB
// ═══════════════════════════════════════════════════════════
function DashboardTab({ user }) {
  const [hoveredStat, setHoveredStat] = useState(null);

  const stats = [
    { label: "Total Orders", value: 9, suffix: "", color: "#f5a623", icon: "📦", trend: "+12%" },
    { label: "Books Bought", value: 21, suffix: "", color: "#8b5cf6", icon: "📚", trend: "+5%" },
    { label: "Total Spent", value: 11743, suffix: "₹", color: "#ec4899", icon: "💳", trend: "+8%" },
    { label: "Books Read", value: 14, suffix: "", color: "#10b981", icon: "✅", trend: "+3" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-default"
            onMouseEnter={() => setHoveredStat(i)}
            onMouseLeave={() => setHoveredStat(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{s.trend}</span>
            </div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">{s.label}</p>
            <p className="text-2xl font-black text-[#1a1a2e]">
              {s.suffix}<AnimatedCounter value={s.value} />
            </p>
            {hoveredStat === i && (
              <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: `${s.color}20` }}>
                <div className="h-full rounded-full animate-pulse" style={{ width: "60%", background: s.color }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-[#f5a623] uppercase">In Progress</p>
              <h3 className="text-lg font-bold text-[#1a1a2e]">Currently Reading</h3>
            </div>
            <button className="text-xs font-semibold text-gray-400 hover:text-[#1a1a2e] transition">View all →</button>
          </div>
          <div className="space-y-4">
            {MY_BOOKS.filter(b => b.status === "Reading").map((book) => (
              <div key={book.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#fafaf8] border border-gray-100 hover:border-[#f5a623]/30 transition-all group">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] flex-shrink-0">
                  {book.cover}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-[#1a1a2e] truncate">{book.title}</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: BOOK_STATUS[book.status].bg, color: BOOK_STATUS[book.status].text }}>
                      {BOOK_STATUS[book.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{book.author} · {book.currentPage} of {book.totalPages} pages</p>
                  <ProgressBar progress={book.progress} color="#f5a623" height={6} />
                </div>
                <button className="px-5 py-2 rounded-xl text-xs font-bold text-[#1a1a2e] bg-[#f5a623] hover:bg-[#e09510] transition shadow-sm shadow-[#f5a623]/20 flex-shrink-0">
                  Continue
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[10px] font-bold tracking-widest text-[#ec4899] uppercase">Activity</p>
            <button className="text-xs font-semibold text-gray-400 hover:text-[#1a1a2e] transition">View all</button>
          </div>
          <div className="space-y-4">
            {RECENT_ACTIVITY.map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#fafaf8] flex items-center justify-center text-sm flex-shrink-0">
                  {act.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[#1a1a2e]">
                    <span className="font-semibold">{act.action}</span>{" "}
                    <span className="text-gray-500">{act.target}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#2d1f3d] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#f5a623] uppercase mb-1">Premium Access</p>
          <h3 className="text-xl font-bold text-white mb-1">Explore 10K+ books with 1 year full access</h3>
          <p className="text-sm text-white/60">Unlimited reading, exclusive discounts, and early access to new releases.</p>
        </div>
        <button className="px-6 py-3 rounded-xl bg-[#f5a623] text-[#1a1a2e] font-bold text-sm hover:bg-[#e09510] transition shadow-lg shadow-[#f5a623]/20 flex-shrink-0">
          Upgrade to PRO
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  MY BOOKS TAB
// ═══════════════════════════════════════════════════════════
function MyBooksTab() {
  const [filter, setFilter] = useState("All");
  const [books, setBooks] = useState(MY_BOOKS);

  const filters = ["All", "Reading", "Completed", "Not Started"];
  const filtered = filter === "All" ? books : books.filter(b => b.status === filter);

  const updateProgress = (id, delta) => {
    setBooks(prev => prev.map(b => {
      if (b.id !== id) return b;
      const newPage = Math.max(0, Math.min(b.totalPages, b.currentPage + delta));
      const newProgress = Math.round((newPage / b.totalPages) * 100);
      const newStatus = newProgress === 100 ? "Completed" : newProgress > 0 ? "Reading" : "Not Started";
      return { ...b, currentPage: newPage, progress: newProgress, status: newStatus };
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#f5a623] uppercase">Library</p>
          <h3 className="text-xl font-bold text-[#1a1a2e]">My Books</h3>
        </div>
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((book) => (
          <div key={book.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-20 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] flex-shrink-0">
                {book.cover}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm text-[#1a1a2e] truncate">{book.title}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: BOOK_STATUS[book.status].bg, color: BOOK_STATUS[book.status].text }}>
                    {BOOK_STATUS[book.status].label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{book.author}</p>
                <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-medium text-gray-500">{book.category}</span>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-gray-500">{book.progress}% completed</span>
                <span className="text-[10px] text-gray-400">{book.currentPage}/{book.totalPages} pages</span>
              </div>
              <ProgressBar progress={book.progress} color={book.progress === 100 ? "#10b981" : "#f5a623"} height={8} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateProgress(book.id, -10)} className="flex-1 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition">−10 Pages</button>
              <button onClick={() => updateProgress(book.id, 10)} className="flex-1 py-2 rounded-xl bg-[#f5a623] text-xs font-bold text-[#1a1a2e] hover:bg-[#e09510] transition">+10 Pages</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ORDERS TAB
// ═══════════════════════════════════════════════════════════
function OrdersTab() {
  const [orders, setOrders] = useState(ORDERS);
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Delivered", "In Transit", "Processing"];
  const filtered = filter === "All" ? orders : orders.filter(o => o.status === filter);

  const reorder = (orderId) => { alert(`Re-ordering ${orderId}...`); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#8b5cf6] uppercase">Purchase History</p>
          <h3 className="text-xl font-bold text-[#1a1a2e]">My Orders</h3>
        </div>
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-[#fafaf8] text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          <div className="col-span-4">Book</div>
          <div className="col-span-2">Order ID</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((order) => {
            const s = STATUS_STYLE[order.status];
            return (
              <div key={order.id} className="p-4 sm:px-6 sm:py-4 hover:bg-[#fafaf8] transition-all group">
                <div className="sm:hidden mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#1a1a2e]">{order.title}</span>
                    <span className="text-sm font-bold text-[#1a1a2e]">{order.amount}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{order.id} · {order.date}</p>
                </div>
                <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe]">📗</div>
                    <div>
                      <p className="font-semibold text-sm text-[#1a1a2e]">{order.title}</p>
                      <p className="text-[10px] text-gray-400">{order.items} item{order.items > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-gray-500 font-mono">{order.id}</div>
                  <div className="col-span-2 text-xs text-gray-500">{order.date}</div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border" style={{ background: s.bg, color: s.text, borderColor: s.border }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                      {order.status}
                    </span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-sm font-bold text-[#1a1a2e]">{order.amount}</span>
                  </div>
                </div>
                <div className="sm:hidden flex items-center justify-between mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border" style={{ background: s.bg, color: s.text, borderColor: s.border }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                    {order.status}
                  </span>
                  {order.status === "Delivered" && (
                    <button onClick={() => reorder(order.id)} className="text-xs font-semibold text-[#f5a623] hover:text-[#e09510] transition">Reorder →</button>
                  )}
                </div>
                <div className="hidden sm:flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {order.status === "Delivered" && (
                    <button onClick={() => reorder(order.id)} className="text-xs font-semibold text-[#f5a623] hover:text-[#e09510] transition">🔄 Reorder</button>
                  )}
                  {order.status === "In Transit" && (
                    <button className="text-xs font-semibold text-[#8b5cf6] hover:text-[#7c3aed] transition">📍 Track Order</button>
                  )}
                </div>
              </div>
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
  const [items, setItems] = useState(WISHLIST_DATA);

  const toggleLike = (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, liked: !item.liked } : item));
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const moveToCart = (title) => {
    alert(`Added "${title}" to cart!`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#ec4899] uppercase">Saved Books</p>
          <h3 className="text-xl font-bold text-[#1a1a2e]">My Wishlist</h3>
        </div>
        <span className="text-xs font-semibold text-gray-400">{items.filter(i => i.liked).length} items</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((book) => (
          <div key={book.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group relative">
            <button onClick={() => removeItem(book.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition opacity-0 group-hover:opacity-100">
              ✕
            </button>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-18 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-[#f5f3ff] to-[#ede9fe] flex-shrink-0">
                📘
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#1a1a2e] truncate pr-6">{book.title}</p>
                <p className="text-xs text-gray-400">{book.author}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-medium text-gray-500">{book.category}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <StarRating rating={book.rating} />
              <span className="text-xs text-gray-400">{book.reviews.toLocaleString()} reviews</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#1a1a2e]">{book.price}</span>
                <button onClick={() => toggleLike(book.id)} className={`w-8 h-8 rounded-full flex items-center justify-center transition ${book.liked ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}>
                  {book.liked ? "❤️" : "🤍"}
                </button>
              </div>
              <button onClick={() => moveToCart(book.title)} className="px-4 py-2 rounded-xl bg-[#1a1a2e] text-white text-xs font-bold hover:bg-[#2d1f3d] transition">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <span className="text-5xl block mb-4">📭</span>
          <p className="text-gray-400 font-medium">Your wishlist is empty</p>
          <p className="text-xs text-gray-300 mt-1">Start exploring books to save them here!</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ANALYTICS TAB
// ═══════════════════════════════════════════════════════════
function AnalyticsTab() {
  const maxBooks = Math.max(...MONTHLY_STATS.map(s => s.books));
  const maxPages = Math.max(...MONTHLY_STATS.map(s => s.pages));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[#8b5cf6] uppercase">Insights</p>
        <h3 className="text-xl font-bold text-[#1a1a2e] mt-0.5">Reading Analytics</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-bold text-[#1a1a2e]">📚 Books Read Per Month</p>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          <div className="flex items-end gap-3 h-48">
            {MONTHLY_STATS.map((stat) => (
              <div key={stat.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex justify-center">
                  <div className="w-full max-w-[40px] rounded-t-lg bg-[#f5a623] transition-all duration-500 hover:bg-[#e09510] relative" style={{ height: `${(stat.books / maxBooks) * 160}px` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {stat.books} books
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-gray-400">{stat.month}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-bold text-[#1a1a2e]">📖 Pages Read Per Month</p>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          <div className="flex items-end gap-3 h-48">
            {MONTHLY_STATS.map((stat) => (
              <div key={stat.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full flex justify-center">
                  <div className="w-full max-w-[40px] rounded-t-lg bg-[#8b5cf6] transition-all duration-500 hover:bg-[#7c3aed] relative" style={{ height: `${(stat.pages / maxPages) * 160}px` }}>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1a1a2e] text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {stat.pages} pages
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-gray-400">{stat.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Books Read", value: 15, icon: "📚" },
          { label: "Total Pages", value: 2820, icon: "📄" },
          { label: "Avg per Month", value: 2.5, icon: "📈" },
          { label: "Reading Streak", value: 12, suffix: " days", icon: "🔥" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <span className="text-2xl mb-2 block">{s.icon}</span>
            <p className="text-2xl font-black text-[#1a1a2e]"><AnimatedCounter value={s.value} />{s.suffix || ""}</p>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-1">{s.label}</p>
          </div>
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
    theme: "Light",
    notifications: true,
    publicProfile: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const genres = ["Fiction", "Sci-Fi", "Philosophy", "History", "Self-Help", "Business", "Psychology"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">Preferences</p>
          <h3 className="text-xl font-bold text-[#1a1a2e]">Account Settings</h3>
        </div>
        <button onClick={handleSave} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${saved ? "bg-emerald-500" : "bg-[#1a1a2e] hover:bg-[#2d1f3d]"}`}>
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
      <div className="space-y-4 max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1a1a2e]">📧 Email Frequency</p>
              <p className="text-xs text-gray-400">How often should we email you?</p>
            </div>
            <select value={settings.emailFreq} onChange={(e) => setSettings({ ...settings, emailFreq: e.target.value })} className="text-sm border border-gray-200 rounded-xl px-4 py-2 bg-white text-[#1a1a2e] font-semibold focus:outline-none focus:border-[#f5a623] cursor-pointer">
              {["Instantly", "Daily Digest", "Weekly", "Never"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-[#1a1a2e] mb-1">🎯 Preferred Genres</p>
          <p className="text-xs text-gray-400 mb-3">Personalise your book recommendations</p>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const active = settings.genres.includes(g);
              return (
                <button key={g} onClick={() => setSettings(prev => ({ ...prev, genres: active ? prev.genres.filter(x => x !== g) : [...prev.genres, g] }))} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${active ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}>
                  {g}
                </button>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1a1a2e]">🎯 Reading Goal</p>
              <p className="text-xs text-gray-400">Books per month target</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSettings(prev => ({ ...prev, readingGoal: Math.max(1, prev.readingGoal - 1) }))} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-lg flex items-center justify-center transition">−</button>
              <span className="text-xl font-black text-[#1a1a2e] w-6 text-center">{settings.readingGoal}</span>
              <button onClick={() => setSettings(prev => ({ ...prev, readingGoal: Math.min(20, prev.readingGoal + 1) }))} className="w-9 h-9 rounded-full bg-[#f5a623] hover:bg-[#e09510] text-white font-bold text-lg flex items-center justify-center transition">+</button>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1a1a2e]">🎨 Interface Theme</p>
              <p className="text-xs text-gray-400">Choose your display preference</p>
            </div>
            <div className="flex gap-2">
              {["Light", "Dark", "System"].map((o) => (
                <button key={o} onClick={() => setSettings({ ...settings, theme: o })} className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${settings.theme === o ? "bg-[#1a1a2e] text-white border-[#1a1a2e]" : "bg-white text-gray-500 border-gray-200"}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          {[
            { key: "notifications", label: "🔔 Push Notifications", desc: "Get notified about orders and deals" },
            { key: "publicProfile", label: "👁️ Public Profile", desc: "Allow others to see your reading list" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1a1a2e]">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <button onClick={() => setSettings(prev => ({ ...prev, [key]: !prev[key] }))} className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings[key] ? "bg-[#f5a623]" : "bg-gray-300"}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-all duration-300 ${settings[key] ? "left-6" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <p className="text-sm font-semibold text-red-500 mb-1">⚠️ Danger Zone</p>
          <p className="text-xs text-gray-400 mb-3">Once deleted, your account cannot be recovered.</p>
          <button className="px-5 py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition border border-red-200">
            🗑️ Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SUPPORT TAB
// ═══════════════════════════════════════════════════════════
function SupportTab() {
  const [openFaq, setOpenFaq] = useState(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketType, setTicketType] = useState("General");

  const faqs = [
    { q: "How do I track my order?", a: "Go to the Orders tab and click on any order to see real-time tracking details and estimated delivery date." },
    { q: "Can I return a book?", a: "Yes! We offer a 7-day return policy for unused books in original condition. Initiate returns from your Orders page." },
    { q: "How do I change my email?", a: "Visit the Settings tab, update your email address, and verify the new email via the confirmation link." },
    { q: "What payment methods are accepted?", a: "We accept UPI, Credit/Debit cards, Net Banking, and Cash on Delivery for orders above ₹200." },
    { q: "How does the reading tracker work?", a: "Manually update your progress in My Books, or sync with our mobile app for automatic tracking." },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setMessage(""); }, 2500);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-widest text-[#8b5cf6] uppercase">Help Center</p>
        <h3 className="text-xl font-bold text-[#1a1a2e] mt-0.5">Support & FAQ</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-bold text-[#1a1a2e] mb-4">❓ Frequently Asked Questions</p>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-[#fafaf8] transition-all">
                  <span className="text-sm font-semibold text-[#1a1a2e] pr-4">{faq.q}</span>
                  <span className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-32" : "max-h-0"}`}>
                  <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-bold text-[#1a1a2e] mb-1">💬 Contact Support</p>
          <p className="text-xs text-gray-400 mb-4">We typically reply within 24 hours</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Issue Type</label>
              <div className="flex flex-wrap gap-2">
                {["General", "Order", "Technical", "Billing"].map(t => (
                  <button key={t} type="button" onClick={() => setTicketType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${ticketType === t ? "bg-[#1a1a2e] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#f5a623] focus:shadow-[0_0_0_3px_rgba(245,166,35,0.12)] transition-all" />
            </div>
            <button type="submit" disabled={submitted} className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all ${submitted ? "bg-emerald-500" : "bg-[#1a1a2e] hover:bg-[#2d1f3d]"}`}>
              {submitted ? "✓ Ticket Submitted!" : "Submit Ticket"}
            </button>
          </form>
          <div className="mt-4 p-4 rounded-xl bg-[#fafaf8] border border-gray-100">
            <p className="text-xs font-semibold text-[#1a1a2e] mb-1">📞 Other ways to reach us</p>
            <p className="text-xs text-gray-500">support@bookhaven.com · +91 98765 43210</p>
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
  const { user, isImpersonating } = useAuthStore();
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
      case "Dashboard": return <DashboardTab user={user} />;
      case "MyBooks":   return <MyBooksTab />;
      case "Orders":    return <OrdersTab />;
      case "Wishlist":  return <WishlistTab />;
      case "Analytics": return <AnalyticsTab />;
      case "Settings":  return <SettingsTab />;
      case "Support":   return <SupportTab />;
      default:          return <DashboardTab user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#1a1a2e]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'DM Sans', sans-serif; }
        .input-field {
          width:100%; border:1.5px solid #e5e7eb; border-radius:14px;
          padding:12px 16px; font-size:14px; background:white;
          outline:none; color:#1a1a2e; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus { border-color:#f5a623; box-shadow:0 0 0 3px rgba(245,166,35,0.12); }
        .input-field:disabled { background:#fafaf8; color:#9ca3af; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;} }
        .fade-up { animation:fadeUp 0.4s ease both; }
      `}</style>

      <div className="flex min-h-screen">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          user={user}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopHeader
            user={user}
            onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
            onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
            isCollapsed={isCollapsed}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            notifications={2}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto fade-up">
              {renderTab()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}