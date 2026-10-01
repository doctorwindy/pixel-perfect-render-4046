import { useLocation } from "@tanstack/react-router";
import { NAV } from "@/lib/schema";

function Bar({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`skeleton-shimmer block rounded-md bg-muted ${className}`} />;
}

export function SectionSkeleton() {
  const { pathname } = useLocation();
  const isOverview = pathname === "/overview";
  const isPersonal = pathname === "/personal";
  return (
    <div role="status" aria-label="Loading section" className="space-y-6 pt-2">
      <span className="sr-only">Loading section…</span>
      <div className="mb-8 flex items-center gap-4">
        {!isOverview && <Bar className="h-14 w-14 shrink-0 rounded-2xl sm:h-16 sm:w-16" />}
        <div className="space-y-3">
          <Bar className="h-9 w-44 sm:h-11 sm:w-56" />
          <Bar className="h-4 w-28" />
        </div>
      </div>
      {isOverview ? (
        <>
          <div className="glass-slab space-y-5 p-5">
            <Bar className="h-5 w-28" />
            <div className="flex gap-2"><Bar className="h-9 w-24 rounded-full" /><Bar className="h-9 w-20 rounded-full" /><Bar className="h-9 w-24 rounded-full" /></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => <SkeletonPanel key={i} />)}
          </div>
        </>
      ) : isPersonal ? (
        <div className="space-y-5">
          {[0, 1, 2].map((i) => <div key={i} className="glass-slab space-y-5 p-5">
            <Bar className="h-4 w-28" />
            <div className="grid gap-5 sm:grid-cols-2"><SkeletonField /><SkeletonField /><SkeletonField /><SkeletonField /></div>
          </div>)}
        </div>
      ) : (
        <>
          <Bar className="h-10 w-full max-w-md rounded-lg" />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2"><SkeletonPanel /><SkeletonPanel /></div>
        </>
      )}
    </div>
  );
}

function SkeletonField() {
  return <div className="space-y-3"><Bar className="h-3 w-24" /><Bar className="h-5 w-40 max-w-full" /></div>;
}

function SkeletonPanel() {
  return <div className="glass-slab min-h-44 space-y-5 p-5"><Bar className="h-5 w-36" /><Bar className="h-4 w-3/4" /><Bar className="h-4 w-1/2" /><Bar className="h-4 w-2/3" /></div>;
}

export function VaultLoadingSkeleton() {
  return <div className="min-h-screen" role="status" aria-label="Loading your vault">
    <aside className="glass-bar fixed inset-y-0 left-0 hidden w-64 border-r p-4 lg:block">
      <Bar className="mb-6 h-9 w-36" />
      <div className="space-y-3">{NAV.map((n) => <Bar key={n.id} className="h-10 w-full rounded-xl" />)}</div>
    </aside>
    <div className="lg:pl-64">
      <div className="glass-bar flex h-[61px] items-center border-b px-4 lg:px-8"><Bar className="h-9 w-32 lg:hidden" /><Bar className="ml-auto h-10 w-40 max-w-md flex-1 lg:ml-0 lg:w-full" /><Bar className="ml-auto h-10 w-10 rounded-full" /></div>
      <main className="mx-auto max-w-5xl px-4 pb-32 pt-6 lg:px-8 lg:pb-16 lg:pt-8"><SectionSkeleton /></main>
    </div>
    <div className="glass-bar fixed inset-x-0 bottom-0 flex justify-around border-t p-3 lg:hidden">{[0, 1, 2, 3, 4].map((i) => <Bar key={i} className="h-10 w-10 rounded-xl" />)}</div>
  </div>;
}