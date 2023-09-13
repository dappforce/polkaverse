import { useCallback } from 'react'
import { useSubsocialApi } from 'src/components/substrate'

export default function useWaitNewBlock() {
  const { subsocial } = useSubsocialApi()
  const waitNewBlock = useCallback(async () => {
    const substrateApi = await subsocial.substrateApi
    const currentBlock = await substrateApi.rpc.chain.getBlock()
    return new Promise<void>(resolve => {
      const unsubscribe = substrateApi.rpc.chain.subscribeNewHeads(result => {
        if (result.number > currentBlock.block.header.number) {
          unsubscribe.then(unsub => unsub())
          resolve()
        }
      })
    })
  }, [])

  return waitNewBlock
}
