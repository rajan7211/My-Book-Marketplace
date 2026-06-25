import { FiGrid, FiBookOpen, FiArchive, FiPackage, FiUser } from "react-icons/fi";
import { PortalLayout } from "@/components/layout/PortalLayout";

export function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout
      title="Seller Portal"
      nav={[
        { to: "/seller", label: "Dashboard", icon: FiGrid, end: true },
        { to: "/seller/listings", label: "Listings", icon: FiBookOpen },
        { to: "/seller/inventory", label: "Inventory", icon: FiArchive },
        { to: "/seller/orders", label: "Orders", icon: FiPackage },
        { to: "/profile", label: "My Profile", icon: FiUser },
      ]}
    >
      {children}
    </PortalLayout>
  );
}







