import { ApiPromise } from '@polkadot/api'
import { AsyncThunk, Dictionary, Dispatch, EntityId } from '@reduxjs/toolkit'
import { SubsocialApi } from '@subsocial/api'
import { asString, getFirstOrUndefined, isEmptyArray, nonEmptyStr } from '@subsocial/utils'
import { useDispatch } from 'react-redux'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import config from 'src/config'
import {
  AccountId,
  CommonContent,
  DataSourceTypes,
  EntityData,
  FlatSuperCommon,
  HasId,
} from 'src/types'
import { RootState } from './rootReducer'
import { AppDispatch, AppThunk } from './store'

export type ThunkApiConfig = {
  state: RootState
  dispatch: AppDispatch
}

type StructEntity = HasId & Partial<FlatSuperCommon>

type ContentEntity = HasId & CommonContent

export type CommonVisibility = 'onlyPublic' | 'onlyUnlisted'
export type HasHiddenVisibility = CommonVisibility | 'onlyVisible' | 'onlyHidden'

export type ApiArg = {
  api: SubsocialApi
  substrateApi?: ApiPromise
  dataSource?: DataSourceTypes
}

export type CommonFetchProps = ApiArg & {
  reload?: boolean
  eagerLoadHandles?: boolean
}

type CommonFetchPropsAndId = CommonFetchProps & {
  id: EntityId
}

export type CommonFetchPropsAndIds = CommonFetchProps & {
  ids: EntityId[]
}

export type CommonFetchPropsWithPrefetch<T> = CommonFetchPropsAndIds & {
  prefetchedData?: { [key: string]: T }
}

export type SelectOneArgs<T> = T & {
  id: EntityId
  dataSource?: DataSourceTypes
  reload?: boolean
}

export type SelectManyArgs<T> = T & {
  ids: EntityId[]
  dataSource?: DataSourceTypes
}

export type FetchOneArgs<T> = T & CommonFetchPropsAndId

export type FetchManyArgs<T> = T & CommonFetchPropsAndIds
export type FetchManyArgsWithPrefetch<T, V> = T & CommonFetchPropsWithPrefetch<V>

export function createSelectUnknownIds<Entity>(
  selectIds: (state: RootState) => EntityId[],
  additionalValidation?: {
    selectEntities: (state: RootState) => Dictionary<Entity>
    isFlaggedUnknownChecker: (entity: Entity) => boolean
  },
) {
  return (state: RootState, ids: EntityId[], runValidation?: boolean): string[] => {
    if (!ids || isEmptyArray(ids)) return []

    const knownStrIds = selectIds(state).map(asString)
    let entities: Dictionary<Entity> = {}
    if (additionalValidation && runValidation) {
      entities = additionalValidation.selectEntities(state)
    }
    const knownIds = new Set(knownStrIds)
    const newIds: string[] = []

    ids.forEach(id => {
      const strId = asString(id)
      const entity = entities[id]
      let isFlaggedUnknown = false
      if (entity && runValidation) {
        isFlaggedUnknown = !!(
          additionalValidation && additionalValidation.isFlaggedUnknownChecker(entity)
        )
      }
      if (!knownIds.has(strId) || isFlaggedUnknown) {
        knownIds.add(strId)
        newIds.push(strId)
      }
    })

    return newIds
  }
}

const idSeparator = '-'
export const prependIdWithAddress = (id: EntityId, myAddress: AccountId) =>
  (id as string).startsWith(myAddress) ? (id as string) : myAddress + idSeparator + id

export const prependIdsWithAddress = (ids: EntityId[], myAddress: AccountId) => {
  return ids.map(id => prependIdWithAddress(id, myAddress))
}

export const decodePrependedIdWithAddress = (encoded: string) => {
  const [address, id] = encoded.split(idSeparator)
  return { address, id }
}

function toParamsAndIds({ id, ...params }: CommonFetchPropsAndId): CommonFetchPropsAndIds {
  return { ...params, ids: [id] }
}

export function validateDataSource(dataSource: DataSourceTypes | undefined) {
  if (!dataSource || !config.enableSquidDataSource) {
    dataSource = DataSourceTypes.CHAIN
  }
  return dataSource
}

type FetchManyFn<Returned> = AsyncThunk<Returned[], CommonFetchPropsAndIds, {}>

export function createFetchOne<R>(fetchMany: FetchManyFn<R>) {
  return (arg: CommonFetchPropsAndId): AppThunk =>
    async dispatch => {
      await dispatch(fetchMany(toParamsAndIds(arg)))
    }
}

// export function createFetchMany<
//   S extends StructEntity,
//   C extends ContentEntity
// > (
//   fetchManyStructs: FetchManyFn<S>,
//   fetchManyContents: FetchManyFn<C>,
// ) {
//   return (arg: ApiAndIds): AppThunk => async dispatch => {
//     await dispatch(fetchManyStructs(arg))
//     await dispatch(fetchManyContents(arg))
//   }
// }

export type SelectByIdFn<R> = (state: RootState, id: EntityId) => R | undefined

export function selectManyByIds<S extends StructEntity, C extends ContentEntity>(
  state: RootState,
  ids: EntityId[],
  selectStructById: SelectByIdFn<S>,
  selectContentById: SelectByIdFn<C>,
): EntityData<S, C>[] {
  const result: EntityData<S, C>[] = []

  ids.forEach(id => {
    const struct = selectStructById(state, id)
    if (struct) {
      const item: EntityData<S, C> = {
        id: struct.id,
        struct,
      }

      if (nonEmptyStr(struct.contentId)) {
        const { contentId } = struct
        item.content = selectContentById(state, contentId)
      }

      result.push(item)
    }
  })

  return result
}

export function selectOneById<S extends StructEntity, C extends ContentEntity>(
  state: RootState,
  id: EntityId,
  selectStructById: SelectByIdFn<S>,
  selectContentById: SelectByIdFn<C>,
): EntityData<S, C> | undefined {
  const items = selectManyByIds(state, [id], selectStructById, selectContentById)
  return getFirstOrUndefined(items)
}

type CommonDispatchCallbackProps<T> = {
  dispatch: Dispatch<any>
  api: SubsocialApi
  args: T
}

type CommonDispatchCallbackFn<T> = (props: CommonDispatchCallbackProps<T>) => void

// ? Change cb on actions[]. And use actions.forEach(action => dispatch(action))
export const useActions = <T = undefined>(cb: CommonDispatchCallbackFn<T>) => {
  const dispatch = useDispatch()
  const { subsocial: api } = useSubsocialApi()

  return (args: T) => cb({ dispatch, api, args })
}
