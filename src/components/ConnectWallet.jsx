import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { shortenAddress } from '../utils/format'

const LOCAL_CHAIN_IDS = [1337, 31337]

/** Calls Hardhat's hardhat_setBalance to instantly give 100 ETH — local only */
async function fundWalletFromLocalNode(address) {
  const res = await fetch('http://127.0.0.1:8545', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'hardhat_setBalance',
      params: [address, '0x56BC75E2D63100000'], // 100 ETH
      id: 1,
    }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
}

export default function ConnectWallet() {
  const {
    address, chainId, connecting, error,
    hasMetaMask, isConnected, isCorrectChain, demoMode,
    connect, connectDemo, disconnect,
  } = useWallet()

  const [funding,   setFunding]   = useState(false)
  const [funded,    setFunded]    = useState(false)
  const [fundError, setFundError] = useState(null)

  const isLocal = LOCAL_CHAIN_IDS.includes(chainId)

  async function handleFund() {
    if (!address) return
    setFunding(true); setFunded(false); setFundError(null)
    try {
      await fundWalletFromLocalNode(address)
      setFunded(true)
      setTimeout(() => setFunded(false), 3000)
    } catch (e) {
      setFundError(e.message || 'Failed to fund wallet')
    } finally {
      setFunding(false)
    }
  }

  // ── Not installed ────────────────────────────────────────────────────────────
  if (!hasMetaMask && !isConnected) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2">
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            Install MetaMask
          </a>
          <button
            type="button"
            onClick={connectDemo}
            disabled={connecting}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 active:scale-95 transition-all shadow-sm"
          >
            {connecting ? 'Connecting…' : '⚡ Try Demo'}
          </button>
        </div>
      </div>
    )
  }

  // ── Connected (MetaMask or Demo) ─────────────────────────────────────────────
  if (isConnected) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2 flex-wrap justify-end">

          {/* Demo mode badge */}
          {demoMode && (
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 tracking-wide">
              Demo Mode
            </span>
          )}

          {/* Wrong network warning */}
          {!isCorrectChain && (
            <span className="text-xs font-semibold text-amber-600">Wrong network</span>
          )}

          {/* Address pill */}
          <span className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-sm font-medium text-slate-700">
            {shortenAddress(address)}
          </span>

          {/* Fund button — local chains only, not in demo mode (demo wallet already has ETH) */}
          {isLocal && !demoMode && (
            <button
              type="button"
              onClick={handleFund}
              disabled={funding}
              title="Inject 100 ETH from the local Hardhat node (dev only)"
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all active:scale-95 shadow-sm border ${
                funded
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-900 border-amber-300'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {funding ? '…' : funded ? '✓ Funded!' : '⚡ Fund Wallet'}
            </button>
          )}

          {/* Disconnect */}
          <button
            type="button"
            onClick={disconnect}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all shadow-sm"
          >
            {demoMode ? 'Exit Demo' : 'Disconnect'}
          </button>
        </div>

        {fundError && (
          <p className="text-right text-xs font-medium text-red-600">{fundError}</p>
        )}
      </div>
    )
  }

  // ── Not connected ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={connect}
          disabled={connecting}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm"
        >
          {connecting ? 'Connecting…' : 'Connect MetaMask'}
        </button>

        {/* Demo — always available as a walletless alternative */}
        <button
          type="button"
          onClick={connectDemo}
          disabled={connecting}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm"
        >
          {connecting ? '…' : '⚡ Try Demo'}
        </button>
      </div>
      {error && (
        <p className="max-w-xs text-right text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  )
}
