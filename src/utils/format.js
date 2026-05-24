import { formatEther } from 'ethers'

export function formatEth(wei) {
  // Safely coerce any incoming value (BigInt, Result object, string, number, null/undefined)
  let value
  try {
    // BigInt() works on BigInt, string, and number; handles Result objects too
    value = BigInt(String(wei ?? '0'))
  } catch {
    value = 0n
  }
  const n = formatEther(value)
  const parsed = Number(n)
  if (parsed === 0) return 'Free'
  return `$${parsed.toFixed(2)} Mock USD`
}

export function formatDate(unixSeconds) {
  // Guard against BigInt or unexpected types
  const ms = Number(unixSeconds) * 1000
  if (!ms || isNaN(ms)) return '—'
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function shortenAddress(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
