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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Browse Events</h1>
          <p className="mt-1 text-slate-400">Purchase tickets with UGF — pay gas in Mock USD only.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="mt-8 text-slate-400">Loading events…</p>}
      {error && <p className="mt-8 text-red-400">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <p className="mt-8 text-slate-400">No events yet. Create the first one!</p>
      )}

      <div className="mt-6 grid gap-4">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  )
}
