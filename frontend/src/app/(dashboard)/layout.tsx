import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import UpdateBanner from "@/components/system/UpdateBanner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute>
      <AppShell>
        {children}
        <UpdateBanner />
      </AppShell>
    </ProtectedRoute>
  );
}
