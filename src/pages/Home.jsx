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
    <section className="space-y-6">
      <h1 className="text-4xl font-bold text-white">TicketChain</h1>
      <p className="max-w-2xl text-lg text-slate-300">
        Decentralized event ticketing on Base Sepolia. Tickets are ERC-721 NFTs.
        Buy tickets and pay gas with{' '}
        <strong className="text-white">Mock TYI USD</strong> via Universal Gas Framework — no
        ETH needed for gas.
      </p>

      <ul className="grid max-w-2xl gap-2 text-sm text-slate-400 sm:grid-cols-2">
        <li>Network: Base Sepolia ({BASE_SEPOLIA_CHAIN_ID})</li>
        <li>
          Contract:{' '}
          {isContractConfigured() ? (
            <span className="font-mono text-slate-300">{TICKET_CONTRACT_ADDRESS}</span>
          ) : (
            'Not deployed'
          )}
        </li>
        <li>Wallet: {isConnected ? 'Connected' : 'Not connected'}</li>
        <li>
          Faucet:{' '}
          <a
            href="https://universalgasframework.com/faucets"
            target="_blank"
            rel="noreferrer"
            className="text-base-blue underline"
          >
            Mock TYI USD
          </a>
        </li>
      </ul>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/events"
          className="rounded-lg bg-base-blue px-5 py-2.5 font-medium text-white hover:opacity-90"
        >
          Browse Events
        </Link>
        <Link
          to="/create"
          className="rounded-lg border border-slate-600 px-5 py-2.5 font-medium text-slate-200 hover:bg-slate-800"
        >
          Create Event
        </Link>
        <Link
          to="/my-tickets"
          className="rounded-lg border border-slate-600 px-5 py-2.5 font-medium text-slate-200 hover:bg-slate-800"
        >
          My Tickets
        </Link>
      </div>
    </section>
  )
}
