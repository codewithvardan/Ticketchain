import { Link } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import {
  BASE_SEPOLIA_CHAIN_ID,
  TICKET_CONTRACT_ADDRESS,
} from '../utils/constants'
import { isContractConfigured } from '../utils/contract'

export default function Home() {
  const { isConnected } = useWallet()

  return (
    <section className="space-y-8 py-4">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
          Decentralized Event Ticketing
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
          Decentralized event ticketing on Base Sepolia. Tickets are secure ERC-721 NFTs.
          Buy tickets and pay gas with{' '}
          <strong className="font-semibold text-slate-900">Mock TYI USD</strong> via the Universal Gas Framework — absolutely no
          ETH required for gas.
        </p>
      </div>

      <div className="grid max-w-2xl gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Network</span>
          <span className="font-semibold text-slate-800">Base Sepolia ({BASE_SEPOLIA_CHAIN_ID})</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contract</span>
          {isContractConfigured() ? (
            <span className="font-mono text-xs font-medium text-slate-700 break-all">{TICKET_CONTRACT_ADDRESS}</span>
          ) : (
            <span className="font-semibold text-amber-600">Not configured</span>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wallet Connection</span>
          <span className={`font-semibold ${isConnected ? 'text-emerald-600' : 'text-slate-500'}`}>
            {isConnected ? 'Connected' : 'Not connected'}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Token Faucet</span>
          <a
            href="https://universalgasframework.com/faucets"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-base-blue underline hover:opacity-80 transition-opacity"
          >
            Claim Mock TYI USD
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          to="/events"
          className="rounded-lg bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-black active:scale-95 transition-all shadow-md hover:shadow-lg duration-250"
        >
          Browse Events
        </Link>
        <Link
          to="/create"
          className="rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all shadow-sm duration-250"
        >
          Create Event
        </Link>
        <Link
          to="/my-tickets"
          className="rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all shadow-sm duration-250"
        >
          My Tickets
        </Link>
      </div>
    </section>
  )
}
