import { Link } from "react-router-dom";
import { FiClock } from "react-icons/fi";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";


export default function SellerPendingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-gray">
      <Navbar />
      <main className="grid flex-1 place-items-center px-4 py-20">
        <div className="max-w-md rounded-xl bg-white p-10 text-center shadow-sm">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600">
            <FiClock size={28} />
          </span>
          <h1 className="mt-5 text-xl font-bold">Approval Pending</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Your seller account is under review by the marketplace admin. You
            will be able to access the seller dashboard and create listings
            once approved.
          </p>
          <Link to="/">
            <Button variant="dark" className="mt-6">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}




