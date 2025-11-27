'use client';

import BaseLayout from '@/components/layout/BaseLayout';
import { Skeleton } from '@/components/ui/Skeleton';

const LoadingPage = () => {
  return (
    <BaseLayout>
      <div className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Page header skeleton */}
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>

          {/* Metrics grid skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          {/* Charts section skeleton */}
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>

          {/* Performance metrics skeleton */}
          <div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default LoadingPage;