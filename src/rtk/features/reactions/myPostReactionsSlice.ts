import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { SubsocialApi } from '@subsocial/api'
import { getFirstOrUndefined, idToBn, isDef, isEmptyArray, isEmptyStr } from '@subsocial/utils'
import BN from 'bn.js'
import { getAddressPostsReaction } from 'src/graphql/apis'
import { apolloClient } from 'src/graphql/client'
import {
  decodePrependedIdWithAddress,
  FetchManyArgsWithPrefetch,
  prependIdWithAddress,
  ThunkApiConfig,
} from 'src/rtk/app/helpers'
import { SelectManyFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { createFetchDataFn, createFetchManyDataWrapper } from 'src/rtk/app/wrappers'
import { AccountId, PostId, ReactionId, ReactionStruct, ReactionType } from 'src/types'

const sliceName = 'reactions'

const idSeparator = '-'

type Args = {
  myAddress?: AccountId
}

const adapter = createEntityAdapter<ReactionStruct>()

const selectors = adapter.getSelectors<RootState>(state => state.myPostReactions)

// Rename for readability
const { selectIds: selectAllEntityIds } = selectors

export const selectMyReactionsByPostIds: SelectManyFn<Args, ReactionStruct> = (
  state,
  { myAddress, ids: postIds },
) => {
  if (!myAddress || isEmptyStr(myAddress) || isEmptyArray(postIds)) return []

  const reactions: ReactionStruct[] = []

  postIds.forEach(postId => {
    const compositeId = prependIdWithAddress(postId, myAddress)
    const reaction = selectors.selectById(state, compositeId)
    if (reaction) {
      reactions.push(reaction)
    }
  })

  return reactions
}

type PostIdAndMyAddress = {
  postId: PostId
  myAddress?: AccountId
}

export const selectMyReactionByPostId = (
  state: RootState,
  { postId, myAddress }: PostIdAndMyAddress,
) => getFirstOrUndefined(selectMyReactionsByPostIds(state, { ids: [postId], myAddress }))

type FetchManyReactionsArgs = FetchManyArgsWithPrefetch<Args, ReactionStruct>

type FetchManyResult = ReactionStruct[]

const getMyReactionsByPostIds = createFetchDataFn<FetchManyResult>([])({
  chain: async ({
    api,
    myAddress,
    ids,
  }: {
    api: SubsocialApi
    myAddress: string
    ids: string[]
  }) => {
    const postIdByReactionId = new Map<ReactionId, PostId>()
    const reactionByPostId = new Map<PostId, ReactionStruct>()

    const tuples = ids.map(accountAndPostId => {
      const { id: postId } = decodePrependedIdWithAddress(accountAndPostId)
      const entityId = prependIdWithAddress(postId, myAddress)
      reactionByPostId.set(postId, { id: entityId })

      return [myAddress, idToBn(postId)]
    })
    const readyApi = await api.blockchain.api
    const reactionIdsFromStorage = await readyApi.query.reactions.postReactionIdByAccount.multi(
      tuples,
    )

    const reactionIds: BN[] = []

    reactionIdsFromStorage.forEach((reactionIdCodec, index) => {
      const reactionId = reactionIdCodec as unknown as BN
      if (!reactionId.eqn(0)) {
        const reactionIdStr = reactionId.toString()
        const postIdStr = tuples[index][1].toString()
        postIdByReactionId.set(reactionIdStr, postIdStr)
        reactionIds.push(reactionId)
      }
    })

    const entities = await api.blockchain.findReactions(reactionIds.filter(isDef))

    entities.forEach(({ kind: kindCodec, id }) => {
      const reactionId = id.toString()
      const postId = postIdByReactionId.get(reactionId)

      postId &&
        reactionByPostId.set(postId, {
          id: prependIdWithAddress(postId, myAddress),
          reactionId,
          kind: kindCodec.toString() as ReactionType,
        })
    })

    return Array.from(reactionByPostId.values())
  },
  squid: async ({ ids, myAddress }: { ids: string[]; myAddress: string }) => {
    return getAddressPostsReaction(apolloClient, { address: myAddress, postIds: ids }, idSeparator)
  },
})

export const fetchMyReactionsByPostIds = createAsyncThunk<
  FetchManyResult,
  FetchManyReactionsArgs,
  ThunkApiConfig
>(
  `${sliceName}/fetchMany`,
  createFetchManyDataWrapper({
    selectEntityIds: selectAllEntityIds,
    generateIdFromArgs: (id, { myAddress }) => prependIdWithAddress(id, myAddress ?? ''),
    getData: async (args): Promise<FetchManyResult> => {
      let { myAddress, api, dataSource, newIds } = args
      if (!myAddress) return []

      const newIdsDecoded = newIds.map(encoded => {
        const { id } = decodePrependedIdWithAddress(encoded as string)
        return id
      })
      return getMyReactionsByPostIds(dataSource, {
        chain: { api, ids: newIds as string[], myAddress },
        squid: { ids: newIdsDecoded, myAddress },
      })
    },
  }),
)

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    upsertMyReaction: adapter.upsertOne,
    // removeAllReactions: adapter.removeAll
  },
  extraReducers: builder => {
    builder.addCase(fetchMyReactionsByPostIds.fulfilled, (state, { payload }) => {
      if (payload) adapter.upsertMany(state, payload)
    })
  },
})

export const {
  upsertMyReaction,
  // removeAllReactions
} = slice.actions

export default slice.reducer
