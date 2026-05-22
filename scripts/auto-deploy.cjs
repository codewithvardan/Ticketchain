const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { Wallet, JsonRpcProvider, ContractFactory, formatEther, parseEther } = require('ethers')

require('dotenv').config()

const RPC = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
const MIN_BALANCE = parseEther('0.0003')
const POLL_MS = 5000
const TIMEOUT_MS = 300000

function updateEnv(privateKey, contractAddress) {
  const envPath = path.join(__dirname, '../.env')
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : ''

  if (privateKey) {
    if (/^PRIVATE_KEY=.*/m.test(env)) {
      env = env.replace(/^PRIVATE_KEY=.*/m, `PRIVATE_KEY=${privateKey}`)
    } else {
      env = `PRIVATE_KEY=${privateKey}\n` + env
    }
  }

  if (!/BASE_SEPOLIA_RPC_URL=/m.test(env)) {
    env += `BASE_SEPOLIA_RPC_URL=${RPC}\n`
  }

  if (contractAddress) {
    if (/^VITE_TICKET_CONTRACT_ADDRESS=.*/m.test(env)) {
      env = env.replace(
        /^VITE_TICKET_CONTRACT_ADDRESS=.*/m,
        `VITE_TICKET_CONTRACT_ADDRESS=${contractAddress}`,
      )
    } else {
      env += `VITE_TICKET_CONTRACT_ADDRESS=${contractAddress}\n`
    }
  }

  fs.writeFileSync(envPath, env.trim() + '\n')
}

function openFaucets(address) {
  try {
    execSync(
      `powershell -NoProfile -Command "Set-Clipboard -Value '${address}'"`,
      { stdio: 'ignore' },
    )
    console.log('[clipboard] Deployer address copied')
  } catch {
    /* ignore */
  }

  const urls = [
    'https://www.alchemy.com/faucets/base-sepolia',
    'https://faucet.quicknode.com/base/sepolia',
    'https://portal.cdp.coinbase.com/products/faucet',
  ]

  for (const url of urls) {
    try {
      execSync(`start "" "${url}"`, { stdio: 'ignore', shell: true })
    } catch {
      /* ignore */
    }
  }
  console.log('[browser] Opened Base Sepolia faucets — paste address & claim once')
}

async function waitForFunds(provider, address) {
  const start = Date.now()
  while (Date.now() - start < TIMEOUT_MS) {
    const bal = await provider.getBalance(address)
    process.stdout.write(`\r[balance] ${formatEther(bal)} ETH — waiting for faucet...`)
    if (bal >= MIN_BALANCE) {
      console.log('\n[funded] Ready to deploy')
      return bal
    }
    await new Promise((r) => setTimeout(r, POLL_MS))
  }
  console.log('\n[timeout] No funds received in 5 minutes')
  return null
}

async function deployContract(wallet) {
  const artifactPath = path.join(
    __dirname,
    '../artifacts/contracts/TicketChain.sol/TicketChain.json',
  )
  if (!fs.existsSync(artifactPath)) {
    throw new Error('Run `npm run compile` first')
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet)
  const contract = await factory.deploy()
  await contract.waitForDeployment()
  const address = await contract.getAddress()

  const outDir = path.join(__dirname, '../src/contracts')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, 'TicketChain.json'),
    JSON.stringify({ address, abi: artifact.abi }, null, 2),
  )

  updateEnv(null, address)
  return address
}

async function main() {
  let privateKey = process.env.PRIVATE_KEY?.trim()
  let address

  if (!privateKey) {
    const wallet = Wallet.createRandom()
    privateKey = wallet.privateKey
    address = wallet.address
    updateEnv(privateKey, null)
    console.log('[wallet] Created deployer:', address)
    openFaucets(address)
  } else {
    address = new Wallet(privateKey).address
    console.log('[wallet] Using .env deployer:', address)
  }

  const provider = new JsonRpcProvider(RPC)
  const wallet = new Wallet(privateKey, provider)
  let bal = await provider.getBalance(address)

  if (bal < MIN_BALANCE) {
    openFaucets(address)
    bal = await waitForFunds(provider, address)
    if (!bal) {
      console.log('\nFund this address, then run: npm run deploy')
      console.log(address)
      process.exit(1)
    }
  }

  console.log('[deploy] Sending deployment transaction...')
  const deployed = await deployContract(wallet)
  console.log('\n[success] TicketChain deployed:', deployed)
  console.log('[success] Updated src/contracts/TicketChain.json and .env')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
