import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BrowserProvider } from 'ethers'
import {
  BASE_SEPOLIA_CHAIN_ID,
  BASE_SEPOLIA_NETWORK,
} from '../utils/constants'

const WalletContext = createContext(null)

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
  const [address, setAddress] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

  const provider = useMemo(() => {
    if (!window.ethereum) return null
    return new BrowserProvider(window.ethereum)
  }, [])

  const isCorrectChain = chainId === BASE_SEPOLIA_CHAIN_ID
  const hasMetaMask = typeof window !== 'undefined' && Boolean(window.ethereum)

  const refresh = useCallback(async () => {
    if (!provider) return
    try {
      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))
      const accounts = await provider.send('eth_accounts', [])
      setAddress(accounts[0] ?? null)
      setError(null)
    } catch (e) {
      setError(e.message || 'Failed to read wallet')
    }
  }, [provider])

  useEffect(() => {
    refresh()
    if (!window.ethereum) return undefined

    const onAccounts = (accounts) => setAddress(accounts[0] ?? null)
    const onChain = (hexId) => setChainId(parseInt(hexId, 16))

    window.ethereum.on('accountsChanged', onAccounts)
    window.ethereum.on('chainChanged', onChain)
    return () => {
      window.ethereum.removeListener('accountsChanged', onAccounts)
      window.ethereum.removeListener('chainChanged', onChain)
    }
  }, [refresh])

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed')
      return
    }
    setConnecting(true)
    setError(null)
    try {
      const browserProvider = new BrowserProvider(window.ethereum)
      await browserProvider.send('eth_requestAccounts', [])
      await ensureBaseSepolia(browserProvider)
      const accounts = await browserProvider.send('eth_accounts', [])
      const network = await browserProvider.getNetwork()
      setAddress(accounts[0] ?? null)
      setChainId(Number(network.chainId))
    } catch (e) {
      setError(e.shortMessage || e.message || 'Connection failed')
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setError(null)
  }, [])

  const getSigner = useCallback(async () => {
    if (!provider || !address) return null
    if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
      await ensureBaseSepolia(provider)
      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))
    }
    return provider.getSigner()
  }, [provider, address, chainId])

  const value = {
    address,
    chainId,
    connecting,
    error,
    hasMetaMask,
    isCorrectChain,
    isConnected: Boolean(address),
    connect,
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
