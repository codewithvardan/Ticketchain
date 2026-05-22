import { useCallback } from 'react'
import { useUGFModal } from '@tychilabs/react-ugf'
import { UGF_DEST_CHAIN_ID } from '../utils/constants'
import { getTicketContract } from '../utils/contract'
import { useWallet } from '../context/WalletContext'

export function useUGFTransaction() {
  const { openUGF, result } = useUGFModal()
  const { getSigner, isConnected } = useWallet()

  const executeContract = useCallback(
    async (method, args = [], value = 0n) => {
      if (!isConnected) throw new Error('Connect MetaMask first')
      const signer = await getSigner()
      if (!signer) throw new Error('Unable to get signer')

      const contract = getTicketContract(signer)
      const data = contract.interface.encodeFunctionData(method, args)
      const to = await contract.getAddress()

      openUGF({
        signer,
        tx: { to, data, value },
        destChainId: UGF_DEST_CHAIN_ID,
      })
    },
    [getSigner, isConnected, openUGF],
  )

  return { executeContract, ugfResult: result }
}
