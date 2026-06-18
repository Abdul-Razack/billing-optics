import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import UpdateBanner from "@/components/system/UpdateBanner";
import { BranchProvider } from "@/contexts/BranchContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <BranchProvider>
        <AppShell>
          {children}
          <UpdateBanner />
        </AppShell>
      </BranchProvider>
    </ProtectedRoute>
  );
}
