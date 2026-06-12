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
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-yellow text-brand-dark">
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




