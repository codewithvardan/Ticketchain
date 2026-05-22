import { useWallet } from '../context/WalletContext'
import { shortenAddress } from '../utils/format'

export default function ConnectWallet() {
  const {
    address,
    connecting,
    error,
    hasMetaMask,
    isConnected,
    isCorrectChain,
    connect,
    disconnect,
  } = useWallet()

  if (!hasMetaMask) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noreferrer"
        className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black active:scale-95 transition-all shadow-sm"
      >
        Install MetaMask
      </a>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        {!isCorrectChain && (
          <span className="text-xs font-semibold text-amber-600">Wrong network</span>
        )}
        <span className="rounded-lg border border-slate-250 bg-slate-100 px-3 py-2 font-mono text-sm font-medium text-slate-700">
          {shortenAddress(address)}
        </span>
        <button
          type="button"
          onClick={disconnect}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all shadow-sm"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={connect}
        disabled={connecting}
        className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-sm"
      >
        {connecting ? 'Connecting…' : 'Connect MetaMask'}
      </button>
      {error && <p className="max-w-xs text-right text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}
