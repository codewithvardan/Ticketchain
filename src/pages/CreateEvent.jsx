import { useState } from 'react'
import { parseEther } from 'ethers'
import { useWallet } from '../context/WalletContext'
import { useUGFTransaction } from '../hooks/useUGFTransaction'
import { isContractConfigured, explorerTxUrl } from '../utils/contract'

export default function CreateEvent() {
  const { isConnected } = useWallet()
  const { executeContract, ugfResult } = useUGFTransaction()
  const [form, setForm] = useState({
    name: '',
    description: '',
    venue: '',
    eventDate: '',
    ticketPrice: '0',
    maxTickets: '100',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const eventTimestamp = Math.floor(new Date(form.eventDate).getTime() / 1000)
      if (!eventTimestamp || eventTimestamp <= Math.floor(Date.now() / 1000)) {
        throw new Error('Event date must be in the future')
      }

      const ticketPrice = parseEther(form.ticketPrice || '0')
      const maxTickets = BigInt(form.maxTickets)

      await executeContract('createEvent', [
        form.name,
        form.description,
        form.venue,
        eventTimestamp,
        ticketPrice,
        maxTickets,
      ])
      setSuccess(true)
      setForm({
        name: '',
        description: '',
        venue: '',
        eventDate: '',
        ticketPrice: '0',
        maxTickets: '100',
      })
    } catch (err) {
      setError(err.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-xl">
      <h1 className="text-2xl font-bold text-white">Create Event</h1>
      <p className="mt-1 text-slate-400">
        List a new event on-chain. Transaction gas is sponsored via UGF (Mock USD).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm text-slate-400">Event name</span>
          <input
            required
            value={form.name}
            onChange={update('name')}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Description</span>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={update('description')}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Venue</span>
          <input
            required
            value={form.venue}
            onChange={update('venue')}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Date & time</span>
          <input
            required
            type="datetime-local"
            value={form.eventDate}
            onChange={update('eventDate')}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-slate-400">Ticket price (ETH)</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={form.ticketPrice}
              onChange={update('ticketPrice')}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-400">Max tickets</span>
            <input
              required
              type="number"
              min="1"
              value={form.maxTickets}
              onChange={update('maxTickets')}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && ugfResult?.txHash && (
          <p className="text-sm text-emerald-400">
            Event created —{' '}
            <a
              href={explorerTxUrl(ugfResult.txHash)}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              View tx
            </a>
          </p>
        )}

        <button
          type="submit"
          disabled={!isConnected || !isContractConfigured() || loading}
          className="rounded-lg bg-base-blue px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-40"
        >
          {loading ? 'Opening UGF…' : 'Create Event'}
        </button>
      </form>
    </section>
  )
}
