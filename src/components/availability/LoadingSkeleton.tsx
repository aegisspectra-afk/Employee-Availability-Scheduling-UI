"use client";

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[image:var(--page-gradient)]">
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-64 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="hidden h-10 w-36 animate-pulse rounded-xl bg-slate-100 sm:block" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
