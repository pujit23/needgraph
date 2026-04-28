/**
 * Skeleton.tsx — animated placeholder components for loading states.
 * All match the NeedGraph dark theme exactly.
 */

export function SkeletonBox({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-[6px] ${className}`} />;
}

export function SkeletonKPIRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[16px_20px]">
          <div className="w-20 h-3 skeleton mb-3" />
          <div className="w-16 h-8 skeleton" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 320 }: { height?: number }) {
  return (
    <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
      <div className="w-40 h-3 skeleton mb-6" />
      <div className="skeleton" style={{ height }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1E1E2E] bg-[#0A0A0F]">
        <div className="w-32 h-3 skeleton" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-6 px-5 py-3 border-b border-[#1E1E2E]">
          <div className="w-16 h-4 skeleton" />
          <div className="w-20 h-4 skeleton" />
          <div className="flex-1 h-4 skeleton" />
          <div className="w-12 h-4 skeleton" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 skeleton rounded-[6px]" />
        <div className="flex-1">
          <div className="w-32 h-4 skeleton mb-2" />
          <div className="w-20 h-3 skeleton" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 skeleton" />
        <div className="w-3/4 h-3 skeleton" />
      </div>
    </div>
  );
}

export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
