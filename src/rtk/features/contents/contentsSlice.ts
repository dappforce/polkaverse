import { sanitizeUrl } from '@braintree/sanitize-url'
import { AsyncThunk, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { isDef, isObj, nonEmptyArr, nonEmptyStr } from '@subsocial/utils'
import { createFetchOne, SelectByIdFn, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { createFetchManyDataWrapper } from 'src/rtk/app/wrappers'
import {
  CommentContent,
  CommonContent,
  convertToDerivedContent,
  DerivedContent,
  HasId,
  NamedLink,
  PostContent,
  SharedPostContent,
  SpaceContent,
} from 'src/types'
import { CommonFetchPropsAndIds, CommonFetchPropsWithPrefetch } from './../../app/helpers'

/** Content with id */
export type Content<C extends CommonContent = CommonContent> = HasId &
  DerivedContent<C> & {
    isOverview?: boolean
  }

type SelectByIdResult<C extends CommonContent> = SelectByIdFn<Content<C>>

const contentsAdapter = createEntityAdapter<Content>()

const contentsSelectors = contentsAdapter.getSelectors<RootState>(state => state.contents)

const { selectById } = contentsSelectors

export const selectProfileContentById = selectById as SelectByIdResult<SpaceContent>
export const selectSpaceContentById = selectById as SelectByIdResult<SpaceContent>
export const selectPostContentById = selectById as SelectByIdResult<PostContent>
export const selectCommentContentById = selectById as SelectByIdResult<CommentContent>
export const selectSharedPostContentById = selectById as SelectByIdResult<SharedPostContent>

// Rename the exports for readability in component usage
export const {
  // selectById: selectContentById,
  selectIds: selectContentIds,
  selectEntities: selectContentEntities,
  selectAll: selectAllContents,
  selectTotal: selectTotalContents,
} = contentsSelectors

type FetchContentFn<C extends CommonContent> = AsyncThunk<
  Content<C>[],
  CommonFetchPropsAndIds,
  ThunkApiConfig
>

export type PrefetchedContentData = { [id: string]: Content }
export const fetchContents = createAsyncThunk<
  Content[],
  CommonFetchPropsWithPrefetch<Content>,
  ThunkApiConfig
>(
  'contents/fetchMany',
  createFetchManyDataWrapper({
    selectEntityIds: selectContentIds,
    withAdditionalUnknownIdValidation: {
      selectEntities: selectContentEntities,
      unknownFlagAttr: 'isOverview',
    },
    getData: async ({ api, newIds }) => {
      const timeoutMs = 3_000
      let contents = await api.ipfs.getContentArray(newIds as string[], timeoutMs)
      return Object.entries(contents)
        .map(([id, content]) => {
          const derivedContent = convertToDerivedContent(content) as CommentContent
          return { id, ...derivedContent, isOverview: false }
        })
        .filter(isDef)
    },
  }),
)

export const fetchProfileContents = fetchContents as FetchContentFn<SpaceContent>
export const fetchSpaceContents = fetchContents as FetchContentFn<SpaceContent>
export const fetchPostContents = fetchContents as FetchContentFn<PostContent>
export const fetchCommentContents = fetchContents as FetchContentFn<CommentContent>
export const fetchSharedPostContents = fetchContents as FetchContentFn<SharedPostContent>

export const fetchContent = createFetchOne(fetchContents)

const contents = createSlice({
  name: 'contents',
  initialState: contentsAdapter.getInitialState(),
  reducers: {
    upsertContent: (state, action) => {
      const entity = sanitizeContent(action.payload)
      contentsAdapter.upsertOne(state, entity)
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchContents.fulfilled, (state, action) => {
      const entities = action.payload.map(sanitizeContent)
      contentsAdapter.upsertMany(state, entities)
    })
  },
})

const sanitizeContent = (content: Content<CommonContent>): Content<CommonContent> => {
  let canonical = (content as PostContent)?.canonical

  if (canonical) {
    canonical = sanitizeUrl(canonical)
  }

  let links = (content as SpaceContent)?.links

  if (nonEmptyArr(links)) {
    links = links.map(link => {
      if (nonEmptyStr(link)) {
        link = sanitizeUrl(link)
      } else if (isObj(link)) {
        link.url = sanitizeUrl(link.url)
      }

      return link
    }) as string[] | NamedLink[]
  }

  return { ...content, canonical, links }
}

export const { upsertContent } = contents.actions

export default contents.reducer
