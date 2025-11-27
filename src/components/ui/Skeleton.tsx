import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted bg-gradient-to-r from-muted/50 via-muted/70 to-muted/50 bg-[length:200%_100%] bg-[position:100%_0] motion-safe:animate-[wave_1.5s_infinite]',
        className
      )}
      style={{
        width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
    />
  );
}