import { useState, useEffect } from "react";

//  Mock data 
const mockUser = {
  name: "Arjun Sharma",
  email: "arjun.sharma@example.com",
  role: "Customer",
};
const useAuthStore = () => ({ user: mockUser, isImpersonating: false });
const Link = ({ to, children, className }) => (
  <a href={to} className={className}>{children}</a>
);

const TABS = ["Profile", "Orders", "Settings"];

const ORDERS = [
  { id: "#ORD-4821", title: "The Alchemist", date: "12 Jun 2026", status: "Delivered", amount: "₹349" },
  { id: "#ORD-4790", title: "Atomic Habits", date: "5 Jun 2026", status: "In Transit", amount: "₹499" },
  { id: "#ORD-4755", title: "Deep Work", date: "28 May 2026", status: "Processing", amount: "₹399" },
  { id: "#ORD-4731", title: "Sapiens", date: "20 May 2026", status: "Delivered", amount: "₹599" },
];

const STATUS_STYLE = {
  Delivered:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  "In Transit":{ bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"   },
  Processing:  { bg: "bg-violet-50",  text: "text-violet-700",  dot: "bg-violet-400"  },
};

const STAT_CARDS = [
  { label: "Total Orders", value: "9",      suffix: "",  color: "#f5a623", icon: "📦" },
  { label: "Books Bought", value: "21",     suffix: "",  color: "#8b5cf6", icon: "📚" },
  { label: "Total Spent",  value: "11,743", suffix: "₹", color: "#ec4899", icon: "💳" },
  { label: "Active Orders",value: "8",      suffix: "",  color: "#10b981", icon: "🚀" },
];

// Settings rows —each has its own interactive type
const SETTINGS_ROWS = [
  {
    label: "Email Frequency",
    desc: "How often should we email you?",
    type: "select",
    options: ["Instantly", "Daily Digest", "Weekly", "Never"],
    defaultVal: "Daily Digest",
  },
  {
    label: "Preferred Genre",
    desc: "Personalise your book recommendations",
    type: "chips",
    options: ["Fiction", "Sci-Fi", "Philosophy", "History", "Self-Help"],
    defaultVal: ["Philosophy", "Sci-Fi"],
  },
  {
    label: "Reading Goal (books/month)",
    desc: "Set your monthly reading target",
    type: "stepper",
    defaultVal: 3,
    min: 1,
    max: 20,
  },
  {
    label: "Interface Theme",
    desc: "Choose your display preference",
    type: "radio",
    options: ["Light", "Dark", "System"],
    defaultVal: "Light",
  },
];

// Animated counter
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = parseInt(value.replace(/,/g, ""), 10);
    let cur = 0;
    const step = Math.ceil(num / 40);
    const timer = setInterval(() => {
      cur = Math.min(cur + step, num);
      setDisplay(cur);
      if (cur >= num) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString("en-IN")}</span>;
}

//  Clean avatar (no rotating ring)
function Avatar({ name, size = 88 }) {
  const initial = name?.charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center font-black text-white rounded-2xl shadow-lg"
      style={{
        width: size, height: size,
        fontSize: size * 0.38,
        background: "linear-gradient(135deg, #f5a623 0%, #ec4899 100%)",
        letterSpacing: "-1px",
      }}
    >
      {initial}
    </div>
  );
}

// Stat card
function StatCard({ label, value, suffix, color, icon, index }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 100);
    return () => clearTimeout(t);
  }, [index]);
  return (
    <div
      className="relative overflow-hidden bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.4s ease, transform 0.4s ease, box-shadow 0.2s, translateY 0.2s",
      }}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10" style={{ background: color }} />
      <span className="text-2xl mb-3 block">{icon}</span>
      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">{label}</p>
      <p className="text-3xl font-black text-[#1a1625]">
        {suffix}<AnimatedNumber value={value} />
      </p>
    </div>
  );
}

