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
    <section className="max-w-xl py-2">
      <h1 className="text-2xl font-bold text-slate-950">Create Event</h1>
      <p className="mt-1 text-slate-500">
        List a new event on-chain. Transaction gas is fully sponsored via UGF (Mock USD).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Event name</span>
          <input
            required
            placeholder="e.g. Ticketing Hackathon 2026"
            value={form.name}
            onChange={update('name')}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-950 focus:bg-white focus:ring-1 focus:ring-slate-950 focus:outline-none transition-all duration-150"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Description</span>
          <textarea
            required
            rows={3}
            placeholder="Describe your event, ticket inclusions, etc."
            value={form.description}
            onChange={update('description')}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-950 focus:bg-white focus:ring-1 focus:ring-slate-950 focus:outline-none transition-all duration-150"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Venue</span>
          <input
            required
            placeholder="e.g. Silicon Valley Center or Online"
            value={form.venue}
            onChange={update('venue')}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-950 focus:bg-white focus:ring-1 focus:ring-slate-950 focus:outline-none transition-all duration-150"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Date & time</span>
          <input
            required
            type="datetime-local"
            value={form.eventDate}
            onChange={update('eventDate')}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:border-slate-950 focus:bg-white focus:ring-1 focus:ring-slate-950 focus:outline-none transition-all duration-150"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Ticket price (ETH)</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={form.ticketPrice}
              onChange={update('ticketPrice')}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:border-slate-950 focus:bg-white focus:ring-1 focus:ring-slate-950 focus:outline-none transition-all duration-150"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Max tickets</span>
            <input
              required
              type="number"
              min="1"
              value={form.maxTickets}
              onChange={update('maxTickets')}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-slate-900 focus:border-slate-950 focus:bg-white focus:ring-1 focus:ring-slate-950 focus:outline-none transition-all duration-150"
            />
          </label>
        </div>

        {error && <p className="text-sm font-medium text-red-650">{error}</p>}
        {success && ugfResult?.txHash && (
          <p className="text-sm font-semibold text-emerald-600">
            Event created successfully! —{' '}
            <a
              href={explorerTxUrl(ugfResult.txHash)}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-emerald-700"
            >
              View transaction
            </a>
          </p>
        )}

        <button
          type="submit"
          disabled={!isConnected || !isContractConfigured() || loading}
          className="w-full rounded-lg bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-black active:scale-[0.99] transition-all shadow-md disabled:bg-slate-100 disabled:text-slate-400 disabled:border disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {loading ? 'Opening UGF…' : 'Create Event'}
        </button>
      </form>
    </section>
  )
}
