import { FiGrid, FiUsers, FiBookOpen } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { PortalLayout } from "@/components/layout/PortalLayout";
import { adminApi } from "@/api/admin.api";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
  });

  return (
    <PortalLayout
      title="Admin Portal"
      nav={[
        { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
        {
          to: "/admin/sellers",
          label: "Seller Approval",
          icon: FiUsers,
          badge: stats?.pendingSellers,
        },
        {
          to: "/admin/books",
          label: "Book Approval",
          icon: FiBookOpen,
          badge: stats?.pendingBooks,
        },
      ]}
    >
      {children}
    </PortalLayout>
  );
}



