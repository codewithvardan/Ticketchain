import ticketDeployment from '../contracts/TicketChain.json'

/** Base Sepolia testnet (Chain ID: 84532) */
export const BASE_SEPOLIA_CHAIN_ID = 84532
export const BASE_SEPOLIA_CHAIN_ID_HEX = '0x14a34'
export const BASE_SEPOLIA_CHAIN_ID_STRING = '84532'

export const BASE_SEPOLIA_RPC_URL = 'https://sepolia.base.org'
export const BASE_SEPOLIA_EXPLORER_URL = 'https://sepolia.basescan.org'

export const BASE_SEPOLIA_NETWORK = {
  chainId: BASE_SEPOLIA_CHAIN_ID_HEX,
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [BASE_SEPOLIA_RPC_URL],
  blockExplorerUrls: [BASE_SEPOLIA_EXPLORER_URL],
}

/** UGF testnet: users pay Mock TYI USD for gas on Base Sepolia */
export const UGF_MODE = 'testnet'
export const UGF_DEST_CHAIN_ID = BASE_SEPOLIA_CHAIN_ID_STRING

/** From deploy script or VITE_TICKET_CONTRACT_ADDRESS */
export const TICKET_CONTRACT_ADDRESS =
  import.meta.env.VITE_TICKET_CONTRACT_ADDRESS || ticketDeployment.address || ''
