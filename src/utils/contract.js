import { Contract, JsonRpcProvider } from 'ethers'
import ticketArtifact from '../contracts/TicketChain.json'
import { BASE_SEPOLIA_RPC_URL, TICKET_CONTRACT_ADDRESS } from './constants'

export function isContractConfigured() {
  return Boolean(TICKET_CONTRACT_ADDRESS)
}

export function getTicketContract(runner) {
  if (!TICKET_CONTRACT_ADDRESS) {
    throw new Error(
      'TicketChain contract address not set. Deploy with `npm run deploy` and set VITE_TICKET_CONTRACT_ADDRESS.',
    )
  }
  return new Contract(TICKET_CONTRACT_ADDRESS, ticketArtifact.abi, runner)
}

export function getReadOnlyContract() {
  return getTicketContract(new JsonRpcProvider(BASE_SEPOLIA_RPC_URL))
}

export function parseEvent(eventId, raw) {
  return {
    id: Number(eventId),
    name: raw.name,
    description: raw.description,
    venue: raw.venue,
    eventDate: Number(raw.eventDate),
    ticketPrice: raw.ticketPrice,
    maxTickets: Number(raw.maxTickets),
    ticketsSold: Number(raw.ticketsSold),
    organizer: raw.organizer,
    active: raw.active,
    remaining: Number(raw.maxTickets) - Number(raw.ticketsSold),
  }
}

export async function fetchAllEvents(contract) {
  const count = await contract.eventCount()
  const total = Number(count)
  const events = []
  for (let i = 0; i < total; i++) {
    const raw = await contract.getEvent(i)
    events.push(parseEvent(i, raw))
  }
  return events.reverse()
}

export function explorerAddressUrl(address) {
  return `${import.meta.env.VITE_EXPLORER_URL || 'https://sepolia.basescan.org'}/address/${address}`
}

export function explorerTxUrl(hash) {
  return `${import.meta.env.VITE_EXPLORER_URL || 'https://sepolia.basescan.org'}/tx/${hash}`
}
