import { useWallet } from '../context/WalletContext'
import { isContractConfigured } from '../utils/contract'
import { TICKET_CONTRACT_ADDRESS, BASE_SEPOLIA_CHAIN_ID } from '../utils/constants'

const LOCAL_CHAIN_IDS = [1337, 31337]

export default function ContractBanner() {
  const { chainId, isConnected, demoMode } = useWallet()

  // ── Contract not deployed ─────────────────────────────────────────────────
  if (!isContractConfigured()) {
    return (
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
        <strong className="font-semibold">Contract not configured.</strong> Deploy TicketChain then set{' '}
        <code className="rounded bg-slate-100 border border-slate-200/80 px-1 py-0.5 font-mono text-xs text-slate-800">VITE_TICKET_CONTRACT_ADDRESS</code> in{' '}
        <code className="rounded bg-slate-100 border border-slate-200/80 px-1 py-0.5 font-mono text-xs text-slate-800">.env</code> (or run{' '}
        <code className="rounded bg-slate-100 border border-slate-200/80 px-1 py-0.5 font-mono text-xs text-slate-800">npm run deploy:local</code>).
      </div>
    )
  }

  // ── Demo mode active banner ───────────────────────────────────────────────
  if (demoMode) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800 shadow-sm">
        <span className="mt-0.5 text-base leading-none">⚡</span>
        <div>
          <strong className="font-semibold">Demo Mode active</strong> — using Hardhat account #0 as a silent signer on{' '}
          <code className="rounded bg-white border border-violet-200 px-1 py-0.5 font-mono text-xs">localhost:8545</code>.{' '}
          No wallet or gas needed. All transactions are free and instant.
          Click <strong>Exit Demo</strong> in the header to switch to MetaMask.
        </div>
      </div>
    )
  }

  // ── Wrong network hint (MetaMask on unexpected chain) ────────────────────
  const isLocalContract =
    TICKET_CONTRACT_ADDRESS.toLowerCase() ===
    '0x5fbdb2315678afecb367f032d93f642f64180aa3'

  if (
    isConnected &&
    isLocalContract &&
    chainId !== null &&
    !LOCAL_CHAIN_IDS.includes(chainId) &&
    chainId !== BASE_SEPOLIA_CHAIN_ID
  ) {
    return (
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm">
        <strong className="font-semibold">Switch to Localhost 8545 in MetaMask.</strong>{' '}
        This app is running against a local Hardhat node. In MetaMask go to{' '}
        <strong>Settings → Networks → Add a network manually</strong> and add:{' '}
        <code className="rounded bg-white border border-blue-200 px-1 py-0.5 font-mono text-xs">
          http://127.0.0.1:8545
        </code>{' '}
        · Chain ID{' '}
        <code className="rounded bg-white border border-blue-200 px-1 py-0.5 font-mono text-xs">31337</code>.
        Or click <strong>⚡ Try Demo</strong> to skip MetaMask entirely.
      </div>
    )
  }

  return null
}
