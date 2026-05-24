import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserProvider, JsonRpcProvider, Wallet } from 'ethers'
import { BASE_SEPOLIA_CHAIN_ID, BASE_SEPOLIA_NETWORK } from '../utils/constants'

const WalletContext = createContext(null)

// ── Hardhat account #0 — publicly known, safe for local dev only ─────────────
const HARDHAT_LOCAL_RPC  = 'http://127.0.0.1:8545'
const HARDHAT_CHAIN_ID   = 31337
const DEMO_PRIVATE_KEY   =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
const LOCAL_CHAIN_IDS    = [1337, 31337]

async function ensureBaseSepolia(provider) {
  const network = await provider.getNetwork()
  if (Number(network.chainId) === BASE_SEPOLIA_CHAIN_ID) return
  try {
    await provider.send('wallet_switchEthereumChain', [
      { chainId: BASE_SEPOLIA_NETWORK.chainId },
    ])
  } catch (err) {
    const needsAdd =
      err?.code === 4902 ||
      String(err?.message || '').includes('4902') ||
      String(err?.message || '').includes('Unrecognized chain')
    if (needsAdd) {
      await provider.send('wallet_addEthereumChain', [BASE_SEPOLIA_NETWORK])
    } else {
      throw err
    }
  }
}

export function WalletProvider({ children }) {
  const [address,   setAddress]   = useState(null)
  const [chainId,   setChainId]   = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error,     setError]     = useState(null)
  const [demoMode,  setDemoMode]  = useState(false)

  // The demo wallet is stored in a ref so it isn't recreated on every render
  const demoWalletRef = useRef(null)

  const mmProvider = useMemo(() => {
    if (typeof window === 'undefined' || !window.ethereum) return null
    return new BrowserProvider(window.ethereum)
  }, [])

  const isCorrectChain =
    chainId === BASE_SEPOLIA_CHAIN_ID || LOCAL_CHAIN_IDS.includes(chainId)
  const hasMetaMask =
    typeof window !== 'undefined' && Boolean(window.ethereum)

  // ── MetaMask refresh ────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!mmProvider || demoMode) return
    try {
      const network = await mmProvider.getNetwork()
      setChainId(Number(network.chainId))
      const accounts = await mmProvider.send('eth_accounts', [])
      setAddress(accounts[0] ?? null)
      setError(null)
    } catch (e) {
      setError(e.message || 'Failed to read wallet')
    }
  }, [mmProvider, demoMode])

  useEffect(() => {
    refresh()
    if (!window.ethereum) return undefined
    const onAccounts = (accs)  => setAddress(accs[0] ?? null)
    const onChain    = (hexId) => setChainId(parseInt(hexId, 16))
    window.ethereum.on('accountsChanged', onAccounts)
    window.ethereum.on('chainChanged',    onChain)
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccounts)
      window.ethereum.removeListener('chainChanged',    onChain)
    }
  }, [refresh])

  // ── MetaMask connect ────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!window.ethereum) { setError('MetaMask is not installed'); return }
    setConnecting(true)
    setError(null)
    try {
      const bp = new BrowserProvider(window.ethereum)
      await bp.send('eth_requestAccounts', [])
      const network     = await bp.getNetwork()
      const currentChain = Number(network.chainId)
      if (!LOCAL_CHAIN_IDS.includes(currentChain)) {
        await ensureBaseSepolia(bp)
      }
      const accounts     = await bp.send('eth_accounts', [])
      const finalNetwork = await bp.getNetwork()
      setDemoMode(false)
      demoWalletRef.current = null
      setAddress(accounts[0] ?? null)
      setChainId(Number(finalNetwork.chainId))
    } catch (e) {
      setError(e.shortMessage || e.message || 'Connection failed')
    } finally {
      setConnecting(false)
    }
  }, [])

  // ── Demo wallet connect (no MetaMask) ───────────────────────────────────────
  const connectDemo = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      const localProvider   = new JsonRpcProvider(HARDHAT_LOCAL_RPC)
      const wallet          = new Wallet(DEMO_PRIVATE_KEY, localProvider)
      demoWalletRef.current = wallet

      // Auto-fund the demo wallet with 100 ETH so buyTicket works instantly
      try {
        await fetch(HARDHAT_LOCAL_RPC, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method:  'hardhat_setBalance',
            params:  [wallet.address, '0x56BC75E2D63100000'], // 100 ETH
            id:      1,
          }),
        })
      } catch (_) {
        // Non-fatal — wallet may already have ETH from the pre-funded Hardhat account
      }

      setDemoMode(true)
      setAddress(wallet.address)
      setChainId(HARDHAT_CHAIN_ID)
    } catch (e) {
      setError(e.message || 'Failed to connect demo wallet')
      setDemoMode(false)
    } finally {
      setConnecting(false)
    }
  }, [])

  // ── Disconnect ──────────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    setAddress(null)
    setError(null)
    setDemoMode(false)
    demoWalletRef.current = null
    setChainId(null)
  }, [])

  // ── getSigner: demo wallet or MetaMask signer ───────────────────────────────
  const getSigner = useCallback(async () => {
    if (demoMode && demoWalletRef.current) return demoWalletRef.current

    if (!mmProvider || !address) return null
    const isLocal = LOCAL_CHAIN_IDS.includes(chainId)
    if (!isLocal && chainId !== BASE_SEPOLIA_CHAIN_ID) {
      await ensureBaseSepolia(mmProvider)
      const network = await mmProvider.getNetwork()
      setChainId(Number(network.chainId))
    }
    return mmProvider.getSigner()
  }, [mmProvider, address, chainId, demoMode])

  const value = {
    address,
    chainId,
    connecting,
    error,
    hasMetaMask,
    isCorrectChain,
    isConnected: Boolean(address),
    demoMode,
    connect,
    connectDemo,
    disconnect,
    getSigner,
    refresh,
  }

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
