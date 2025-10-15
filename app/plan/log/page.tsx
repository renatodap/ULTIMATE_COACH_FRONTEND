export default function LogHubPage() {
  return (
    <div className="space-y-3">
      <a href="/activities" className="block w-full text-center py-3 bg-neutral-900 border border-neutral-800 rounded-md">Open Activities</a>
      <a href="/nutrition" className="block w-full text-center py-3 bg-neutral-900 border border-neutral-800 rounded-md">Open Meals</a>
      <div className="text-sm text-neutral-400">Tip: Use day view cards to log & attach in one step.</div>
    </div>
  )
}

