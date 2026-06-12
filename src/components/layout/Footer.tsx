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
    <footer className="bg-brand-dark text-white">
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <h3 className="max-w-xs font-serif text-xl font-semibold leading-snug">
            Subscribe to our newsletter for newest books updates
          </h3>
          <form onSubmit={subscribe} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Type your email here"
              className="h-11 flex-1 rounded-lg border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-gray-400 focus:border-brand-yellow focus:outline-none"
            />
            <Button type="submit" className="h-11 rounded-lg px-5 text-xs font-bold uppercase tracking-wider">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-gray-400">
            Each book you purchase isn't just a story — it's a passport to new
            worlds, exciting adventures and endless possibilities.
          </p>
          <div className="flex gap-3 pt-1">
            {[FiFacebook, FiInstagram, FiLinkedin, FiYoutube, FiTwitter].map(
              (Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-gray-300 transition hover:border-brand-yellow hover:text-brand-yellow"
                >
                  <Icon size={15} />
                </a>
              )
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-brand-yellow">Home</Link></li>
            <li><Link to="/books" className="hover:text-brand-yellow">About Us</Link></li>
            <li><Link to="/books" className="hover:text-brand-yellow">Contact Us</Link></li>
            <li><Link to="/books" className="hover:text-brand-yellow">Categories</Link></li>
            <li><Link to="/login" className="hover:text-brand-yellow">Login</Link></li>
            <li><Link to="/register" className="hover:text-brand-yellow">Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">
            Customer Area
          </h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li><Link to="/orders" className="hover:text-brand-yellow">My Account</Link></li>
            <li><Link to="/orders" className="hover:text-brand-yellow">My Orders</Link></li>
            <li><Link to="/orders" className="hover:text-brand-yellow">Tracking List</Link></li>
            <li><Link to="/books" className="hover:text-brand-yellow">Terms</Link></li>
            <li><Link to="/books" className="hover:text-brand-yellow">Policy</Link></li>
            <li><Link to="/books" className="hover:text-brand-yellow">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider">
            Don't Miss The Newest
          </h4>
          <p className="mb-4 text-sm text-gray-400">
            Become a seller, list your books and reach thousands of readers.
          </p>
          <Link to="/seller/register">
            <Button variant="outline" className="border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-dark">
              Become a Seller
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-gray-500 sm:flex-row sm:px-6">
          <p>© 2026 World Knowledge. All Rights Reserved.</p>
          <p>
            Privacy <span className="mx-2">|</span> Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
}



