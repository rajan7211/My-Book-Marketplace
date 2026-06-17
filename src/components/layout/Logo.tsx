import { Link } from "react-router-dom";
import { GiBookmarklet } from "react-icons/gi";
import { cn } from "@/lib/utils";

export function Logo({
  dark = false,
  className,
}: {
  dark?: boolean;
  className?: string;
}) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)}>
      <span
        className="relative grid h-9 w-9 place-items-center rounded-full text-brand-dark shadow-[0_0_0_1px_rgba(245,166,35,0.4)] transition group-hover:shadow-[0_0_18px_2px_rgba(245,166,35,0.55)]"
        style={{ background: "linear-gradient(135deg, #f5a623, #f97316)" }}
      >
        <GiBookmarklet size={20} />
      </span>
      <span
        className={cn(
          "font-serif leading-tight tracking-[0.18em] uppercase",
          dark ? "text-brand-dark" : "text-white"
        )}
      >
        <span className="block text-[13px] font-semibold">World</span>
        <span className="block text-[13px] font-semibold">Knowledge</span>
      </span>
    </Link>
  );
}


