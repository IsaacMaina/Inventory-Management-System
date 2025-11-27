'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProductSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Controls skeleton */}
      <Card className="glass bg-gradient-subtle backdrop-blur-md">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-10 md:col-span-2" />
            <Skeleton className="h-10" />
            <div className="flex gap-2">
              <Skeleton className="flex-1 h-10" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category tree skeleton */}
        <div className="lg:col-span-1">
          <Card className="glass bg-gradient-subtle backdrop-blur-md">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product table skeleton */}
        <div className="lg:col-span-3">
          <Card className="glass bg-gradient-subtle backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400"><Skeleton className="h-4 w-20" /></th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400"><Skeleton className="h-4 w-16" /></th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400"><Skeleton className="h-4 w-20" /></th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400"><Skeleton className="h-4 w-20" /></th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400"><Skeleton className="h-4 w-16" /></th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400"><Skeleton className="h-4 w-16" /></th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400"><Skeleton className="h-4 w-20" /></th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400"><Skeleton className="h-4 w-16" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-800 last:border-b-0">
                        <td className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-3/4" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-1/2" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-3/4" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-3 px-4"><Skeleton className="h-4 w-8" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}