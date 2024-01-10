import { xxhashAsHex } from '@polkadot/util-crypto'
import { createAsyncThunk, createEntityAdapter, createSlice, EntityId } from '@reduxjs/toolkit'
import { SubsocialApi } from '@subsocial/api'
import { FindPostsQuery } from '@subsocial/api/filters'
import { getFirstOrUndefined } from '@subsocial/utils'
import { getPostsData } from 'src/graphql/apis'
import { PostFragmentMapped, PostFragmentWithParent } from 'src/graphql/apis/types'
import {
  createFetchOne,
  createSelectUnknownIds,
  FetchManyArgs,
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
import { selectSpaces } from 'src/rtk/features/spaces/spacesSlice'
import {
  AccountId,
  AnyPostId,
  asCommentStruct,
  asSharedPostStruct,
  CommentStruct,
  DataSourceTypes,
  getUniqueContentIds,
  getUniqueOwnerIds,
  getUniqueSpaceIds,
  idsToBns,
  PostId,
  PostStruct,
  PostWithSomeDetails,
  ProfileSpaceIdByAccount,
  SpaceData,
  SpaceStruct,
} from 'src/types'
import { fetchAddressLikeCounts } from '../activeStaking/addressLikeCountSlice'
import { fetchCanPostsSuperLiked } from '../activeStaking/canPostSuperLikedSlice'
import { fetchSuperLikeCounts } from '../activeStaking/superLikeCountsSlice'
import { Content, fetchContents, selectPostContentById } from '../contents/contentsSlice'
import { fetchProfileSpaces } from '../profiles/profilesSlice'
import { fetchMyReactionsByPostIds } from '../reactions/myPostReactionsSlice'
import { fetchSpaces } from '../spaces/spacesSlice'
export interface PostState extends PostStruct {
  isOverview?: boolean
}

const postsAdapter = createEntityAdapter<PostState>()

const postsSelectors = postsAdapter.getSelectors<RootState>(state => state.posts)

// Rename the exports for readability in component usage
export const {
  selectById: selectPostStructById,
  selectIds: selectPostIds,
  selectEntities: selectPostEntities,
  selectAll: selectAllPosts,
  selectTotal: selectTotalPosts,
} = postsSelectors

const _selectPostsByIds = (state: RootState, ids: EntityId[]) =>
  selectManyByIds(state, ids, selectPostStructById, selectPostContentById)

/** Should we fetch and select a space owner by default? */
const withSpaceOwner = { withOwner: false }

export type PostVisibility = HasHiddenVisibility

type Args = {
  visibility?: PostVisibility
  withContent?: boolean
  withOwner?: boolean
  withSpace?: boolean
  withExt?: boolean
  withRootPost?: boolean
  withReactionByAccount?: AccountId
}

export type SelectPostArgs = SelectOneArgs<Args>
export type SelectPostsArgs = SelectManyArgs<Args>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// type FetchPostArgs = FetchOneArgs<Args>
type FetchPostsArgs = FetchManyArgs<Args>

type PostMap<D extends PostWithSomeDetails = PostWithSomeDetails> = Record<PostId, D>

export function selectPostMap<D extends PostWithSomeDetails = PostWithSomeDetails>(
  state: RootState,
  props: SelectPostsArgs,
): PostMap<D> {
  const map: PostMap<D> = {}
  selectPosts(state, props).forEach(p => (map[p.id] = p as D))
  return map
}

// This method use only server side for get posts on space page
export function selectPosts(state: RootState, props: SelectPostsArgs): PostWithSomeDetails[] {
  const { ids, withSpace = true, withExt = true } = props
  const posts = _selectPostsByIds(state, ids)

  const rootPostIds = new Set<PostId>()

  posts.forEach(({ struct }) => {
    if (struct.isComment) {
      const { rootPostId } = asCommentStruct(struct)
      rootPostIds.add(rootPostId)
    }
  })

  const rootPosts = _selectPostsByIds(state, Array.from(rootPostIds))

  const postsMap = selectPostEntities(state)

  const spaceByIdMap = new Map<EntityId, SpaceData>()
  if (withSpace) {
    const spaceIds = getUniqueSpaceIds(posts.concat(rootPosts))

    const spaces = selectSpaces(state, { ids: spaceIds, ...withSpaceOwner })
    spaces.forEach(space => {
      spaceByIdMap.set(space.id, space)
    })
  }

  const result: PostWithSomeDetails[] = []
  posts.forEach(post => {
    const { struct } = post
    const { spaceId, isComment, isSharedPost } = struct

    let space: SpaceData | undefined
    if (spaceId) {
      space = spaceByIdMap.get(spaceId)
    }

    if (isComment) {
      const { rootPostId } = asCommentStruct(struct)
      const rootPost = postsMap[rootPostId]

      if (rootPost) {
        space = spaceByIdMap.get(rootPost.spaceId!)
      }
    }

    let ext: PostWithSomeDetails | undefined

    if (withExt && isSharedPost) {
      const { originalPostId } = asSharedPostStruct(struct)
      ext = getFirstOrUndefined(selectPosts(state, { ids: [originalPostId] }))
    }

    result.push({ id: post.id, ext, post, space })
  })
  return result
}

export function selectPost(
  state: RootState,
  props: SelectPostArgs,
): PostWithSomeDetails | undefined {
  const { id, ...rest } = props
  const entities = selectPosts(state, { ids: [id], ...rest })
  return getFirstOrUndefined(entities)
}

const selectUnknownPostIds = createSelectUnknownIds(selectPostIds, {
  selectEntities: selectPostEntities,
  isFlaggedUnknownChecker: entity => !!entity.isOverview,
})

const getPostCountDataFromChain = async (api: SubsocialApi, posts: PostStruct[]) => {
  const postsPromise = posts.map(async post => {
    const postId = post.id as unknown as AnyPostId
    const sharedCount = await api.blockchain.sharesCountByPostId(postId)
    const repliesCount = await api.blockchain.repliesCountByPostId(postId)

    post.sharesCount = sharedCount.toNumber()
    post.repliesCount = repliesCount.toNumber()
  })
  await Promise.all(postsPromise)
}

const getPosts = createFetchDataFn<PostState[]>([])({
  chain: async ({
    api,
    fetchCountData,
    ...params
  }: { api: SubsocialApi; fetchCountData?: boolean } & FindPostsQuery) => {
    const entities = await api.findPostStructs(params.ids)
    if (fetchCountData) {
      await getPostCountDataFromChain(api, entities)
    }
    return entities.map<PostState>(post => ({ ...post, isOverview: false }))
  },
  squid: async ({ ids, publicOnly }: { ids: string[]; publicOnly?: boolean }, client) => {
    if (ids.length === 0) return []

    const posts = await getPostsData(client, {
      where: {
        id_in: ids,
        hidden_not_eq: publicOnly ? true : undefined,
      },
    })
    // TODO It is fix bug of Squid, so we need to remove it after fix
    const fixedPosts = await Promise.all(
      posts.map(async post => {
        if (!post.contentId && post.ipfsContent) {
          const newCid = xxhashAsHex(Buffer.from(JSON.stringify(post.ipfsContent)), 128, true)
          post.contentId = Buffer.from(newCid).toString('hex')
        }
        return post
      }),
    )

    return fixedPosts.map<PostState>(post => ({ ...post, isOverview: true }))
  },
})
export const fetchPosts = createAsyncThunk<PostStruct[], FetchPostsArgs, ThunkApiConfig>(
  'posts/fetchMany',
  createFetchManyDataWrapper({
    withAdditionalUnknownIdValidation: {
      selectEntities: selectPostEntities,
      unknownFlagAttr: 'isOverview',
    },
    selectEntityIds: selectPostIds,
    handleAfterDataFetch: async (entities, args, { dispatch }) => {
      const {
        api,
        withContent = true,
        withOwner = true,
        withSpace = true,
        withRootPost,
        dataSource,
        eagerLoadHandles,
      } = args

      const generatePrefetchData = generatePrefetchDataFn<PostState, PostFragmentWithParent>(
        entities,
      )

      const fetches: Promise<any>[] = []

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
          fetches.push(dispatch(fetchContents({ api, ids, dataSource, prefetchedData })))
        }
      }

      if (withSpace) {
        const ids = getUniqueSpaceIds(entities)
        const prefetchedData = generatePrefetchData<SpaceStruct>(
          data => data.spaceId,
          data => data.space,
        )
        if (ids.length) {
          fetches.push(
            dispatch(
              fetchSpaces({
                api,
                ids,
                ...withSpaceOwner,
                dataSource,
                prefetchedData,
                eagerLoadHandles: eagerLoadHandles,
              }),
            ),
          )
        }
      }

      if (withRootPost) {
        const needToFetchRootPostIds: string[] = []
        entities.forEach(entity => {
          const rootPostId = (entity as CommentStruct).rootPostId
          if (rootPostId) {
            needToFetchRootPostIds.push(rootPostId)
          }
        })
        if (needToFetchRootPostIds.length) {
          fetches.push(
            dispatch(
              fetchPosts({
                ...args,
                api,
                ids: needToFetchRootPostIds,
                withRootPost: false,
              }),
            ),
          )
        }
      }

      await Promise.all(fetches)
      return entities
    },
    getData: async (args, { getState, dispatch }) => {
      const {
        api,
        withReactionByAccount,
        dataSource,
        reload,
        runAdditionalCheckForUnknownIds,
        newIds: _newIds,
      } = args
      const newIds = _newIds as string[]

      withReactionByAccount &&
        dispatch(
          fetchMyReactionsByPostIds({
            ids: newIds,
            myAddress: withReactionByAccount,
            api,
            dataSource,
          }),
        )
      dispatch(fetchSuperLikeCounts({ postIds: newIds }))
      dispatch(fetchCanPostsSuperLiked({ postIds: newIds }))

      withReactionByAccount &&
        dispatch(fetchAddressLikeCounts({ postIds: newIds, address: withReactionByAccount }))

      const entities = await getPosts(dataSource, {
        chain: { api, ids: idsToBns(newIds) },
        squid: { ids: newIds },
      })

      if (dataSource === DataSourceTypes.SQUID) {
        const castedEntities = entities as PostFragmentWithParent[]
        const flattenedEntities: PostFragmentMapped[] = []
        castedEntities.forEach(entity => {
          if (entity.parentPost) {
            flattenedEntities.push(entity.parentPost)
          } else if (entity.sharedPost) {
            flattenedEntities.push(entity.sharedPost)
          }
          entity.parentPost = null
          entity.sharedPost = null
          flattenedEntities.push(entity)
        })

        return flattenedEntities
      }

      const alreadyLoadedIds = new Set(newIds)
      const extPostIds = new Set<PostId>()

      const addToExtPostIds = (id: PostId) => {
        if (id && (reload || !alreadyLoadedIds.has(id))) {
          extPostIds.add(id)
        }
      }

      entities.forEach(x => {
        if (x.isComment) {
          addToExtPostIds(asCommentStruct(x).rootPostId)
        } else if (x.isSharedPost) {
          addToExtPostIds(asSharedPostStruct(x).originalPostId)
        }
      })

      const newExtIds = selectUnknownPostIds(
        getState(),
        Array.from(extPostIds),
        runAdditionalCheckForUnknownIds,
      )
      const extEntities = await getPosts(dataSource, {
        chain: {
          api,
          ids: idsToBns(newExtIds),
          visibility: 'onlyPublic',
        },
        squid: { ids: newExtIds, publicOnly: true },
      })
      const allEntities = entities.concat(extEntities)
      await getPostCountDataFromChain(api, allEntities)

      return allEntities
    },
  }),
)

export const fetchPost = createFetchOne(fetchPosts)

const posts = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState(),
  reducers: {
    upsertPost: postsAdapter.upsertOne,
    removePost: postsAdapter.removeOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchPosts.fulfilled, postsAdapter.upsertMany)
    // builder.addCase(fetchPosts.rejected, (state, action) => {
    //   state.error = action.error
    // })
  },
})

export const { upsertPost, removePost } = posts.actions

export default posts.reducer
