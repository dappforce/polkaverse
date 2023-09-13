import config from 'src/config'
import { SubsocialSubstrateRpc } from '.'

const { substrateRpcUrl } = config

let subsocialRpc: SubsocialSubstrateRpc | undefined = undefined

export const getOrInitSubsocialRpc = () => {
  if (!subsocialRpc) {
    subsocialRpc = new SubsocialSubstrateRpc({ rpcUrl: substrateRpcUrl })
  }

  return subsocialRpc
}
