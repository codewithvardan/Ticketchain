import { useCallback, useEffect, useState } from 'react'
import EventCard from '../components/EventCard'
import { fetchAllEvents, getReadOnlyContract, isContractConfigured } from '../utils/contract'

export default function BrowseEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!isContractConfigured()) {
      setEvents([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const contract = getReadOnlyContract()
      const list = await fetchAllEvents(contract)
      setEvents(list)
    } catch (e) {
      setError(e.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Browse Events</h1>
          <p className="mt-1 text-slate-500">Purchase tickets securely — sponsors pay gas in Mock USD only.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-750 hover:bg-slate-100 hover:text-slate-950 active:scale-95 transition-all shadow-sm"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="mt-8 font-medium text-slate-500">Loading events…</p>}
      {error && <p className="mt-8 font-semibold text-red-600">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="mt-8 font-medium text-slate-500">No events found. Be the first to create one!</p>
      )}

      <div className="mt-6 grid gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  )
}
