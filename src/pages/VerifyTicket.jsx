import { useEffect, useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { useUGFTransaction } from '../hooks/useUGFTransaction'
import {
  getReadOnlyContract,
  isContractConfigured,
  parseEvent,
  explorerTxUrl,
} from '../utils/contract'
import { formatDate } from '../utils/format'

export default function VerifyTicket() {
  const { isConnected } = useWallet()
  const { executeContract, ugfResult } = useUGFTransaction()
  const [tokenId, setTokenId] = useState('')
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handlePreview(e) {
    e.preventDefault()
    setError(null)
    setPreview(null)
    setResult(null)

    if (!isContractConfigured()) return

    setLoading(true)
    try {
      const contract = getReadOnlyContract()
      const id = BigInt(tokenId)
      const owner = await contract.ownerOf(id)
      const ticket = await contract.tickets(id)
      const rawEvent = await contract.getEvent(ticket.eventId)
      const event = parseEvent(ticket.eventId, rawEvent)

      setPreview({
        tokenId: id.toString(),
        owner,
        verified: ticket.verified,
        event,
      })
    } catch (err) {
      setError(err.reason || err.message || 'Invalid ticket')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOnChain() {
    setError(null)
    setLoading(true)
    try {
      await executeContract('verifyTicket', [BigInt(tokenId)])
      setResult({ pending: true })
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (ugfResult?.txHash) {
      setResult({
        txHash: ugfResult.txHash,
        message: 'Ticket scanned on-chain',
      })
    }
  }, [ugfResult])

  return (
    <section className="max-w-xl py-2">
      <h1 className="text-2xl font-bold text-slate-950">Verify Ticket</h1>
      <p className="mt-1 text-slate-500">
        Look up an NFT ticket by ID, then scan at the door via{' '}
        <code className="rounded bg-slate-100 border border-slate-200/85 px-1.5 py-0.5 text-xs text-slate-750 font-mono">verifyTicket()</code>.
      </p>

      <form onSubmit={handlePreview} className="mt-6 flex gap-2">
        <input
          required
          type="number"
          min="0"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950 focus:outline-none transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !isContractConfigured()}
          className="rounded-lg bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-black active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Lookup
        </button>
      </form>

      {error && <p className="mt-4 text-sm font-semibold text-red-650">{error}</p>}

      {preview && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-950 text-lg border-b border-slate-100 pb-3">Ticket #{preview.tokenId}</h2>
          <dl className="mt-4 space-y-3.5 text-sm text-slate-700">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Event</dt>
              <dd className="font-semibold text-slate-800">{preview.event.name}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Venue</dt>
              <dd className="font-semibold text-slate-800">{preview.event.venue}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Date</dt>
              <dd className="font-semibold text-slate-800">{formatDate(preview.event.eventDate)}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Holder</dt>
              <dd className="font-mono text-xs font-medium text-slate-500 break-all">{preview.owner}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</dt>
              <dd className={`font-semibold ${preview.verified ? 'text-amber-600' : 'text-emerald-600'}`}>
                {preview.verified ? 'Already scanned' : 'Valid — Not yet scanned'}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleVerifyOnChain}
            disabled={!isConnected || loading}
            className="mt-5 w-full rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black active:scale-95 transition-all shadow-md disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading ? 'Opening UGF…' : 'Scan Ticket (verifyTicket)'}
          </button>
        </div>
      )}

      {result?.txHash && (
        <p className="mt-4 text-sm font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 shadow-sm">
          {result.message} —{' '}
          <a
            href={explorerTxUrl(result.txHash)}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-emerald-700"
          >
            View scan transaction
          </a>
        </p>
      )}
    </section>
  )
}
