import { Link } from "react-router-dom";
// import loginSide from "@/assets/login-side.jpg
import loginSide from "@/assets/login-side.svg";
import { GiBookmarklet } from "react-icons/gi";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left book-store illustration panel */}
      <div className="relative hidden w-[42%] overflow-hidden bg-[#F6F1E6] lg:block">
        <img
          src={loginSide}
          alt="Book store marketplace illustration"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-7 flex items-center justify-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-yellow text-brand-dark">
              <GiBookmarklet size={20} />
            </span>
            <span className="font-serif text-lg font-bold uppercase tracking-[0.15em] text-brand-dark">
              World Knowledge
            </span>
          </Link>

          <h1 className="text-center text-2xl font-bold text-brand-dark">
            {title}
          </h1>
          <p className="mt-1.5 text-center text-sm text-gray-500">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
