//  Settings row variants
function SettingRow({ label, desc, type, options, defaultVal, min, max }) {
  const [val, setVal] = useState(defaultVal);

  let control = null;

  if (type === "select") {
    control = (
      <select
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-[#1a1625] font-semibold focus:outline-none focus:border-[#f5a623] cursor-pointer"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  }

  if (type === "chips") {
    control = (
      <div className="flex flex-wrap gap-2 mt-3">
        {options.map((o) => {
          const active = val.includes(o);
          return (
            <button
              key={o}
              onClick={() =>
                setVal((prev) =>
                  prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
                )
              }
              className="px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200"
              style={
                active
                  ? { background: "linear-gradient(90deg,#f5a623,#ec4899)", color: "#fff", border: "1.5px solid transparent" }
                  : { background: "#f5f4f0", color: "#6b7280", border: "1.5px solid #e5e7eb" }
              }
            >
              {o}
            </button>
          );
        })}
      </div>
    );
  }

  if (type === "stepper") {
    control = (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setVal((v) => Math.max(min, v - 1))}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-lg flex items-center justify-center transition"
        >−</button>
        <span className="text-xl font-black text-[#1a1625] w-6 text-center">{val}</span>
        <button
          onClick={() => setVal((v) => Math.min(max, v + 1))}
          className="w-8 h-8 rounded-full bg-[#f5a623] hover:bg-[#e09510] text-white font-bold text-lg flex items-center justify-center transition"
        >+</button>
      </div>
    );
  }

  if (type === "radio") {
    control = (
      <div className="flex gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => setVal(o)}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200"
            style={
              val === o
                ? { background: "#1a1625", color: "#fff", border: "1.5px solid #1a1625" }
                : { background: "white", color: "#6b7280", border: "1.5px solid #e5e7eb" }
            }
          >
            {o}
          </button>
        ))}
      </div>
    );
  }

  const isBlock = type === "chips";
  return (
    <div className="p-4 rounded-2xl border border-gray-100 hover:bg-[#fafaf8] transition">
      <div className={`flex ${isBlock ? "flex-col" : "items-center justify-between"} gap-2`}>
        <div>
          <p className="text-sm font-semibold text-[#1a1625]">{label}</p>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
        {control}
      </div>
    </div>
  );
}

