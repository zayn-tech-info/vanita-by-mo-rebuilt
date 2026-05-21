/**
 * Skeleton for the product detail page layout (image + details + actions).
 */
export function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="h-4 bg-stone-200 rounded w-64 mb-8" />
      </div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="lg:flex lg:gap-12">
          <div className="lg:flex-1 mb-8 lg:mb-0">
            <div className="aspect-[3/4] bg-stone-200 rounded-sm" />
          </div>
          <div className="lg:w-[480px] space-y-6">
            <div className="h-3 bg-stone-100 rounded w-24" />
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-6 bg-stone-100 rounded w-20" />
            <div className="h-px bg-stone-200" />
            <div className="space-y-2">
              <div className="h-3 bg-stone-100 rounded w-full" />
              <div className="h-3 bg-stone-100 rounded w-5/6" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-14 bg-stone-200 rounded" />
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full bg-stone-200" />
              ))}
            </div>
            <div className="flex gap-3 pt-4">
              <div className="h-12 flex-1 bg-stone-200 rounded" />
              <div className="h-12 w-12 bg-stone-100 rounded" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
