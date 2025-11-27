'use client';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Report Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
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
        <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
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
        <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
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
        <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
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

      {/* Charts Section Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Chart Skeleton */}
        <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
          <div className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </Card>

        {/* Inventory Distribution Skeleton */}
        <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md h-full">
          <div className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </Card>
      </div>

      {/* Additional Charts Skeleton */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Sales by Category Skeleton */}
        <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
          <div className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </Card>

        {/* Product Performance Skeleton */}
        <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
          <div className="p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </Card>
      </div>

      {/* Detailed Report Skeleton */}
      <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
        <div className="p-6">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="py-3 px-4">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="py-3 px-4">
                    <Skeleton className="h-4 w-20" />
                  </th>
                  <th className="py-3 px-4">
                    <Skeleton className="h-4 w-20" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(4)].map((_, index) => (
                  <tr key={index} className="border-b border-gray-800 last:border-b-0">
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-12" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-3 px-4">
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}