import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { UserTable } from "@/components/users/UserTable";
import { MOCK_USERS } from "@/lib/mock-user-data";

export default function UsersListPage() {
  return (
    <PageContainer title="User Management" description="Manage system access and roles for staff.">
      <ProductHeader 
        title="Staff Directory" 
        action={{ label: "Add New User", href: "/users/new" }}
      />
      
      <UserTable data={MOCK_USERS} />
    </PageContainer>
  );
}
