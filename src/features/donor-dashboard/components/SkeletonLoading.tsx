export function SkeletonLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-64" />
      <div className="h-4 bg-gray-200 rounded-lg w-96" />
      <div className="grid md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-6 bg-gray-200 rounded-lg w-48" />
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
