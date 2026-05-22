import { isContractConfigured } from '../utils/contract'
import { TICKET_CONTRACT_ADDRESS } from '../utils/constants'

export default function ContractBanner() {
  if (isContractConfigured()) return null

  return (
    <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <strong>Contract not configured.</strong> Deploy TicketChain to Base Sepolia, then set{' '}
      <code className="rounded bg-slate-800 px-1">VITE_TICKET_CONTRACT_ADDRESS</code> in{' '}
      <code className="rounded bg-slate-800 px-1">.env</code> (or run{' '}
      <code className="rounded bg-slate-800 px-1">npm run deploy</code> to write{' '}
      <code className="rounded bg-slate-800 px-1">src/contracts/TicketChain.json</code>).
      {TICKET_CONTRACT_ADDRESS === '' && null}
    </div>
  )
}
