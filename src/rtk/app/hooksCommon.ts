// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { AsyncThunkAction } from '@reduxjs/toolkit'
import { isEmptyArray, newLogger } from '@subsocial/utils'
import { useState } from 'react'
import { shallowEqual } from 'react-redux'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import {
  ApiArg,
  FetchManyArgs,
  FetchOneArgs,
  SelectManyArgs,
  SelectOneArgs,
  ThunkApiConfig,
} from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'

type CommonResult = {
  loading?: boolean
  error?: Error
}

export type FetchCommonResult<T> = T & CommonResult

type FetchOneResult<Entity> = FetchCommonResult<{
  entity?: Entity
}>

export type FetchManyResult<Entity> = FetchCommonResult<{
  entities: Entity[]
}>

type SelectFn<Args, Entity> = (state: RootState, args: Args) => Entity

export type SelectManyFn<Args, Entity> = SelectFn<SelectManyArgs<Args>, Entity[]>
export type SelectOneFn<Args, Entity> = (state: RootState, args: SelectOneArgs<Args>) => Entity

type FetchFn<Args, Struct> = (args: Args) => AsyncThunkAction<Struct, Args, ThunkApiConfig>

export type FetchManyFn<Args, Struct> = FetchFn<FetchManyArgs<Args>, Struct[]>
export type FetchOneFn<Args, Struct> = FetchFn<FetchOneArgs<Args>, Struct>

const log = newLogger('useFetchEntities')

export function useFetch<Args, Struct>(
  fetch: FetchFn<Args, Struct>,
  args: Omit<Args, 'api'> | Partial<ApiArg>,
): CommonResult {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  const dispatch = useAppDispatch()

  useSubsocialEffect(
    ({ subsocial }) => {
      let isMounted = true
      setError(undefined)

      dispatch(fetch({ ...args, api: subsocial } as unknown as Args))
        .catch(err => {
          if (isMounted) {
            setError(err)
            log.error(error)
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false)
          }
        })

      return () => {
        isMounted = false
      }
    },
    [dispatch, args],
  )

  return {
    loading,
    error,
  }
}

export function useFetchEntities<Args, Struct, Entity>(
  select: SelectManyFn<Args, Entity>,
  fetch: FetchManyFn<Args, Struct>,
  args: SelectManyArgs<Args>,
): FetchManyResult<Entity> {
  const hasNoIds = isEmptyArray(args.ids)
  const entities = useAppSelector(state => (hasNoIds ? [] : select(state, args)), shallowEqual)

  const { loading, error } = useFetch(fetch as any, args)

  return {
    loading,
    error,
    entities,
  }
}

export function useFetchOneEntity<Args, Struct, Entity>(
  select: SelectOneFn<Args, Entity>,
  fetch: FetchOneFn<Args, Struct>,
  args: SelectOneArgs<Args>,
): FetchOneResult<Entity> {
  const entity = useAppSelector(state => select(state, args), shallowEqual)

  const { loading, error } = useFetch(fetch as any, args)

  return {
    loading,
    error,
    entity,
  }
}

type UseSelectFn<Entity> = (id: string) => Entity

export function useFetchEntity<Args, Struct, Entity>(
  useSelect: UseSelectFn<Entity>,
  fetch: FetchManyFn<Args, Struct>,
  args: SelectOneArgs<Args>,
): FetchOneResult<Entity> {
  const { id, ..._rest } = args
  const rest = _rest as unknown as Args
  const selectManyArgs = { ids: [id], ...rest } as any
  const entity = useSelect(id.toString())
  const { ...props } = useFetch(fetch, selectManyArgs)

  return {
    ...props,
    entity,
  }
}
