import { useEffect, useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { getTicketContract, isContractConfigured, parseEvent } from '../utils/contract'
import { getDemoTickets } from '../utils/demo'
import { formatDate, formatEth } from '../utils/format'
import { TICKET_CONTRACT_ADDRESS } from '../utils/constants'

const LOCAL_RPC = 'http://127.0.0.1:8545'
const LOCAL_CHAIN_IDS = [1337, 31337]

export default function MyTickets() {
  const { address, isConnected, getSigner, chainId, demoMode } = useWallet()
  const [tickets,  setTickets]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function load() {
    if (!isConnected || !address) {
      setTickets([])
      return
    }

    if (demoMode) {
      setLoading(true)
      setError(null)
      try {
        const items = getDemoTickets(address)
        setTickets(items)
      } catch (e) {
        setError(e.message || 'Failed to load demo tickets')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!isContractConfigured()) {
      setTickets([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const signer   = await getSigner()
      const contract = getTicketContract(signer)
      const balance  = await contract.balanceOf(address)
      const count    = Number(balance)
      const items    = []

      for (let i = 0; i < count; i++) {
        const tokenId  = await contract.tokenOfOwnerByIndex(address, i)
        const ticket   = await contract.tickets(tokenId)
        const rawEvent = await contract.getEvent(ticket.eventId)
        const event    = parseEvent(ticket.eventId, rawEvent)
        items.push({
          tokenId:  tokenId.toString(),
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
  }

  // Reload whenever wallet / connection changes
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected, demoMode])

  const isLocal = LOCAL_CHAIN_IDS.includes(chainId)
  const explorerBase = isLocal
    ? null // No explorer for local network
    : `https://sepolia.basescan.org/token/${TICKET_CONTRACT_ADDRESS}`

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-950">My Tickets</h1>
      <p className="mt-1 text-slate-500">
        {demoMode
          ? 'ERC-721 ticket NFTs owned by the demo wallet.'
          : 'ERC-721 ticket NFTs securely held in your wallet.'}
      </p>

      {!isConnected && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
          <p className="text-slate-500 font-medium">
            Connect your wallet or click <strong>⚡ Try Demo</strong> to view tickets.
          </p>
        </div>
      )}

      {isConnected && (
        <>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-950 active:scale-95 transition-all shadow-sm"
          >
            Refresh
          </button>

          {loading && <p className="mt-6 font-medium text-slate-500">Loading your tickets…</p>}
          {error   && <p className="mt-6 font-semibold text-red-600">{error}</p>}
          {!loading && !error && tickets.length === 0 && (
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-slate-500 font-medium">You don't own any tickets yet.</p>
              <p className="mt-1 text-slate-400 text-sm">
                Browse events and buy a ticket to see it here.
              </p>
            </div>
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
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}
                  >
                    {verified ? '✓ Scanned' : 'Valid'}
                  </span>
                </div>

                <p className="mt-3 text-lg font-bold text-slate-900 leading-snug">{event.name}</p>
                <p className="text-sm font-medium text-slate-500">{event.venue}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="font-semibold uppercase tracking-wider text-slate-400">Date</p>
                    <p className="mt-0.5 font-medium text-slate-700">{formatDate(event.eventDate)}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wider text-slate-400">Price</p>
                    <p className="mt-0.5 font-bold text-slate-900">{formatEth(event.ticketPrice)}</p>
                  </div>
                </div>

                {explorerBase && (
                  <a
                    href={`${explorerBase}?a=${tokenId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-block text-xs font-semibold text-slate-400 hover:text-slate-700 underline transition-colors"
                  >
                    View on BaseScan ↗
                  </a>
                )}
                {isLocal && (
                  <p className="mt-4 text-xs text-slate-400 italic">
                    Local network — no block explorer available.
                  </p>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
