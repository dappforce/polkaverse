// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { AccountId } from '@polkadot/types/interfaces'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { FetchManyResult } from 'src/rtk/app/hooksCommon'
import { AnyId, SubstrateId } from 'src/types'

type FetchSubstrateProps = {
  pallet: string
  method: string
  id: AnyId
}

export const useGetSubstrateIdsById = <T extends SubstrateId | AccountId = SubstrateId>({
  method,
  pallet,
  id,
}: FetchSubstrateProps): FetchManyResult<T> => {
  const [entities, setEntities] = useState<T[]>([])
  const [loading, setLoading] = useState(false)

  useSubsocialEffect(
    ({ substrate }) => {
      let isMounted = true

      const load = async () => {
        setLoading(true)
        const readyApi = await substrate.api

        const ids = await readyApi.query[pallet][method](id)

        if (isMounted) {
          setEntities(ids as unknown as T[])
          setLoading(false)
        }
      }
      load()

      return () => {
        isMounted = false
      }
    },
    [id?.toString()],
  )

  return {
    loading,
    entities,
  }
}
