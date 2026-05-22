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
    <section className="max-w-xl">
      <h1 className="text-2xl font-bold text-white">Verify Ticket</h1>
      <p className="mt-1 text-slate-400">
        Look up an NFT ticket by ID, then scan at the door via{' '}
        <code className="text-slate-300">verifyTicket()</code>.
      </p>

      <form onSubmit={handlePreview} className="mt-6 flex gap-2">
        <input
          required
          type="number"
          min="0"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
        />
        <button
          type="submit"
          disabled={loading || !isContractConfigured()}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-40"
        >
          Lookup
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {preview && (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="font-semibold text-white">Ticket #{preview.tokenId}</h2>
          <dl className="mt-3 space-y-2 text-sm text-slate-300">
            <div>
              <dt className="text-slate-500">Event</dt>
              <dd>{preview.event.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Venue</dt>
              <dd>{preview.event.venue}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Date</dt>
              <dd>{formatDate(preview.event.eventDate)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Holder</dt>
              <dd className="font-mono text-xs break-all">{preview.owner}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd>{preview.verified ? 'Already scanned' : 'Not yet scanned'}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleVerifyOnChain}
            disabled={!isConnected || loading}
            className="mt-4 rounded-lg bg-base-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
          >
            {loading ? 'Opening UGF…' : 'Scan Ticket (verifyTicket)'}
          </button>
        </div>
      )}

      {result?.txHash && (
        <p className="mt-4 text-sm text-emerald-400">
          {result.message} —{' '}
          <a
            href={explorerTxUrl(result.txHash)}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            View tx
          </a>
        </p>
      )}
    </section>
  )
}
