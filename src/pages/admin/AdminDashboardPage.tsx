import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FiTool } from "react-icons/fi";

/** Placeholder — full admin portal (seller/book approval, stats) is the next build phase. */
export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-gray">
      <Navbar />
      <main className="grid flex-1 place-items-center px-4 py-20">
        <div className="max-w-md rounded-xl bg-white p-10 text-center shadow-sm">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-yellow/20 text-brand-yellow-dark">
            <FiTool size={28} />
          </span>
          <h1 className="mt-5 text-xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">
            Seller Approval, Book Approval and Marketplace Statistics are
            coming in the next build phase.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}


