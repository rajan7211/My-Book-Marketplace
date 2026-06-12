import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="grid h-9 w-9 place-items-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-brand-dark hover:text-white disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <FiChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-1.5 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "h-9 min-w-9 rounded-lg border px-2 text-sm font-medium transition",
              p === page
                ? "border-brand-dark bg-brand-dark text-white"
                : "border-gray-300 text-gray-600 hover:border-brand-dark"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="grid h-9 w-9 place-items-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-brand-dark hover:text-white disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <FiChevronRight size={15} />
      </button>
    </nav>
  );
}




