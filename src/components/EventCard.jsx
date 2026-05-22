import { useEffect, useState } from 'react'
import { formatDate, formatEth } from '../utils/format'
import { useWallet } from '../context/WalletContext'
import { useUGFTransaction } from '../hooks/useUGFTransaction'
import { explorerTxUrl } from '../utils/contract'

export default function EventCard({ event }) {
  const { isConnected } = useWallet()
  const { executeContract, ugfResult } = useUGFTransaction()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastTx, setLastTx] = useState(null)

  const soldOut = event.remaining <= 0
  const canBuy = event.active && !soldOut

  useEffect(() => {
    if (ugfResult?.txHash) setLastTx(ugfResult.txHash)
  }, [ugfResult])

  async function handleBuy() {
    setError(null)
    setLoading(true)
    try {
      await executeContract('buyTicket', [event.id], event.ticketPrice)
    } catch (e) {
      setError(e.message || 'Purchase failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-950">{event.name}</h2>
        <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-800">
          {formatEth(event.ticketPrice)}
        </span>
      </div>
      <p className="mt-2 text-slate-600">{event.description}</p>
      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Venue</dt>
          <dd className="font-medium text-slate-800">{event.venue}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date</dt>
          <dd className="font-medium text-slate-800">{formatDate(event.eventDate)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Availability</dt>
          <dd className="font-medium text-slate-800">
            {event.ticketsSold} / {event.maxTickets} sold
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Organizer</dt>
          <dd className="font-mono text-xs font-medium text-slate-500 truncate max-w-full" title={event.organizer}>
            {event.organizer}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleBuy}
          disabled={!canBuy || !isConnected || loading}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black active:scale-95 transition-all shadow-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none"
        >
          {loading
            ? 'Opening UGF…'
            : soldOut
              ? 'Sold out'
              : 'Buy Ticket (Mock USD gas)'}
        </button>
        {!isConnected && (
          <span className="text-xs font-medium text-slate-500">Connect wallet to purchase</span>
        )}
      </div>

      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
      {lastTx && (
        <p className="mt-2 text-sm font-semibold text-emerald-600">
          Ticket purchased —{' '}
          <a
            href={explorerTxUrl(lastTx)}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-emerald-700"
          >
            View tx
          </a>
        </p>
      )}
      <p className="mt-3 text-xs font-medium text-slate-400">
        Gas paid via UGF in Mock TYI USD — no Base Sepolia ETH required.
      </p>
    </article>
  )
}
