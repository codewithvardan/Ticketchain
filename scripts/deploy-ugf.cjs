/**
 * Deploy TicketChain via UGF testnet — gas paid in Mock TYI USD, not ETH.
 * Requires: PRIVATE_KEY in .env + Mock TYI USD balance (https://universalgasframework.com/faucets)
 */
const fs = require('fs')
const path = require('path')
const { Wallet, JsonRpcProvider, ContractFactory } = require('ethers')
const { UGFClient, TYI_USD_PAYMENT_COIN } = require('@tychilabs/ugf-testnet-js')
const { Contract } = require('ethers')

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

  const registry = await client.registry.get()
  const tyiOption = registry.payment_options.find((o) => o.token === TYI_USD_PAYMENT_COIN)
  const tyiChain = tyiOption?.chains.find((c) => c.chain_id === '84532')
  if (tyiChain?.address) {
    const tyi = new Contract(
      tyiChain.address,
      ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
      provider,
    )
    const [rawBal, decimals] = await Promise.all([tyi.balanceOf(address), tyi.decimals()])
    const humanBal = Number(rawBal) / 10 ** Number(decimals)
    console.log(`[ugf] ${TYI_USD_PAYMENT_COIN} balance:`, humanBal.toFixed(2))
  }

  console.log('[ugf] Getting quote (Mock TYI USD)...')
  const quote = await client.quote.get({
    payer_address: address,
    tx_object: JSON.stringify(txObject),
  })
  const paymentAmount = Number(quote.payment_amount)
  console.log('[ugf] Payment amount:', paymentAmount, TYI_USD_PAYMENT_COIN)

  console.log('[ugf] Settling payment...')
  try {
    await client.payment.x402.execute({ quote, signer: wallet })
  } catch (err) {
    if (err.statusCode === 400 || err.code === 'HTTP_ERROR') {
      throw new Error(
        `${err.message}\n\n` +
          `Likely cause: insufficient ${TYI_USD_PAYMENT_COIN} on ${address}.\n` +
          `Claim Mock USD: https://universalgasframework.com/faucets\n` +
          `Need at least ~${paymentAmount} ${TYI_USD_PAYMENT_COIN}, then run: npm run deploy`,
      )
    }
    throw err
  }

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
  console.error('\nDeploy failed:', err.message || err)
  process.exit(1)
})
