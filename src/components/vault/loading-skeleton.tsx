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
  return (
    <div className="min-h-screen" role="status" aria-label="Loading your vault">
      <aside className="glass-bar fixed inset-y-0 left-0 hidden w-64 flex-col border-r p-4 lg:flex">
        <div className="mb-5 flex items-center gap-2.5 px-1.5">
          <Bar className="h-9 w-32 rounded-lg" />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-hidden">
          {NAV.filter((n) => n.id !== "settings").map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-xl px-2.5 py-2">
              <Bar className="h-7 w-7 shrink-0 rounded-lg" />
              <Bar className="h-4 w-24" />
            </div>
          ))}
        </nav>
        <div className="mt-3 shrink-0 border-t pt-3">
          <div className="flex items-center gap-3 rounded-xl px-2.5 py-2">
            <Bar className="h-7 w-7 shrink-0 rounded-lg" />
            <Bar className="h-4 w-28" />
          </div>
        </div>
      </aside>
      <div className="lg:pl-64">
        <div className="glass-bar sticky top-0 flex items-center gap-3 border-b px-5 py-2.5 md:px-8">
          <Bar className="h-9 w-28 lg:hidden" />
          <div className="flex flex-1 justify-center">
            <Bar className="h-10 w-full max-w-2xl rounded-lg" />
          </div>
        </div>
        <main className="mx-auto max-w-5xl px-5 pb-32 pt-6 md:px-8 lg:pb-16 lg:pt-8">
          <SectionSkeleton />
        </main>
      </div>
      <div className="glass-bar fixed inset-x-0 bottom-0 grid grid-cols-5 border-t px-3 md:px-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 lg:hidden">
        {[0, 1, 2, 3, 4].map((i) => <Bar key={i} className="h-10 w-10 rounded-xl" />)}
      </div>
    </div>
  );
}
