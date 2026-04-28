export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-96 bg-slate-100 rounded" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl border-2 border-slate-50" />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 h-[400px] bg-slate-100 rounded-xl shadow-sm" />
        <div className="lg:col-span-3 h-[400px] bg-slate-100 rounded-xl shadow-sm" />
      </div>
    </div>
  )
}
