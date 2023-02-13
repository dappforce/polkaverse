import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { SubsocialApi } from '@subsocial/api'
import { FindSpacesQuery } from '@subsocial/api/filters'
import { getFirstOrUndefined } from '@subsocial/utils'
import { getSpacesData } from 'src/graphql/apis'
import { SpaceFragmentMapped } from 'src/graphql/apis/types'
import {
  createFetchOne,
  FetchManyArgsWithPrefetch,
  HasHiddenVisibility,
  SelectManyArgs,
  selectManyByIds,
  SelectOneArgs,
  ThunkApiConfig,
} from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import {
  createFetchDataFn,
  createFetchManyDataWrapper,
  generatePrefetchDataFn,
} from 'src/rtk/app/wrappers'
import {
  AnyAccountId,
  AnySpaceId,
  DataSourceTypes,
  getUniqueContentIds,
  getUniqueOwnerIds,
  idsToBns,
  ProfileSpaceIdByAccount,
  SpaceStruct,
  SpaceWithSomeDetails,
} from 'src/types'
import { Content, fetchContents, selectSpaceContentById } from '../contents/contentsSlice'
import { fetchProfileSpaces } from '../profiles/profilesSlice'

export interface SpaceState extends SpaceStruct {
  isOverview?: boolean
}
const spacesAdapter = createEntityAdapter<SpaceState>()

const spacesSelectors = spacesAdapter.getSelectors<RootState>(state => state.spaces)

// Rename the exports for readability in component usage
export const {
  selectById: selectSpaceStructById,
  selectIds: selectSpaceIds,
  selectEntities: selectSpaceEntities,
  selectAll: selectAllSpaces,
  selectTotal: selectTotalSpaces,
} = spacesSelectors

export type SpaceVisibility = HasHiddenVisibility

type Args = {
  visibility?: SpaceVisibility
  withContent?: boolean
  withOwner?: boolean
}

export type SelectSpaceArgs = SelectOneArgs<Args>
export type SelectSpacesArgs = SelectManyArgs<Args>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// type FetchSpaceArgs = FetchOneArgs<Args>
type FetchSpacesArgs = FetchManyArgsWithPrefetch<Args, SpaceStruct>

const _selectSpacesByIds = (state: RootState, ids: EntityId[]) =>
  selectManyByIds(state, ids, selectSpaceStructById, selectSpaceContentById)

export function selectSpaces(state: RootState, props: SelectSpacesArgs): SpaceWithSomeDetails[] {
  const { ids } = props
  const spaces = _selectSpacesByIds(state, ids)

  return spaces
}

export function selectSpace(
  state: RootState,
  props: SelectSpaceArgs,
): SpaceWithSomeDetails | undefined {
  return getFirstOrUndefined(selectSpaces(state, { ids: [props.id] }))
}

const getSpacesCountDataFromChain = async (api: SubsocialApi, spaces: SpaceStruct[]) => {
  const spacesPromise = spaces.map(async space => {
    const postCount = await api.blockchain.postsCountBySpaceId(space.id as unknown as AnySpaceId)
    space.postsCount = postCount.toNumber()
  })
  await Promise.all(spacesPromise)
}

type DomainsProps = {
  params: SpaceState[]
  api: SubsocialApi
}

type DomainBySpaceIdTuple = [AnyAccountId, AnySpaceId]

const getSpaceHandles = async (api: SubsocialApi, params: SpaceState[]) => {
  const tuples = params.map(({ ownerId, id }) => [ownerId, id] as DomainBySpaceIdTuple)
  const domains = await api.blockchain.getDomainNames(tuples)
  return domains
}

export const fetchSpaceHandles = createAsyncThunk<void, DomainsProps, ThunkApiConfig>(
  'fetchSpaceHandles/fetchMany',
  async ({ params, api }, { dispatch }) => {
    const domains = await getSpaceHandles(api, params)

    const newData: { spaceId: string; handle: string }[] = []

    domains.forEach((handle, i) => {
      if (handle) {
        newData.push({ handle, spaceId: params[i].id })
      }
    })

    if (newData.length > 0) {
      dispatch(
        updateManySpaces(
          newData.map(({ spaceId, handle }) => ({
            id: spaceId,
            changes: {
              handle,
            },
          })),
        ),
      )
    }
  },
)

