import { useCallback, useState } from 'react'
import { useUGFModal } from '@tychilabs/react-ugf'
import { UGF_DEST_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID } from '../utils/constants'
import { getTicketContract } from '../utils/contract'
import { useWallet } from '../context/WalletContext'

/**
 * Executes a contract method.
 *
 * On Base Sepolia (84532): routes through the UGF modal so gas is paid
 * in Mock TYI USD — no ETH needed.
 *
 * On any other network (e.g. local Hardhat at 31337): sends the
 * transaction directly via the user's signer so you can still test
 * locally without needing the UGF service.
 */
export function useUGFTransaction() {
  const { openUGF, result } = useUGFModal()
  const { getSigner, isConnected, chainId } = useWallet()
  const [localResult, setLocalResult] = useState(null)

  const executeContract = useCallback(
    async (method, args = [], value = 0n) => {
      if (!isConnected) throw new Error('Connect wallet or use ⚡ Demo mode first')
      const signer = await getSigner()
      if (!signer) throw new Error('Unable to get signer')

      const contract = getTicketContract(signer)

      // ── On Base Sepolia: use UGF (gas paid in Mock USD) ──────────────
      if (String(chainId) === String(BASE_SEPOLIA_CHAIN_ID)) {
        const data = contract.interface.encodeFunctionData(method, args)
        const to = await contract.getAddress()
        openUGF({
          signer,
          tx: { to, data, value },
          destChainId: UGF_DEST_CHAIN_ID,
        })
        return
      }

      // ── On local / other networks: send tx directly ──────────────────
      const tx = await contract[method](...args, { value })
      const receipt = await tx.wait()
      setLocalResult({ txHash: receipt.hash })
    },
    [getSigner, isConnected, openUGF, chainId],
  )

  // Merge UGF result and local direct result so callers can use either
  return { executeContract, ugfResult: result ?? localResult }
}
