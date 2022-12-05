import { ApiPromise, WsProvider } from '@polkadot/api'
import { SubsocialIpfsApi } from '@subsocial/api'
import { SubsocialApi } from '@subsocial/api/subsocial'
import config from 'src/config'

const { offchainUrl, substrateUrl, ipfsNodeUrl, dagHttpMethod, useOffchainForIpfs } = config

let subsocial!: SubsocialApi
let isLoadingSubsocial = false

export const newSubsocialApi = (substrateApi: ApiPromise): SubsocialApi => {
  const useServer = useOffchainForIpfs
    ? {
        httpRequestMethod: dagHttpMethod as any,
      }
    : undefined

  const subsocial: SubsocialApi = new SubsocialApi({
    substrateApi,
    ipfsNodeUrl,
    offchainUrl,
    useServer,
  })

  return subsocial
}
let api: ApiPromise

export const getSubstrateApi = (endpoint: string) => {
  if (!api && !isLoadingSubsocial) {
    isLoadingSubsocial = true
    const provider = new WsProvider(endpoint)
    api = new ApiPromise({ provider })
    isLoadingSubsocial = false
  }

  return api
}

export const getSubsocialApi = () => {
  if (!subsocial && !isLoadingSubsocial) {
    const api = getSubstrateApi(substrateUrl)
    subsocial = newSubsocialApi(api)
  }

  return subsocial
}

let ipfs: SubsocialIpfsApi

export const getIpfs = () => {
  if (ipfs) return ipfs

  const useServer = useOffchainForIpfs
    ? {
        httpRequestMethod: dagHttpMethod as any,
      }
    : undefined

  return new SubsocialIpfsApi({
    useServer,
    ipfsNodeUrl,
    offchainUrl,
  })
}
