import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { AsyncThunkPayloadCreator, createAsyncThunk, Dictionary, EntityId } from '@reduxjs/toolkit'
import { isDef } from '@subsocial/utils'
import sortKeysRecursive from 'sort-keys-recursive'
import { getApolloClient } from 'src/graphql/client'
import { DataSourceTypes } from 'src/types'
import {
  CommonFetchPropsWithPrefetch,
  createSelectUnknownIds,
  ThunkApiConfig,
  validateDataSource,
} from './helpers'
import { RootState } from './rootReducer'

type GetFirstArgumentOfAnyFunction<T> = T extends (
  first: infer FirstArgument,
  ...args: any[]
) => any
  ? FirstArgument
  : never
export type FetchDataWorkers<ReturnType> = {
  [DataSourceTypes.SQUID]?: (
    params: any,
    client: ApolloClient<NormalizedCacheObject>,
  ) => Promise<ReturnType>
  [DataSourceTypes.CHAIN]?: (params: any) => Promise<ReturnType>
}
export const createFetchDataFn =
  <Return>(defaultReturn: Return) =>
  <Workers extends FetchDataWorkers<Awaited<Return>>>(workers: Workers) => {
    return (
      dataSource: DataSourceTypes,
      params: { [key in DataSourceTypes]: GetFirstArgumentOfAnyFunction<Workers[key]> },
    ) => {
      const client = getApolloClient()
      if (!client) dataSource = DataSourceTypes.CHAIN

      const param = params[dataSource]
      let returnValue = Promise.resolve(defaultReturn)
      if (dataSource === DataSourceTypes.SQUID) {
        const workerFn = workers[DataSourceTypes.SQUID]
        if (workerFn) returnValue = workerFn(param, client!)
      } else {
        const workerFn = workers[DataSourceTypes.CHAIN]
        if (workerFn) returnValue = workerFn(param)
      }
      return returnValue
    }
  }

interface AdditionalArgs {
  dataSource: DataSourceTypes
  runAdditionalCheckForUnknownIds: boolean
  newIds: EntityId[]
}
export interface CommonFetchDataParams<Return, Args> {
  generateIdFromArgs?: (id: EntityId, args: Args) => EntityId
  selectEntityIds: (state: RootState) => EntityId[]
  withAdditionalUnknownIdValidation?: {
    selectEntities: (state: RootState) => Dictionary<Return>
    unknownFlagAttr: keyof Return
  }
  getData: AsyncThunkPayloadCreator<
    Return[],
    Omit<Args, 'dataSource'> & AdditionalArgs,
    ThunkApiConfig
  >
  handleAfterDataFetch?: (
    data: Return[],
    ...params: Parameters<
      AsyncThunkPayloadCreator<Return[], Omit<Args, 'dataSource'> & AdditionalArgs, ThunkApiConfig>
    >
  ) => Promise<Return[] | void>
}
/**
 * This function is a wrapper to create a thunk for many data, with built in prefetch capability and
 * flags squid data as `isOverview` which makes the id is flagged as unknown if the new fetch calls dataSource is `chain`
 * @param generateIdFromArgs Optional. This is for a case if the data saved in rtk is not from ids only (custom), for example, it's built from `ids` and `myAddress` in args
 * @param selectEntityId Required. This is for selecting unknown ids
 * @param withAdditionalUnknownIdValidation Optional. Send this if you need to check the `unknownFlagAttr` value from the entity when getting unknown ids.
 * With this, if the value of attr `unknownFlagAttr` in the entity is truthy when you call fetch with DataSourceTypes.CHAIN,
 * it will be flagged as unknown id, and will be fetched again with CHAIN as the data source.
 * @param getData Required. This is a function that returns the data that wants to be returned from the thunk. This won't be called if `prefetchedData` is available in args
 * @param handleAfterDataFetch Required. This is a function that processes the fetch data before it returned to rtk to be set into store. Receives additional first param (data) which is the return value of getData or prefetchedData if available in args. If the return is not void, then it will be used as the return value of the overall thunk.
 * @returns Data to be set to the store.
 */
export function createFetchManyDataWrapper<
  ReturnType,
  Args extends CommonFetchPropsWithPrefetch<ReturnType>,
>({
  generateIdFromArgs = id => id,
  withAdditionalUnknownIdValidation,
  selectEntityIds,
  getData,
  handleAfterDataFetch,
}: CommonFetchDataParams<ReturnType, Args>): AsyncThunkPayloadCreator<
  ReturnType[],
  Args,
  ThunkApiConfig
