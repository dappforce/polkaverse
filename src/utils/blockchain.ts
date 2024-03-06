import { getSubsocialApi } from 'src/components/utils/SubsocialConnect'

export async function waitNewBlock() {
  const subsocialApi = getSubsocialApi()
  const substrateApi = await subsocialApi.substrateApi
  const currentBlock = await substrateApi.rpc.chain.getBlock()
  return new Promise<void>(resolve => {
    const unsubscribe = substrateApi.rpc.chain.subscribeNewHeads(result => {
      if (result.number > currentBlock.block.header.number) {
        unsubscribe.then(unsub => unsub())
        resolve()
      }
    })
  })
}
