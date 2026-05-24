# TicketChain

**Decentralized Event Ticketing on Base Sepolia**

A blockchain-based event ticketing platform that eliminates fake tickets and makes Web3 accessible by using Universal Gas Framework (UGF) - allowing users to pay gas fees with Mock USD instead of ETH.

![TicketChain Demo](https://img.shields.io/badge/Status-In%20Development-yellow)
![Base Sepolia](https://img.shields.io/badge/Network-Base%20Sepolia-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Problem Statement

Traditional blockchain ticketing has two major barriers:
1. **Fake tickets** - Paper tickets can be forged
2. **Gas fee complexity** - Users need ETH just to buy tickets, creating friction

TicketChain solves both by:
- Issuing tickets as **ERC-721 NFTs** (unforgeable, blockchain-verified)
- Using **Universal Gas Framework** so users pay gas with Mock USD, not ETH

---

# Features

- *Browse Events** - View all available events with ticket availability
- * Create Events** - Event organizers can create events and set ticket prices
- * Buy Tickets** - Purchase tickets as NFTs using Mock USD (no ETH needed for gas)
- * Verify Tickets** - Anyone can verify ticket authenticity on-chain
- * My Tickets** - View all your owned ticket NFTs in one place
- * MetaMask Integration** - Secure wallet connection

---

## Tech Stack

### Frontend
- **React** (Vite)
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **ethers.js** - Blockchain interactions

### Blockchain
- **Solidity** - Smart contract
- **Base Sepolia** - Testnet (Chain ID: 84532)
- **ERC-721** - NFT standard for tickets
- **Universal Gas Framework (UGF)** - Gas abstraction layer

### Development Tools
- **Hardhat** - Smart contract deployment
- **MetaMask** - Wallet provider
- **Git/GitHub** - Version control

---

## 📋 Smart Contract

The `TicketChain.sol` contract handles:
-  Event creation with custom pricing and supply
-  Ticket minting as ERC-721 NFTs
-  Ticket verification and ownership tracking
-  Transfer functionality

**Contract Features:**
```solidity
- createEvent(name, date, venue, price, totalSupply)
- buyTicket(eventId) → mints NFT to buyer
- getEvent(eventId) → returns event details
- verifyTicket(ticketId) → checks validity
- getMyTickets(owner) → returns user's tickets
```

---

## UGF Integration (Key Innovation)

**Universal Gas Framework** allows users to pay transaction fees with Mock USD instead of ETH.

**Traditional Web3:**
- User needs ETH in wallet for gas
- High barrier to entry for newcomers

**With UGF:**
- User pays with Mock USD (stablecoin)
- UGF handles gas fees automatically
- **No ETH required!** 

This makes blockchain ticketing accessible to anyone, even without crypto knowledge.

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/codewithvardan/Ticketchain.git
cd Ticketchain
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up MetaMask**
- Add Base Sepolia network (Chain ID: 84532)
- RPC URL: `https://sepolia.base.org`

4. **Get test tokens**
- Get Mock USD from [UGF Faucet](https://universalgasframework.com/faucets)

5. **Run the app**
```bash
npm run dev
```

6. **Open browser**
- Navigate to `http://localhost:5173`

--
##  Future Enhancements

- [ ] QR code generation for tickets
- [ ] Ticket resale marketplace with royalties
- [ ] Email notifications for purchases
- [ ] Event analytics dashboard for organizers
- [ ] Support for multiple blockchains
- [ ] Mobile app (React Native)
- [ ] IPFS integration for event metadata

---

## Hackathon Submission

**Built for:** [ HackwithMumbai 3.0] - UGF Track

**Category:** Decentralized Applications (dApps)

**Key Innovation:** Gas abstraction using Universal Gas Framework - making blockchain ticketing accessible without requiring users to own ETH.

---

## Resources

- [UGF Documentation](https://universalgasframework.com/docs)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
- [UGF Faucet](https://universalgasframework.com/faucets)
- [Hardhat Documentation](https://hardhat.org/docs)

---

##  License

This project is licensed under the MIT License.

---

##  Author

**Vardan Sunil Darunte**
- GitHub: [@codewithvardan](https://github.com/codewithvardan)

---

## Acknowledgments

- Universal Gas Framework team for making Web3 accessible
- Base team for the Sepolia testnet
- OpenZeppelin for secure smart contract libraries

---

** If you like this project, please give it a star on GitHub!**