// Main page
export default function ProfilePage() {
  const { user, isImpersonating } = useAuthStore();
  const [activeTab, setActiveTab] = useState("Profile");
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName:  user?.name?.split(" ")[1] || "",
    email:     user?.email || "",
    phone:     "+91 98765 43210",
    bio:       "Avid reader and book collector. Loves exploring philosophy and sci-fi.",
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); setIsEditing(false); }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#1a1625]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'DM Serif Display', serif; }
        .input-field {
          width:100%; border:1.5px solid #e5e7eb; border-radius:14px;
          padding:12px 16px; font-size:14px; background:white;
          outline:none; color:#1a1625; transition:border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus { border-color:#f5a623; box-shadow:0 0 0 3px rgba(245,166,35,0.12); }
        .input-field:disabled { background:#fafaf8; color:#9ca3af; }
        .order-row { transition: background 0.2s, transform 0.15s; }
        .order-row:hover { background:#fafaf8; transform:translateX(4px); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:none;} }
        .fade-up { animation:fadeUp 0.45s ease both; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Back button ── */}
        <div className="mb-8 fade-up flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-200"
            style={{
              background: "linear-gradient(135deg,#f5a623,#ec4899)",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(245,166,35,0.35)",
            }}
            onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 6px 20px rgba(245,166,35,0.5)"}
            onMouseOut={(e)  => e.currentTarget.style.boxShadow = "0 4px 14px rgba(245,166,35,0.35)"}
          >
            ← Back to Home
          </Link>
          {isImpersonating && (
            <span className="px-4 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
              ⚠️ Impersonating Mode
            </span>
          )}
        </div>

        {/* ── Hero banner ── */}
        <div
          className="relative overflow-hidden rounded-3xl mb-8 fade-up"
          style={{ background: "linear-gradient(135deg,#1a1625 0%,#2d1f3d 60%,#1a1625 100%)" }}
        >
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle,#f5a623,transparent)" }} />
          <div className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle,#ec4899,transparent)" }} />

          <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar name={user.name} size={88} />
            <div className="flex-1">
              <p className="text-[10px] tracking-[3px] text-[#f5a623] font-semibold uppercase mb-1">
                {user.role} · Member since Jun 2026
              </p>
              <h1 className="font-display text-4xl sm:text-5xl text-white leading-none mb-2">
                {user.name}
              </h1>
              <p className="text-[#8b86a8] text-sm">{user.email}</p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-[#8b86a8] tracking-widest mb-1">LOYALTY TIER</p>
              <span className="px-4 py-1.5 rounded-full text-xs font-bold text-[#f5a623] border border-[#f5a623]/40 bg-[#f5a623]/10">
                ⭐ Gold Reader
              </span>
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>

        {/* ── Tab container ── */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden fade-up">

          {/* Tab bar */}
          <div className="flex border-b border-gray-100 px-6 pt-5 gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                style={
                  activeTab === tab
                    ? { background: "#1a1625", color: "#fff", boxShadow: "0 2px 8px rgba(26,22,37,0.25)" }
                    : { color: "#6b7280" }
                }
              >
                {tab === "Profile"  && "👤 "}
                {tab === "Orders"   && "📦 "}
                {tab === "Settings" && "⚙️ "}
                {tab}
              </button>
            ))}
          </div>

          {/* ── Profile tab ── */}
          {activeTab === "Profile" && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold tracking-[2px] text-[#ec4899] uppercase">Personal Details</p>
                  <h3 className="text-xl font-bold mt-0.5">Profile Information</h3>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-5 py-2 rounded-full border-2 border-gray-200 hover:border-[#1a1625] text-sm font-semibold transition-all"
                  >
                    ✏️ Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2 rounded-full border border-gray-300 text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all"
                      style={{ background: saved ? "#10b981" : "linear-gradient(135deg,#1a1625,#2d1f3d)" }}
                    >
                      {saved ? "✓ Saved!" : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { label: "First Name",    key: "firstName", type: "text",  icon: "👤" },
                  { label: "Last Name",     key: "lastName",  type: "text",  icon: "👤" },
                  { label: "Email Address", key: "email",     type: "email", icon: "✉️" },
                  { label: "Phone Number",  key: "phone",     type: "text",  icon: "📱" },
                ].map(({ label, key, type, icon }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 font-medium mb-1.5">{icon} {label}</label>
                    <input
                      type={type}
                      value={formData[key]}
                      disabled={!isEditing}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="input-field"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-500 font-medium mb-1.5">📝 Bio</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="input-field resize-none"
                  />
                </div>
              </div>

              {/* Completion bar */}
              <div className="mt-8 p-5 rounded-2xl bg-[#fafaf8] border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-semibold text-gray-500">Profile Completion</p>
                  <p className="text-xs font-bold text-[#f5a623]">80%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width:"80%", background:"linear-gradient(90deg,#f5a623,#ec4899)", transition:"width 1s ease" }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">Add your delivery address to reach 100%.</p>
              </div>
            </div>
          )}

          {/*  Orders tab */}
          {activeTab === "Orders" && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] font-bold tracking-[2px] text-[#8b5cf6] uppercase">Purchase History</p>
                  <h3 className="text-xl font-bold mt-0.5">My Orders</h3>
                </div>
                <span className="text-xs font-semibold text-gray-400">{ORDERS.length} orders</span>
              </div>

              <div className="space-y-3">
                {ORDERS.map((order) => {
                  const s = STATUS_STYLE[order.status];
                  return (
                    <div key={order.id} className="order-row flex items-center gap-4 p-4 rounded-2xl border border-gray-100 cursor-pointer">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background:"linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
                        📗
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{order.title}</p>
                        <p className="text-xs text-gray-400">{order.id} · {order.date}</p>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {order.status}
                      </span>
                      <p className="text-sm font-bold text-[#1a1625] w-16 text-right">{order.amount}</p>
                    </div>
                  );
                })}
              </div>

              <button className="mt-6 w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition font-medium">
                View all orders →
              </button>
            </div>
          )}

          {/* Settings tab  */}
          {activeTab === "Settings" && (
            <div className="p-6 sm:p-8 space-y-4">
              <div className="mb-2">
                <p className="text-[10px] font-bold tracking-[2px] text-emerald-500 uppercase">Preferences</p>
                <h3 className="text-xl font-bold mt-0.5">Account Settings</h3>
              </div>

              {SETTINGS_ROWS.map((row) => <SettingRow key={row.label} {...row} />)}

              <div className="pt-4 border-t border-gray-100">
                <button className="w-full py-3 rounded-2xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition">
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}




