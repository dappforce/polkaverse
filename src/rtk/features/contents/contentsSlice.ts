import { AsyncThunk, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { createFetchOne, SelectByIdFn, ThunkApiConfig } from 'src/rtk/app/helpers'
import { RootState } from 'src/rtk/app/rootReducer'
import { createFetchManyDataWrapper } from 'src/rtk/app/wrappers'
import {
  CommentContent,
  CommonContent,
  convertToDerivedContent,
  DerivedContent,
  HasId,
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
      const timeoutMs = 10_000
      let contents = await api.ipfs.getContentArray(newIds as string[], timeoutMs)
      return Object.entries(contents).map(([id, content]) => {
        const derivedContent = convertToDerivedContent(content) as CommentContent
        return { id, ...derivedContent, isOverview: false }
      })
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
    upsertContent: contentsAdapter.upsertOne,
  },
  extraReducers: builder => {
    builder.addCase(fetchContents.fulfilled, contentsAdapter.upsertMany)
    // builder.addCase(fetchContents.rejected, (state, action) => {
    //   state.error = action.error
    // })
  },
})

export const { upsertContent } = contents.actions

export default contents.reducer
