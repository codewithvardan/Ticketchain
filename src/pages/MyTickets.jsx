import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { getTicketContract, isContractConfigured, parseEvent } from '../utils/contract'
import { formatDate, formatEth } from '../utils/format'
import { TICKET_CONTRACT_ADDRESS } from '../utils/constants'

export default function MyTickets() {
  const { address, isConnected, getSigner } = useWallet()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!isConnected || !address || !isContractConfigured()) {
      setTickets([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const signer = await getSigner()
      const contract = getTicketContract(signer)
      const balance = await contract.balanceOf(address)
      const count = Number(balance)
      const items = []

      for (let i = 0; i < count; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i)
        const ticket = await contract.tickets(tokenId)
        const eventId = ticket.eventId
        const rawEvent = await contract.getEvent(eventId)
        const event = parseEvent(eventId, rawEvent)
        items.push({
          tokenId: tokenId.toString(),
          verified: ticket.verified,
          event,
        })
      }

      setTickets(items.reverse())
    } catch (e) {
      setError(e.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [address, getSigner, isConnected])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-950">My Tickets</h1>
      <p className="mt-1 text-slate-500">ERC-721 ticket NFTs securely held in your wallet.</p>

      {!isConnected && (
        <p className="mt-8 font-medium text-slate-500">Please connect MetaMask to view your purchased tickets.</p>
      )}

      {isConnected && (
        <>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-750 hover:bg-slate-100 hover:text-slate-950 active:scale-95 transition-all shadow-sm"
          >
            Refresh
          </button>

          {loading && <p className="mt-6 font-medium text-slate-500">Loading your tickets…</p>}
          {error && <p className="mt-6 font-semibold text-red-650">{error}</p>}
          {!loading && !error && tickets.length === 0 && (
            <p className="mt-6 font-medium text-slate-500">You do not own any tickets yet.</p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {tickets.map(({ tokenId, verified, event }) => (
              <article
                key={tokenId}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-950">Ticket #{tokenId}</h2>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      verified
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {verified ? 'Verified' : 'Valid Ticket'}
                  </span>
                </div>
                <p className="mt-3 text-lg font-bold text-slate-900 leading-snug">{event.name}</p>
                <p className="text-sm font-medium text-slate-500">{event.venue}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Date & Time</p>
                <p className="text-sm font-medium text-slate-750">{formatDate(event.eventDate)}</p>
                <p className="mt-2 text-sm font-bold text-slate-900">{formatEth(event.ticketPrice)}</p>
                <a
                  href={`https://sepolia.basescan.org/token/${TICKET_CONTRACT_ADDRESS}?a=${tokenId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-xs font-semibold text-slate-400 hover:text-slate-655 underline transition-colors"
                >
                  View on BaseScan
                </a>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
