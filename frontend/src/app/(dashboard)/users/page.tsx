"use client";

import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductHeader } from "@/components/products/ProductHeader";
import { UserTable } from "@/components/users/UserTable";
import { UserService, User } from "@/services/user.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function UsersListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await UserService.getAll({ limit: 1000 }); // fetch large amount for client table
        if (isMounted) setUsers(response.records);
      } catch (error: any) {
        if (isMounted) toast.error(error.message || "Failed to load users");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchUsers();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <PageContainer title="User Management" description="Manage system access and roles for staff.">
        <ProductHeader 
          title="Staff Directory" 
          action={{ label: "Add New User", href: "/users/new" }}
        />
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <UserTable data={users} />
        )}
      </PageContainer>
    </ProtectedRoute>
  );
}
