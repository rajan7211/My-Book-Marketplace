import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-toastify";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "About us", to: "/books" },
  { label: "Contact", to: "/contact" },
  { label: "Categories", to: "/books" },
  { label: "Sign in", to: "/login" },
];

const CUSTOMER_LINKS = [
  { label: "My account", to: "/orders" },
  { label: "My orders", to: "/orders" },
  { label: "Track order", to: "/orders" },
  { label: "Terms", to: "/books" },
  { label: "Privacy policy", to: "/books" },
  { label: "FAQs", to: "/books" },
];

const SOCIALS = [
  { Icon: FiFacebook, label: "Facebook" },
  { Icon: FiInstagram, label: "Instagram" },
  { Icon: FiLinkedin, label: "LinkedIn" },
  { Icon: FiYoutube, label: "YouTube" },
  { Icon: FiTwitter, label: "Twitter" },
];

export function Footer() {
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Subscribed to newsletter!");
    setEmail("");
  };

  return (
    <footer className="relative overflow-hidden bg-[#0f0d1a] py-4 text-white">
      {/* Main grid */}

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">

        <div>
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-[#6b6888]">
            Each book isn't just a story — it's a passport to new worlds,
            exciting adventures, and endless possibilities.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIALS.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="group grid h-8 w-8 place-items-center rounded-full border border-white/[0.12] text-[#6b6888] transition hover:border-transparent"
              >
                <span className="grid h-full w-full place-items-center rounded-full transition group-hover:shadow-[0_0_14px_rgba(236,72,153,0.5)]">
                  <Icon size={14} className="transition group-hover:text-white" />
                </span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[.1em] text-[#f1f0f9]">
            Quick links
          </h4>
          <ul className="space-y-2.5">
            {QUICK_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-[#6b6888] transition hover:text-pink-400">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[.1em] text-[#f1f0f9]">
            Customer area
          </h4>
          <ul className="space-y-2.5">
            {CUSTOMER_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="text-sm text-[#6b6888] transition hover:text-cyan-400">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[.1em] text-[#f1f0f9]">
            Sell with us & Newsletter
          </h4>
          <div className="glass rounded-xl p-5 space-y-4">
            <p className="text-sm leading-relaxed text-[#a8a4c2]">
              List your books and reach thousands of readers worldwide.
            </p>
            <Link to="/seller/register" className="block">
              <Button
                variant="outline"
                className="w-full border-emerald-500/60 text-emerald-400 transition hover:bg-emerald-500 hover:text-white"
              >
                Become a seller
              </Button>
            </Link>
            <form onSubmit={subscribe} className="flex gap-2 pt-2 border-t border-white/10">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email..."
                className="bg-black/30 border border-white/15 text-xs px-3 py-2 rounded-lg w-full text-white focus:outline-none focus:border-pink-500"
              />
              <Button type="submit" size="sm" className="bg-pink-600 hover:bg-pink-700 text-white shrink-0">Join</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-[#534f6e] sm:flex-row sm:px-6">
          <p>© 2026 Bookstore. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="#" className="transition hover:text-[#8b86a8]">Privacy</Link>
            <Link to="#" className="transition hover:text-[#8b86a8]">Terms of service</Link>
            <Link to="#" className="transition hover:text-[#8b86a8]">Cookie policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}




