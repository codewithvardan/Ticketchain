import { useEffect, useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { useUGFTransaction } from '../hooks/useUGFTransaction'
import {
  getReadOnlyContract,
  isContractConfigured,
  parseEvent,
  explorerTxUrl,
} from '../utils/contract'
import { getDemoTicketPreview, verifyDemoTicket } from '../utils/demo'
import { formatDate } from '../utils/format'

async function fetchTicketPreview(tokenIdStr) {
  const contract = getReadOnlyContract()
  const id       = BigInt(tokenIdStr)
  const owner    = await contract.ownerOf(id)
  const ticket   = await contract.tickets(id)
  const rawEvent = await contract.getEvent(ticket.eventId)
  const event    = parseEvent(ticket.eventId, rawEvent)
  return { tokenId: id.toString(), owner, verified: ticket.verified, event }
}

export default function VerifyTicket() {
  const { isConnected, demoMode } = useWallet()
  const { executeContract, ugfResult } = useUGFTransaction()

  const [tokenId, setTokenId] = useState('')
  const [preview, setPreview] = useState(null)
  const [result,  setResult]  = useState(null)   // { message, txHash? } | null
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function handlePreview(e) {
    e.preventDefault()
    setError(null)
    setPreview(null)
    setResult(null)

    if (demoMode) {
      setLoading(true)
      try {
        const data = getDemoTicketPreview(tokenId)
        setPreview(data)
      } catch (err) {
        setError(err.message || 'Invalid ticket ID — does this token exist?')
      } finally {
        setLoading(false)
      }
      return
    }

    if (!isContractConfigured()) return
    setLoading(true)
    try {
      const data = await fetchTicketPreview(tokenId)
      setPreview(data)
    } catch (err) {
      setError(err.reason || err.message || 'Invalid ticket ID — does this token exist?')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOnChain() {
    setError(null)
    setLoading(true)
    try {
      if (demoMode) {
        verifyDemoTicket(tokenId)
        const updated = getDemoTicketPreview(tokenId)
        setPreview(updated)
        setResult({ message: 'Ticket scanned on-chain ✓ (Demo Mode simulated)' })
      } else {
        await executeContract('verifyTicket', [BigInt(tokenId)])

        // For direct local txs the receipt is already confirmed — refresh preview immediately
        const updated = await fetchTicketPreview(tokenId)
        setPreview(updated)
        setResult({ message: 'Ticket scanned on-chain ✓' })
      }
    } catch (err) {
      setError(err.reason || err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  // UGF async path: result arrives via modal callback
  useEffect(() => {
    if (!ugfResult?.txHash) return
    setResult({ txHash: ugfResult.txHash, message: 'Ticket scanned on-chain ✓' })
    // Refresh preview after UGF confirms
    fetchTicketPreview(tokenId)
      .then(setPreview)
      .catch(() => {})
  }, [ugfResult]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="max-w-xl py-2">
      <h1 className="text-2xl font-bold text-slate-950">Verify Ticket</h1>
      <p className="mt-1 text-slate-500">
        Look up any NFT ticket by token ID and scan it at the door on-chain.
      </p>

      {/* ── Lookup form ── */}
      <form onSubmit={handlePreview} className="mt-6 flex gap-2">
        <input
          required
          type="number"
          min="0"
          placeholder="Token ID (e.g. 0)"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950 focus:outline-none transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || (!demoMode && !isContractConfigured())}
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading && !preview ? '…' : 'Lookup'}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* ── Ticket preview card ── */}
      {preview && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Token</p>
              <h2 className="mt-0.5 text-lg font-bold text-slate-950">#{preview.tokenId}</h2>
            </div>
            <span
              className={`mt-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                preview.verified
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {preview.verified ? '✓ Already scanned' : '● Valid — not yet scanned'}
            </span>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            {[
              { label: 'Event',  value: preview.event.name },
              { label: 'Venue',  value: preview.event.venue },
              { label: 'Date',   value: formatDate(preview.event.eventDate) },
              { label: 'Holder', value: preview.owner, mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt>
                <dd className={`font-semibold text-slate-800 ${mono ? 'font-mono text-xs break-all' : ''}`}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Scan button — only shown if not yet verified */}
          {!preview.verified && (
            <button
              type="button"
              onClick={handleVerifyOnChain}
              disabled={!isConnected || loading}
              className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black active:scale-95 transition-all shadow-md disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {loading
                ? 'Processing…'
                : !isConnected
                  ? 'Connect wallet or ⚡ Try Demo to scan'
                  : 'Scan Ticket on-chain'}
            </button>
          )}

          {preview.verified && !result && (
            <p className="mt-5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-center text-sm font-semibold text-amber-700">
              This ticket has already been scanned.
            </p>
          )}
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold text-emerald-700">
            {result.message}
            {result.txHash && (
              <>
                {' '}—{' '}
                <a
                  href={explorerTxUrl(result.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-emerald-900"
                >
                  View tx ↗
                </a>
              </>
            )}
          </p>
        </div>
      )}
    </section>
  )
}
