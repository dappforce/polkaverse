// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { ApiPromise } from '@polkadot/api'
import { isFunction } from '@polkadot/util'
import { SubsocialApi, SubsocialIpfsApi, SubsocialSubstrateApi } from '@subsocial/api'
import { DependencyList, useEffect, useMemo } from 'react'
import { SubsocialConsts, useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { useSubstrate } from '../substrate'

type Apis = {
  subsocial: SubsocialApi
  substrate: SubsocialSubstrateApi
  ipfs: SubsocialIpfsApi
  consts: SubsocialConsts
  api: ApiPromise
}

type EffectCallbackResult = void | (() => void | undefined)
type EffectCallback = (apis: Apis) => EffectCallbackResult

/** Effect callback will be called only if API is ready. */
export default function useSubsocialEffect(
  effect: EffectCallback,
  deps: DependencyList = [],
): void {
  const _deps = useMemo(() => JSON.stringify(deps), deps)
  const apis = useSubsocialApi()
  const { api } = useSubstrate()
  const isReady = apis.isApiReady && api

  // console.log('useSubsocialEffect: deps:', _deps)

  useEffect(() => {
    if (isReady && isFunction(effect)) {
      // At this point all APIs should be initialized and ready to use.
      // That's why we can treat them as defined here and cast to their types.
      return effect({
        subsocial: apis.subsocial as SubsocialApi,
        substrate: apis.substrate as SubsocialSubstrateApi,
        ipfs: apis.ipfs as SubsocialIpfsApi,
        consts: apis.consts,
        api,
      })
    }
  }, [isReady, _deps])
}
