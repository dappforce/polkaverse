import { ApiPromise } from '@polkadot/api'
import { Option } from '@polkadot/types'
import { ChainProperties } from '@polkadot/types/interfaces'
import { RegistryTypes } from '@polkadot/types/types'
import { formatBalance } from '@polkadot/util'
import { SubsocialIpfsApi, SubsocialSubstrateApi } from '@subsocial/api'
import { SubsocialApi } from '@subsocial/api/subsocial'
import registry from '@subsocial/api/utils/registry'
import { newLogger } from '@subsocial/utils'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { getSubstrateApi, newSubsocialApi } from 'src/components/utils/SubsocialConnect'
import config from 'src/config'
import { useAppDispatch } from 'src/rtk/app/store'
import { loadMyAddress, loadMyEmailAddress } from 'src/rtk/features/accounts/myAccountSlice'
import { flattenPermissions, SpacePermissions } from 'src/types'
import { controlledMessage } from '../utils/Message'

const { substrateUrl } = config

export type SubsocialConsts = {
  defaultSpacePermissions?: SpacePermissions
}

export type SubsocialApiState = {
  subsocial: SubsocialApi
  substrate: SubsocialSubstrateApi
  consts: SubsocialConsts
  ipfs: SubsocialIpfsApi
}

export const DEFAULT_DECIMALS = [10]
export const DEFAULT_TOKEN = ['SUB']
const DEFAULT_SS58 = registry.createType('u32', 28)

registry.setChainProperties({
  ...registry.getChainProperties(),
  ss58Format: new Option(registry, 'u8', DEFAULT_SS58),
} as ChainProperties)

const log = newLogger('SubstrateContext')

type ApiState = 'CONNECTING' | 'READY' | 'ERROR'

export type State = {
  endpoint: string
  api: ApiPromise
  apiState?: ApiState
  tokenDecimal: number
  tokenSymbol: string
  isApiReady: boolean
} & SubsocialApiState

type ContextValue = State

export const SubstrateContext = React.createContext<ContextValue>(
  undefined as unknown as ContextValue,
)

type SubstrateProviderProps = React.PropsWithChildren<{
  endpoint: string
  types?: RegistryTypes
}>

const message = controlledMessage({
  message: 'Connecting to Subsocial...',
  type: 'info',
  duration: 0,
})

export const SubstrateProvider = (props: SubstrateProviderProps) => {
  // const initState: State = {
  //   ...INIT_STATE,
  //   endpoint: props.endpoint || INIT_STATE.endpoint,
  // }

  const reduxDispatch = useAppDispatch()
  const api = getSubstrateApi(substrateUrl)
  const subsocial = newSubsocialApi(api)
  const { blockchain, ipfs, substrateApi } = subsocial

  const [state, setState] = useState<State>({
    endpoint: substrateUrl,
    api,
    subsocial,
    substrate: blockchain,
    ipfs,
    consts: {},
    isApiReady: false,
    apiState: 'CONNECTING',
    tokenDecimal: DEFAULT_DECIMALS[0],
    tokenSymbol: DEFAULT_TOKEN[0],
  })

  // `useCallback` so that returning memoized function and not created
  //   everytime, and thus re-render.
  const connect = useCallback(async () => {
    log.info(`Connecting to Substrate node ${substrateUrl} ...`)
    message.open()
    const connectTime = window.performance.now()

    const api = await substrateApi

    api.on('error', err => {
      log.error(`❌ Failed to connect to Substrate node ${substrateUrl} . ${err}`)
      setState({
        ...state,
        apiState: 'ERROR',
      })
    })

    const tokenSymbol = api.registry.chainTokens || DEFAULT_TOKEN
    const tokenDecimals = api.registry.chainDecimals || DEFAULT_DECIMALS

    const defaultSpacePermissions = flattenPermissions(
      api.consts.permissions.defaultSpacePermissions,
    )

    const tookTime = window.performance.now() - connectTime
    const tookTimeLog = `Took ${tookTime / 1000} seconds`

    log.info(`✅ Substrate API is ready. ${tookTimeLog}`)

    formatBalance.setDefaults({
      decimals: tokenDecimals,
      unit: tokenSymbol,
    })

    setState({
      ...state,
      consts: {
        defaultSpacePermissions,
      },
      tokenSymbol: tokenSymbol[0],
      tokenDecimal: tokenDecimals[0],
      apiState: 'READY',
      isApiReady: true,
    })

    message.close()

    api.on('disconnected', () => log.info(`Disconnected from Substrate node ${substrateUrl}`))

    return () => api?.disconnect()
  }, [api, reduxDispatch])

  useEffect(() => {
    connect()
    reduxDispatch(loadMyAddress())
    reduxDispatch(loadMyEmailAddress())
  }, [])

  return <SubstrateContext.Provider value={state}>{props.children}</SubstrateContext.Provider>
}

export const useSubsocialApi = () => useContext(SubstrateContext)

export const useIsSubstrateConnected = () => useSubsocialApi().apiState === 'READY'
