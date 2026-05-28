import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { UserForm } from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CreateUserPage() {
  return (
    <PageContainer title="Add User" description="Create a new staff account and assign roles.">
      <ProductHeader title="New Staff Member">
        <Button variant="outline" asChild>
          <Link href="/users">Cancel</Link>
        </Button>
      </ProductHeader>
      
      <UserForm />
    </PageContainer>
  );
}