> {
  return async (args, thunkApi) => {
    let { ids, reload, dataSource: _dataSource, prefetchedData } = args
    const { getState } = thunkApi

    const dataSource = validateDataSource(_dataSource)
    const runAdditionalCheckForUnknownIds = dataSource === DataSourceTypes.CHAIN

    const additionalValidation = withAdditionalUnknownIdValidation
      ? {
          selectEntities: withAdditionalUnknownIdValidation.selectEntities,
          isFlaggedUnknownChecker: (content: ReturnType) =>
            !!content?.[withAdditionalUnknownIdValidation.unknownFlagAttr],
        }
      : undefined
    const selectUnknownIds = createSelectUnknownIds(selectEntityIds, additionalValidation)

    let newIds = ids as string[]
    if (!reload) {
      newIds = selectUnknownIds(
        getState(),
        ids.map(id => generateIdFromArgs(id, args)),
        runAdditionalCheckForUnknownIds,
      )
    }
    if (!newIds.length) {
      return []
    }

    const newArgs = { ...args, newIds, dataSource, runAdditionalCheckForUnknownIds }
    let data: ReturnType[] = []
    let needToFetchIds: string[] = []

    if (dataSource === DataSourceTypes.SQUID && prefetchedData) {
      newIds.forEach(id => {
        let content = prefetchedData?.[id]
        if (!content) {
          needToFetchIds.push(id)
          return
        }
        if (withAdditionalUnknownIdValidation) {
          content = { ...content, [withAdditionalUnknownIdValidation.unknownFlagAttr]: true }
        }
        data.push(content)
      })
    } else {
      needToFetchIds = newIds
    }

    if (needToFetchIds.length > 0) {
      try {
        const res = await getData({ ...newArgs, newIds: needToFetchIds }, thunkApi)
        if (Array.isArray(res)) {
          data.push(...res)
        }
      } catch (e) {
        console.error(e)
      }
    }
    const definedData = data.filter(isDef)

    if (handleAfterDataFetch) {
      const afterDataRes = await handleAfterDataFetch(definedData, newArgs, thunkApi)
      if (afterDataRes) return afterDataRes
    }
    return definedData
  }
}

export function generatePrefetchDataFn<CurrentData, OriginalData extends CurrentData>(
  allData: CurrentData[],
) {
  return <PrefetchDataType>(
    getId: (data: OriginalData) => string | undefined | null,
    getPrefetchedData: (data: OriginalData) => PrefetchDataType | undefined | null,
  ) => {
    const allPrefetchedData: { [id: string]: PrefetchDataType } = {}
    allData.forEach(data => {
      const castedData = data as OriginalData
      try {
        const id = getId(castedData)
        const prefetchedData = getPrefetchedData(castedData)
        if (id && prefetchedData) {
          allPrefetchedData[id] = prefetchedData
        }
      } catch {}
    })
    return allPrefetchedData
  }
}

export function createSimpleFetchWrapper<Args, ReturnValue>({
  sliceName,
  getCachedData,
  fetchData,
  saveToCacheAction,
}: {
  sliceName: string
  getCachedData: (state: RootState, args: Args) => ReturnValue | undefined
  saveToCacheAction: (data: ReturnValue) => any
  fetchData: (args: Args) => Promise<ReturnValue>
}) {
  const currentlyFetchingMap = new Map<string, Promise<ReturnValue>>()
  return createAsyncThunk<ReturnValue, Args & { reload?: boolean }, ThunkApiConfig>(
    `${sliceName}/fetchOne`,
    async (allArgs, { getState, dispatch }): Promise<ReturnValue> => {
      const { reload, ...args } = allArgs
      const id = JSON.stringify(sortKeysRecursive(args))
      if (!reload) {
        const fetchedData = getCachedData(getState(), allArgs)
        if (fetchedData) return fetchedData
      }
      const alreadyFetchedPromise = currentlyFetchingMap.get(id)
      if (alreadyFetchedPromise) return alreadyFetchedPromise

      const promise = fetchData(allArgs)
      currentlyFetchingMap.set(id, promise)
      const res = await promise

      currentlyFetchingMap.delete(id)
      await dispatch(saveToCacheAction(res))

      return promise
    },
  )
}
