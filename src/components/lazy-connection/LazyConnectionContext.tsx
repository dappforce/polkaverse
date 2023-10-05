import { ApiPromise, WsProvider } from '@polkadot/api'
import React, { createContext, useContext, useEffect, useState } from 'react'
import config from 'src/config'
import { NodeNames } from 'src/config/types'
import { useChainInfo } from 'src/rtk/features/chainsInfo/chainsInfoHooks'
import { controlledMessage, showErrorMessage } from '../utils/Message'

type LazyConnectionsContextType = {
  getApiByNetwork: (network: string) => Promise<ApiPromise | undefined>
}

const contextStub: LazyConnectionsContextType = {
  getApiByNetwork: {} as any,
}

export const LazyConnectionsContext = createContext<LazyConnectionsContextType>(contextStub)

type Connections = Record<NodeNames, ApiPromise>

const connections: Record<string, ApiPromise> = {} as Connections

const waitMessage = controlledMessage({
  message: 'Waiting for connection',
  type: 'info',
  duration: 0,
})

export const LazyConnectionsProvider = React.memo((props: React.PropsWithChildren<{}>) => {
  const chainsInfo = useChainInfo()
  const nodeByNetwork: Record<string, string> = {
    ...config.nodes,
  }

  const getApiByNetwork = async (network: string) => {
    if (!nodeByNetwork) {
      showErrorMessage(`Network ${network} not found in config`)
      return
    } else {
      let api = connections[network]
      if (api) return api

      waitMessage.open(`Connecting to ${network || 'the network'}...`)
      const node =
        nodeByNetwork[network] || chainsInfo[network]?.wsNode || chainsInfo[network]?.node

      const provider = new WsProvider(node)
      api = new ApiPromise({ provider } as any)
      connections[network] = await api.isReady
      waitMessage.close()

      return api
    }
  }

  const value: LazyConnectionsContextType = {
    getApiByNetwork,
  }

  return (
    <LazyConnectionsContext.Provider value={value}>
      {props.children}
    </LazyConnectionsContext.Provider>
  )
})

export function useLazyConnectionsContext() {
  return useContext(LazyConnectionsContext)
}

export function useLazyConnection(network: NodeNames) {
  const { getApiByNetwork } = useLazyConnectionsContext()
  const [api, setApi] = useState<ApiPromise | undefined>()

  useEffect(() => {
    getApiByNetwork(network).then(setApi)
  }, [])

  return api
}
