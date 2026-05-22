# TicketChain

Event ticketing dApp on **Base Sepolia** — ERC-721 ticket NFTs with gas paid via [Universal Gas Framework](https://universalgasframework.com) (Mock TYI USD, no ETH for gas).

## Features

- MetaMask connection (Base Sepolia)
- Create events on-chain
- Browse and buy tickets
- **Buy / create / verify** transactions use `@tychilabs/react-ugf` — users pay **Mock USD only** for gas
- My Tickets (owned NFTs)
- Verify / scan tickets at the door

## Smart contract

`contracts/TicketChain.sol` — ERC-721 enumerable with:

- `createEvent(name, description, venue, eventDate, ticketPrice, maxTickets)`
- `buyTicket(eventId)` — payable; mints ticket NFT
- `verifyTicket(tokenId)` — validates and marks ticket scanned

## Quick start

### 1. Install

```bash
npm install
```

### 2. Compile contract

```bash
npm run compile
```

### 3. Deploy to Base Sepolia (UGF — Mock USD gas)

Create `.env` and set `PRIVATE_KEY` for your MetaMask wallet. **No Base Sepolia ETH required** — deployment uses UGF (`npm run deploy` pays gas in **Mock TYI USD**).

1. Get Mock TYI USD: [UGF Faucets](https://universalgasframework.com/faucets)
2. Add `PRIVATE_KEY` to `.env` (never commit this file)
3. Deploy:

```bash
npm run deploy
```

This writes `src/contracts/TicketChain.json` with `address` and `abi`.

ETH-only deploy (legacy): `npm run deploy:eth`

### 4. Run frontend

```bash
npm run dev
```

### 5. Testnet assets

- Add Base Sepolia in MetaMask (chain ID `84532`)
- Get **Mock TYI USD** for UGF gas: [UGF Faucets](https://universalgasframework.com/faucets)
- Ticket price (if not free) is paid in ETH on-chain via the buy transaction `value`

## Project structure

```
contracts/          Solidity TicketChain
scripts/deploy.cjs  Deploy + export ABI
src/
  components/       Layout, ConnectWallet, EventCard
  context/          WalletContext (MetaMask)
  hooks/            useUGFTransaction
  pages/            Home, Browse, Create, My Tickets, Verify
  contracts/        TicketChain.json (ABI + address)
  utils/            constants, contract helpers
```

## Tech stack

- React (Vite), TailwindCSS, React Router
- ethers.js v6
- @tychilabs/react-ugf (testnet mode)
- Hardhat + OpenZeppelin ERC-721

## Networks

| Network       | Chain ID |
|---------------|----------|
| Base Sepolia  | 84532    |
