import { isContractConfigured } from '../utils/contract'
import { TICKET_CONTRACT_ADDRESS } from '../utils/constants'

export default function ContractBanner() {
  if (isContractConfigured()) return null

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
      <strong className="font-semibold">Contract not configured.</strong> Deploy TicketChain to Base Sepolia, then set{' '}
      <code className="rounded bg-slate-100 border border-slate-200/80 px-1 py-0.5 font-mono text-xs text-slate-800">VITE_TICKET_CONTRACT_ADDRESS</code> in{' '}
      <code className="rounded bg-slate-100 border border-slate-200/80 px-1 py-0.5 font-mono text-xs text-slate-800">.env</code> (or run{' '}
      <code className="rounded bg-slate-100 border border-slate-200/80 px-1 py-0.5 font-mono text-xs text-slate-800">npm run deploy</code> to write{' '}
      <code className="rounded bg-slate-100 border border-slate-200/80 px-1 py-0.5 font-mono text-xs text-slate-800">src/contracts/TicketChain.json</code>).
      {TICKET_CONTRACT_ADDRESS === '' && null}
    </div>
  )
}
