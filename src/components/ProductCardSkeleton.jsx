/**
 * Skeleton placeholder that matches the product card layout (image + title + price).
 * Use while products are loading to avoid empty UI and smooth transitions.
 */
export function ProductCardSkeleton() {
  return (
    <div className="group relative animate-pulse">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-200 mb-3 sm:mb-4 rounded-sm" />
      <div className="text-center space-y-2">
        <div className="h-4 bg-stone-200 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-stone-100 rounded w-16 mx-auto" />
      </div>
    </div>
  );
}

/** Grid of product card skeletons (e.g. 6 or 9 items). */
export function ProductCardSkeletonGrid({ count = 9 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
