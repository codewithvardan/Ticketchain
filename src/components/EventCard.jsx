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
    <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-xl font-semibold text-white">{event.name}</h2>
        <span className="rounded-full bg-base-blue/20 px-3 py-1 text-sm font-medium text-blue-300">
          {formatEth(event.ticketPrice)}
        </span>
      </div>
      <p className="mt-2 text-slate-400">{event.description}</p>
      <dl className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Venue</dt>
          <dd>{event.venue}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Date</dt>
          <dd>{formatDate(event.eventDate)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Availability</dt>
          <dd>
            {event.ticketsSold} / {event.maxTickets} sold
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Organizer</dt>
          <dd className="font-mono text-xs">{event.organizer}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleBuy}
          disabled={!canBuy || !isConnected || loading}
          className="rounded-lg bg-base-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading
            ? 'Opening UGF…'
            : soldOut
              ? 'Sold out'
              : 'Buy Ticket (Mock USD gas)'}
        </button>
        {!isConnected && (
          <span className="text-xs text-slate-500">Connect wallet to purchase</span>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {lastTx && (
        <p className="mt-2 text-xs text-emerald-400">
          Ticket purchased —{' '}
          <a
            href={explorerTxUrl(lastTx)}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View tx
          </a>
        </p>
      )}
      <p className="mt-2 text-xs text-slate-500">
        Gas paid via UGF in Mock TYI USD — no Base Sepolia ETH required.
      </p>
    </article>
  )
}
