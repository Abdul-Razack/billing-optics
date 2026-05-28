"use client";

import React from "react";
import { useAuth, Role } from "@/lib/auth-context";

interface RequireRoleProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({ allowedRoles, children, fallback = null }: RequireRoleProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a skeleton if needed
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
