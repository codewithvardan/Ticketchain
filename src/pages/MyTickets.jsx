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
      <h1 className="text-2xl font-bold text-white">My Tickets</h1>
      <p className="mt-1 text-slate-400">ERC-721 ticket NFTs owned by your wallet.</p>

      {!isConnected && (
        <p className="mt-8 text-slate-400">Connect MetaMask to view your tickets.</p>
      )}

      {isConnected && (
        <>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Refresh
          </button>

          {loading && <p className="mt-6 text-slate-400">Loading…</p>}
          {error && <p className="mt-6 text-red-400">{error}</p>}
          {!loading && !error && tickets.length === 0 && (
            <p className="mt-6 text-slate-400">You do not own any tickets yet.</p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {tickets.map(({ tokenId, verified, event }) => (
              <article
                key={tokenId}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-white">#{tokenId}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      verified
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {verified ? 'Verified' : 'Valid'}
                  </span>
                </div>
                <p className="mt-2 text-lg text-white">{event.name}</p>
                <p className="text-sm text-slate-400">{event.venue}</p>
                <p className="mt-2 text-sm text-slate-300">{formatDate(event.eventDate)}</p>
                <p className="mt-1 text-sm text-blue-300">{formatEth(event.ticketPrice)}</p>
                <a
                  href={`https://sepolia.basescan.org/token/${TICKET_CONTRACT_ADDRESS}?a=${tokenId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-slate-500 underline"
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
