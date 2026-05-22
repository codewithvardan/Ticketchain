import { formatEther } from 'ethers'

export function formatEth(wei) {
  const n = formatEther(wei ?? 0n)
  const parsed = Number(n)
  if (parsed === 0) return 'Free'
  return `${parsed} ETH`
}

export function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function shortenAddress(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
