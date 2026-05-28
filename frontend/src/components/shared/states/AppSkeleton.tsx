import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AppSkeletonProps {
  type: "table" | "card-grid" | "form" | "dashboard";
  count?: number; // Number of rows or cards to display
}

export function AppSkeleton({ type, count = 5 }: AppSkeletonProps) {
  if (type === "table") {
    return (
      <div className="rounded-md border animate-in fade-in duration-300">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 4 }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: count }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full max-w-[200px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (type === "card-grid") {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-300">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "form") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* KPI Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
        {/* Chart Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