const getSpaces = createFetchDataFn<SpaceState[]>([])({
  chain: async ({
    api,
    fetchCount,
    ...params
  }: { api: SubsocialApi; fetchCount?: boolean } & FindSpacesQuery) => {
    const structs = await api.findSpaceStructs(params.ids)
    const entities = structs.map<SpaceState>(space => ({ ...space, isOverview: false }))
    if (fetchCount) {
      await getSpacesCountDataFromChain(api, entities)
    }
    return entities
  },
  squid: async ({ ids }: { ids: string[] }, client) => {
    const spaces = await getSpacesData(client, { where: { id_in: ids } })
    return spaces.map<SpaceState>(space => ({ ...space, isOverview: true }))
  },
})
export const fetchSpaces = createAsyncThunk<SpaceStruct[], FetchSpacesArgs, ThunkApiConfig>(
  'spaces/fetchMany',
  createFetchManyDataWrapper({
    withAdditionalUnknownIdValidation: {
      selectEntities: selectSpaceEntities,
      unknownFlagAttr: 'isOverview',
    },
    selectEntityIds: selectSpaceIds,
    handleAfterDataFetch: async (
      entities,
      { api, withContent = true, withOwner = true, dataSource, eagerLoadHandles },
      { dispatch },
    ) => {
      const fetches: Promise<any>[] = []
      const generatePrefetchData = generatePrefetchDataFn<SpaceState, SpaceFragmentMapped>(entities)

      if (withOwner) {
        const ids = getUniqueOwnerIds(entities)
        const prefetchedData = generatePrefetchData<ProfileSpaceIdByAccount>(
          data => data.ownerId,
          data => data.ownedByAccount,
        )
        if (ids.length) {
          fetches.push(dispatch(fetchProfileSpaces({ api, ids, dataSource, prefetchedData })))
        }
      }

      if (withContent) {
        const ids = getUniqueContentIds(entities)
        const prefetchedData = generatePrefetchData<Content>(
          data => data.contentId,
          data =>
            data.ipfsContent && {
              id: data.contentId ?? '',
              ...data.ipfsContent,
            },
        )
        if (ids.length) {
          fetches.push(dispatch(fetchContents({ api, ids, prefetchedData, dataSource })))
        }
      }

      await Promise.all(fetches)

      // Lazy loading of space handles
      if (!eagerLoadHandles) {
        dispatch(fetchSpaceHandles({ params: entities, api }))
      }
    },
    getData: async ({ api, dataSource, newIds: _newIds, eagerLoadHandles }) => {
      const newIds = _newIds as string[]
      const entities = await getSpaces(dataSource, {
        chain: { api, ids: idsToBns(newIds) },
        squid: { ids: newIds },
      })
      if (dataSource === DataSourceTypes.CHAIN) {
        await getSpacesCountDataFromChain(api, entities)
      }
      if (eagerLoadHandles) {
        const domains = await getSpaceHandles(api, entities)
        domains.forEach((handle, i) => {
          if (handle) {
            entities[i].handle = handle
          }
        })
      }
      return entities
    },
  }),
)

export const fetchSpace = createFetchOne(fetchSpaces)

const spaces = createSlice({
  name: 'spaces',
  initialState: spacesAdapter.getInitialState(),
  reducers: {
    updateSpace: spacesAdapter.updateOne,
    updateManySpaces: spacesAdapter.updateMany,
  },
  extraReducers: builder => {
    builder.addCase(fetchSpaces.fulfilled, spacesAdapter.upsertMany)
    // builder.addCase(fetchSpaces.rejected, (state, action) => {
    //   state.error = action.error
    // })
  },
})
export const { updateManySpaces } = spaces.actions

export default spaces.reducer
