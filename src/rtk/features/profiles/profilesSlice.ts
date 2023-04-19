import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { SubsocialApi } from '@subsocial/api'
import { toSubsocialAddress } from '@subsocial/utils'
import { getProfilesData } from 'src/graphql/apis'
import { ProfileFragmentMapped } from 'src/graphql/apis/types'
import {
  CommonVisibility,
  createFetchOne,
  FetchManyArgsWithPrefetch,
  SelectManyArgs,
  SelectOneArgs,
  ThunkApiConfig,
} from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import {
  createFetchDataFn,
  createFetchManyDataWrapper,
  generatePrefetchDataFn,
} from 'src/rtk/app/wrappers'
import { ProfileSpaceIdByAccount, SpaceStruct } from 'src/types'
import { fetchSpaces } from '../spaces/spacesSlice'

const profileSpacesAdapter = createEntityAdapter<ProfileSpaceIdByAccount>()

const profileSpacesSelectors = profileSpacesAdapter.getSelectors<RootState>(
  state => state.profileSpaces,
)

export const {
  selectById: selectProfileSpaceStructById,
  selectIds: selectProfileSpaceIds,
  selectEntities: selectProfileSpaceEntities,
  selectAll: selectAllProfileSpaces,
  selectTotal: selectTotalProfileSpaces,
} = profileSpacesSelectors

export type ProfileVisibility = CommonVisibility

type Args = {}

export type SelectProfileArgs = SelectOneArgs<Args>
export type SelectProfilesArgs = SelectManyArgs<Args>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// type FetchProfileArgs = FetchOneArgs<Args>
type FetchProfilesArgs = FetchManyArgsWithPrefetch<Args, ProfileSpaceIdByAccount>

export const selectProfileSpace = (
  state: RootState,
  id: EntityId,
): ProfileSpaceIdByAccount | undefined => {
  const subsocialAddress = toSubsocialAddress(id.toString())

  if (!subsocialAddress) return undefined

  return profileSpacesSelectors.selectById(state, subsocialAddress as EntityId)
}

const getProfiles = createFetchDataFn<ProfileSpaceIdByAccount[]>([])({
  chain: async ({ api, ids }: { api: SubsocialApi; ids: string[] }) => {
    const spaceIds = await api.blockchain.profileSpaceIdsByAccounts(ids)

    const spaceIdsByAccoutsPromise = spaceIds.map(async (spaceId, i) => {
      const accountFollowersCount = await api.blockchain.accountFollowersCountByAccountId(ids[i])
      const accountFollowedCount = await api.blockchain.accountsFollowedCountByAccount(ids[i])

      return {
        id: ids[i],
        spaceId: spaceId.toString(),
        accountFollowersCount: accountFollowersCount.toNumber(),
        accountFollowedCount: accountFollowedCount.toNumber(),
      }
    })
    const spaceIdsByAccouts = await Promise.all(spaceIdsByAccoutsPromise)
    return spaceIdsByAccouts.filter(x => !!x.id)
  },
  squid: async ({ ids }: { ids: string[] }, client) => {
    const profiles = await getProfilesData(client, { ids })
    return profiles
  },
})

export const fetchProfileSpaces = createAsyncThunk<
  ProfileSpaceIdByAccount[],
  FetchProfilesArgs,
  ThunkApiConfig
>(
  'profileSpaces/fetchMany',
  createFetchManyDataWrapper({
    selectEntityIds: selectProfileSpaceIds,
    handleAfterDataFetch: async (entities, { api, dataSource, eagerLoadHandles }, { dispatch }) => {
      const spaceIds: string[] = []
      entities.forEach(({ spaceId }) => {
        if (spaceId) spaceIds.push(spaceId)
      })
      const generatePrefetchData = generatePrefetchDataFn<
        ProfileSpaceIdByAccount,
        ProfileFragmentMapped
      >(entities)
      if (spaceIds.length > 0) {
        const prefetchedData = generatePrefetchData<SpaceStruct>(
          data => data.spaceId,
          data => data.profileSpace,
        )
        await dispatch(
          fetchSpaces({
            ids: spaceIds,
            withOwner: false,
            api,
            reload: false,
            dataSource,
            prefetchedData,
            eagerLoadHandles: eagerLoadHandles,
          }),
        )
      }
    },
    getData: async ({ api, newIds: _newIds, dataSource }) => {
      const newIds = _newIds as string[]
      return getProfiles(dataSource, {
        chain: { api, ids: newIds },
        squid: { ids: newIds },
      })
    },
  }),
)

export const fetchProfileSpace = createFetchOne(fetchProfileSpaces)

const profileSpaces = createSlice({
  name: 'profileSpaces',
  initialState: profileSpacesAdapter.getInitialState(),
  reducers: {
    updateProfile: profileSpacesAdapter.updateOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchProfileSpaces.fulfilled, profileSpacesAdapter.upsertMany)
    // builder.addCase(fetchProfiles.rejected, (state, action) => {
    //   state.error = action.error
    // })
  },
})

export default profileSpaces.reducer
