// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { ApiPromise } from '@polkadot/api'
import { Keyring } from '@polkadot/ui-keyring'
import { newLogger } from '@subsocial/utils'
import { useEffect } from 'react'
import { useSubstrate } from './useSubstrate'

const log = newLogger('SubstrateWebConsole')

type WindowSubstrate = {
  api?: ApiPromise
  keyring?: Keyring
  util?: any
  crypto?: any
}

const getWindowSubstrate = (): WindowSubstrate => {
  let substrate = (window as any)?.substrate
  if (!substrate) {
    substrate = {} as WindowSubstrate
    ;(window as any).substrate = substrate
  }
  return substrate
}

/** This component will simply add Substrate utility functions to your web developer console. */
export function SubstrateWebConsole() {
  const { endpoint, api, apiState } = useSubstrate()

  const addApi = () => {
    if (window && apiState === 'READY') {
      getWindowSubstrate().api = api
      log.info('Exported window.substrate.api')
    }
  }

  const addUtilAndCrypto = () => {
    if (window) {
      const substrate = getWindowSubstrate()

      substrate.util = require('@polkadot/util')
      log.info('Exported window.substrate.util')

      substrate.crypto = require('@polkadot/util-crypto')
      log.info('Exported window.substrate.crypto')
    }
  }

  useEffect(() => {
    addApi()
  }, [endpoint?.toString(), apiState])

  useEffect(() => {
    addUtilAndCrypto()
  }, [true])

  return null
}

export default SubstrateWebConsole
