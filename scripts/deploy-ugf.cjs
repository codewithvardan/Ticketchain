/**
 * Deploy TicketChain via UGF testnet — gas paid in Mock TYI USD, not ETH.
 * Requires: PRIVATE_KEY in .env + Mock TYI USD balance (https://universalgasframework.com/faucets)
 */
const fs = require('fs')
const path = require('path')
const { Wallet, JsonRpcProvider, ContractFactory } = require('ethers')
const { UGFClient } = require('@tychilabs/ugf-testnet-js')

require('dotenv').config()

const RPC = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
const EXPECTED_DEPLOYER = '0x5CB24035C2C5a9Ccf62C50ca304B8e2a30a277F6'

function updateEnv(contractAddress) {
  const envPath = path.join(__dirname, '../.env')
  let env = fs.readFileSync(envPath, 'utf8')
  if (/^VITE_TICKET_CONTRACT_ADDRESS=.*/m.test(env)) {
    env = env.replace(
      /^VITE_TICKET_CONTRACT_ADDRESS=.*/m,
      `VITE_TICKET_CONTRACT_ADDRESS=${contractAddress}`,
    )
  } else {
    env += `\nVITE_TICKET_CONTRACT_ADDRESS=${contractAddress}\n`
  }
  fs.writeFileSync(envPath, env.trim() + '\n')
}

function writeArtifact(address, abi) {
  const outDir = path.join(__dirname, '../src/contracts')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, 'TicketChain.json'),
    JSON.stringify({ address, abi }, null, 2),
  )
}

async function main() {
  const privateKey = process.env.PRIVATE_KEY?.trim()
  if (!privateKey) {
    throw new Error(
      `Set PRIVATE_KEY in .env for ${EXPECTED_DEPLOYER}\n` +
        'Used only to sign UGF auth + Mock USD payment — no ETH required.\n' +
        'Get Mock TYI USD: https://universalgasframework.com/faucets',
    )
  }

  const artifactPath = path.join(
    __dirname,
    '../artifacts/contracts/TicketChain.sol/TicketChain.json',
  )
  if (!fs.existsSync(artifactPath)) {
    throw new Error('Run `npm run compile` first')
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))
  const provider = new JsonRpcProvider(RPC)
  const wallet = new Wallet(privateKey, provider)
  const address = await wallet.getAddress()

  console.log('Deployer:', address)
  if (address.toLowerCase() !== EXPECTED_DEPLOYER.toLowerCase()) {
    console.warn(`Warning: expected ${EXPECTED_DEPLOYER}`)
  }

  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet)
  const deployTx = await factory.getDeployTransaction()

  const txObject = {
    from: address,
    data: deployTx.data,
    value: (deployTx.value ?? 0n).toString(),
  }
  if (deployTx.to) txObject.to = deployTx.to

  console.log('[ugf] Authenticating...')
  const client = new UGFClient()
  await client.auth.login(wallet)

  console.log('[ugf] Getting quote (Mock TYI USD)...')
  const quote = await client.quote.get({
    payer_address: address,
    tx_object: JSON.stringify(txObject),
  })
  console.log('[ugf] Payment amount:', quote.payment_amount, 'TYI_MOCK_USD')

  console.log('[ugf] Settling payment (sign in wallet if prompted)...')
  await client.payment.x402.execute({ quote, signer: wallet })

  console.log('[ugf] Deploying contract (UGF sponsors ETH)...')
  const { userTxHash } = await client.chains.evm.sponsorAndExecute(
    quote.digest,
    wallet,
    async () => ({
      data: deployTx.data,
      value: deployTx.value ?? 0n,
    }),
  )

  console.log('[ugf] Waiting for confirmation:', userTxHash)
  const receipt = await provider.waitForTransaction(userTxHash)
  const contractAddress = receipt?.contractAddress

  if (!contractAddress) {
    throw new Error('Deployment tx confirmed but no contract address in receipt')
  }

  writeArtifact(contractAddress, artifact.abi)
  updateEnv(contractAddress)

  console.log('\nSuccess! TicketChain deployed:', contractAddress)
  console.log('Updated src/contracts/TicketChain.json and .env')
  console.log('Explorer:', `https://sepolia.basescan.org/address/${contractAddress}`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
