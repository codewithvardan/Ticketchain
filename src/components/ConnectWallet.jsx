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
        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white"
      >
        Install MetaMask
      </a>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        {!isCorrectChain && (
          <span className="text-xs text-amber-400">Wrong network</span>
        )}
        <span className="rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-slate-200">
          {shortenAddress(address)}
        </span>
        <button
          type="button"
          onClick={disconnect}
          className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
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
        className="rounded-lg bg-base-blue px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {connecting ? 'Connecting…' : 'Connect MetaMask'}
      </button>
      {error && <p className="max-w-xs text-right text-xs text-red-400">{error}</p>}
    </div>
  )
}
