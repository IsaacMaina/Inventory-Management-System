'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          </div>
        </Card>
        <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          </div>
        </Card>
        <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          </div>
        </Card>
        <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
          <div className="p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Activity Section Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inventory Distribution Skeleton */}
        <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
          <div className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-4 w-48 mb-3" />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity Skeleton */}
        <Card className="glass bg-gradient-subtle backdrop-blur-md h-full">
          <div className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-4 w-48 mb-4" />
            <div className="space-y-4">
              <div className="flex items-start pb-4 last:pb-0">
                <Skeleton className="rounded-full w-8 h-8 mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-start pb-4 last:pb-0">
                <Skeleton className="rounded-full w-8 h-8 mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-start pb-4 last:pb-0">
                <Skeleton className="rounded-full w-8 h-8 mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics Skeleton */}
      <Card className="glass bg-gradient-subtle backdrop-blur-md">
        <div className="p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-4 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg glass flex flex-col items-center justify-center">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-center p-4 rounded-lg glass flex flex-col items-center justify-center">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-center p-4 rounded-lg glass flex flex-col items-center justify-center">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}