import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import EventCard from '../components/EventCard'
import { fetchAllEvents, getReadOnlyContract, isContractConfigured } from '../utils/contract'
import { useWallet } from '../context/WalletContext'
import { getDemoEvents } from '../utils/demo'

export default function BrowseEvents() {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const { demoMode } = useWallet()
  const location = useLocation()

  // Track a stable ref to load so we can call it from onClick without stale closure
  const loadRef = useRef(null)

  async function load() {
    if (demoMode) {
      setLoading(true)
      setError(null)
      try {
        const list = getDemoEvents()
        setEvents(list)
      } catch (e) {
        setError(e.message || 'Failed to load demo events')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!isContractConfigured()) {
      setEvents([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const contract = getReadOnlyContract()
      const list     = await fetchAllEvents(contract)
      setEvents(list)
    } catch (e) {
      setError(e.message || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  loadRef.current = load

  // Re-fetch every time the route key or demoMode changes
  useEffect(() => {
    loadRef.current()
  // location.key changes on every navigation, even back to the same path
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, demoMode])

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Browse Events</h1>
          <p className="mt-1 text-slate-500">
            Purchase tickets on-chain — no gas fees in Demo mode.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadRef.current()}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 active:scale-95 transition-all shadow-sm"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-800" />
          <p className="text-sm font-medium text-slate-500">Loading events…</p>
        </div>
      )}
      {error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      {!loading && !error && events.length === 0 && (
        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-slate-100 p-4 text-3xl">🎟️</div>
          <p className="font-semibold text-slate-700">No events yet</p>
          <p className="text-sm text-slate-500">Be the first to create one!</p>
        </div>
      )}

      <div className="mt-6 grid gap-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onBuySuccess={() => loadRef.current()} />
        ))}
      </div>
    </section>
  )
}
