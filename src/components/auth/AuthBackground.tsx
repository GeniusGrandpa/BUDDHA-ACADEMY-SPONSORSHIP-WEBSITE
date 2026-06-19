export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 via-white to-emerald-50/30" />
      <div className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-48 w-[400px] h-[400px] bg-amber-100/50 rounded-full blur-3xl" />
    </div>
  )
}
