const hre = require('hardhat')
const fs = require('fs')
const path = require('path')

async function main() {
  const signers = await hre.ethers.getSigners()
  if (signers.length === 0) {
    throw new Error(
      'No deployer account. Set PRIVATE_KEY in .env (wallet needs Base Sepolia ETH).',
    )
  }

  const TicketChain = await hre.ethers.getContractFactory('TicketChain')
  const contract = await TicketChain.deploy()
  await contract.waitForDeployment()
  const address = await contract.getAddress()

  console.log('TicketChain deployed to:', address)

  const artifactPath = path.join(
    __dirname,
    '../artifacts/contracts/TicketChain.sol/TicketChain.json',
  )
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'))

  const outDir = path.join(__dirname, '../src/contracts')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, 'TicketChain.json'),
    JSON.stringify({ address, abi: artifact.abi }, null, 2),
  )
  console.log('Wrote src/contracts/TicketChain.json')

  const envPath = path.join(__dirname, '../.env')
  if (fs.existsSync(envPath)) {
    let env = fs.readFileSync(envPath, 'utf8')
    if (/^VITE_TICKET_CONTRACT_ADDRESS=.*/m.test(env)) {
      env = env.replace(
        /^VITE_TICKET_CONTRACT_ADDRESS=.*/m,
        `VITE_TICKET_CONTRACT_ADDRESS=${address}`,
      )
    } else {
      env += `\nVITE_TICKET_CONTRACT_ADDRESS=${address}\n`
    }
    fs.writeFileSync(envPath, env)
    console.log('Updated .env VITE_TICKET_CONTRACT_ADDRESS')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
