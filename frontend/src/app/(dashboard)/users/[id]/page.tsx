"use client";

import { use } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { RoleBadge } from "@/components/users/RoleBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Edit, Mail, Phone, Calendar, Clock, Shield, Loader2 } from "lucide-react";
import { useFetch } from "@/hooks/useApi";
import { EmptyState } from "@/components/shared/EmptyState";
import { User } from "@/services/user.service";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  
  const { data: response, isLoading, error } = useFetch<{ success: boolean; data: User }>(
    resolvedParams.id && resolvedParams.id !== "undefined" ? `/users/${resolvedParams.id}` : "",
    { enabled: !!(resolvedParams.id && resolvedParams.id !== "undefined") }
  );

  if (isLoading) {
    return (
      <PageContainer title="User Profile" description="View and manage staff member details.">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  const user = response?.data;
  
  if (error || !user) {
    return (
      <PageContainer title="User Profile" description="View and manage staff member details.">
        <EmptyState title="User Not Found" description="The user you are trying to view does not exist." />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="User Profile" description="View and manage staff member details.">
      <div className="mb-6">
        <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-foreground">
          <Link href="/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-bold uppercase">
            {(user.fullName || user.name || "U").charAt(0)}
          </div>
          <div>
              <h1 className="text-2xl font-semibold flex items-center gap-3">
              {user.fullName || user.name}
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </h1>
            <div className="text-muted-foreground mt-1">
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/users/new?edit=${user.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6 md:col-span-1">
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-medium mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.phone || "Not provided"}</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-medium mb-4">Account Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <span className="text-sm">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:col-span-2">
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Assigned Permissions
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user.permissions?.length ? (
                user.permissions.map((perm: string) => (
                  <div key={perm} className="flex items-center p-3 rounded-md border border-border bg-muted/30">
                    <div className="h-2 w-2 rounded-full bg-primary mr-3" />
                    <span className="text-sm capitalize font-medium">
                      {perm.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-4 text-center border rounded-md border-dashed text-muted-foreground text-sm">
                  No specific permissions assigned beyond default role.
                </div>
              )}
            </div>
          </div>

          {/* Placeholder for activity log */}
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <h3 className="font-medium mb-4">Recent Activity (Placeholder)</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="h-2 w-2 mt-2 rounded-full bg-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">System Login</p>
                    <p className="text-xs text-muted-foreground">Logged in from IP 192.168.1.{i * 10}</p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">
                    {i} day(s) ago
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
