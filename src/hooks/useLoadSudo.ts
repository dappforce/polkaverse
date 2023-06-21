// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { newLogger } from '@subsocial/utils'
import { useEffect, useState } from 'react'
import { AccountId } from 'src/types'
import useSubstrate from '../components/substrate/useSubstrate'

const log = newLogger('useLoadSudo')

/** Load the sudo key from Substrate blockchain. */
export function useLoadSudo() {
  const [sudo, setSudo] = useState<AccountId>()
  const { api, isApiReady } = useSubstrate()

  useEffect(() => {
    let isMounted = true

    if (!isApiReady) return

    const load = async () => {
      const sudo = await api.query.sudo.key()
      isMounted && setSudo(sudo.toHuman() as string)
    }

    load().catch(err => log.error('Failed to load the sudo key:', err))

    return () => {
      isMounted = false
    }
  }, [isApiReady])

  return sudo
}
