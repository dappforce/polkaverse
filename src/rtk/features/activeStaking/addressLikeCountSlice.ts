import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { getAddressLikeCountToPosts } from 'src/components/utils/datahub/active-staking'
import config from 'src/config'
import { RootState } from 'src/rtk/app/rootReducer'
import { createSimpleManyFetchWrapper } from 'src/rtk/app/wrappers'

export type AddressLikeCount = {
  address: string
  postId: string
  count: number
}

const sliceName = 'addressLikeCount'

export function getAddressLikeCountId({
  address,
  postId,
}: Pick<AddressLikeCount, 'address' | 'postId'>) {
  return `${address}-${postId}`
}
const adapter = createEntityAdapter<AddressLikeCount>({
  selectId: data => getAddressLikeCountId(data),
})
const selectors = adapter.getSelectors<RootState>(state => state.addressLikeCount)

export const selectAddressLikeCount = selectors.selectById
export const selectAllAddressLikeCounts = selectors.selectEntities

function getAllPostIdsFromStore(state: RootState) {
  return state.posts.ids as string[]
}
export const fetchAddressLikeCounts = createSimpleManyFetchWrapper<
  { postIds: string[] | null; address: string },
  AddressLikeCount
>({
  sliceName,
  fetchData: async function ({ postIds, address }, state) {
    if (!config.enableDatahub) return []
    if (postIds === null) {
      postIds = getAllPostIdsFromStore(state)
    }
    return await getAddressLikeCountToPosts(address, postIds)
  },
  getCachedData: (state, id) => selectAddressLikeCount(state, id),
  saveToCacheAction: data => slice.actions.setAddressLikeCounts(data),
  shouldFetchCondition: ({ address, postIds }) => postIds?.length !== 0 && !!address,
  filterNewArgs: ({ address, postIds }, isNewId) => {
    // if postIds is null, fetch all postIds
    if (postIds === null) return { address, postIds }
    const newPostIds = postIds?.filter(postId =>
      isNewId(getAddressLikeCountId({ address, postId })),
    )
    return { address, postIds: newPostIds }
  },
})

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    setAddressLikeCount: adapter.upsertOne,
    setAddressLikeCounts: adapter.upsertMany,
  },
})

export const { setAddressLikeCount } = slice.actions

export default slice.reducer
