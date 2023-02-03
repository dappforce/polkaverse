import { parseTwitterTextToMarkdown, summarize, summarizeMd } from '@subsocial/utils'
import { getPostIdFromSlug } from '@subsocial/utils/slugify'
import { NextPage } from 'next'
import router from 'next/router'
import { FC } from 'react'
import { PageContent } from 'src/components/main/PageWrapper'
import AuthorCard from 'src/components/profiles/address-views/AuthorCard'
import { useResponsiveSize } from 'src/components/responsive'
import { useIsUnlistedSpace } from 'src/components/spaces/helpers'
import SpaceCard from 'src/components/spaces/SpaceCard'
import { postUrl } from 'src/components/urls'
import { Loading } from 'src/components/utils'
import { return404 } from 'src/components/utils/next'
import config from 'src/config'
import { resolveIpfsUrl } from 'src/ipfs'
import { getInitialPropsWithRedux, NextContextWithRedux } from 'src/rtk/app'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { fetchPost, fetchPosts, selectPost } from 'src/rtk/features/posts/postsSlice'
import { useFetchMyReactionsByPostId } from 'src/rtk/features/reactions/myPostReactionsHooks'
import {
  asCommentStruct,
  bnsToIds,
  HasStatusCode,
  idToBn,
  PostData,
  PostWithAllDetails,
  PostWithSomeDetails,
} from 'src/types'
import { CommentSection } from '../../comments/CommentsSection'
import { DfImage } from '../../utils/DfImage'
import { DfMd } from '../../utils/DfMd'
import Section from '../../utils/Section'
import ViewTags from '../../utils/ViewTags'
import Embed from '../embed/Embed'
import { StatsPanel } from '../PostStats'
import ViewPostLink from '../ViewPostLink'
import {
  HiddenPostAlert,
  OriginalPostPanel,
  PostActionsPanel,
  PostCreator,
  PostNotFoundPage,
  SharePostContent,
  useIsUnlistedPost,
} from './helpers'
import { PostDropDownMenu } from './PostDropDownMenu'

export type PostDetailsProps = {
  postData: PostWithAllDetails
  rootPostData?: PostWithSomeDetails
  statusCode?: number
}

const MAX_META_TITLE_LEN = 100

const InnerPostPage: NextPage<PostDetailsProps> = props => {
  const { postData: initialPostData, rootPostData } = props
  const id = initialPostData.id
  const { isNotMobile } = useResponsiveSize()
  useFetchMyReactionsByPostId(id)

  const postData = useAppSelector(state => selectPost(state, { id })) || initialPostData

  const { post, space } = postData
  const { struct, content } = post

  const profile = useSelectProfile(postData.post.struct.ownerId)
  const spaceId = space?.id
  const isSameProfileAndSpace = profile?.id === spaceId

  const isUnlistedPost = useIsUnlistedPost({ post: struct, space: space?.struct })

  if (useIsUnlistedSpace(postData.space) || isUnlistedPost) return <PostNotFoundPage />

  if (!content) return null

  if (!space) return <Loading />

  const spaceStruct = space.struct
  const spaceData = space

  const { title, image, tags, link, tweet } = content
  let body = content.body
  if (tweet?.id) {
    body = parseTwitterTextToMarkdown(body)
  }

  const goToCommentsId = 'comments'

  const renderResponseTitle = (parentPost?: PostData) => {
    if (!parentPost || !parentPost.content) return null

    const { title, summary } = parentPost.content

    const smallSummary = summarize(summary, { limit: 80 })

    return (
      parentPost && (
        <>
          In response to{' '}
          <ViewPostLink space={spaceStruct} post={parentPost} title={title || smallSummary} />
        </>
      )
    )
  }

  const titleMsg = struct.isComment ? renderResponseTitle(rootPostData?.post) : title
  let metaTitle = title
  if (!metaTitle) {
    if (typeof body === 'string') {
      metaTitle = summarizeMd(body, { limit: MAX_META_TITLE_LEN }).summary
    } else {
      metaTitle = config.metaTags.title
    }
  }

  return (
    <PageContent
      meta={{
        title: metaTitle,
        desc: content.summary,
        image,
        tags,
        canonical: postUrl(spaceStruct, postData.post),
        externalCanonical: content.canonical,
      }}
      withOnBoarding
      withVoteBanner
    >
      <HiddenPostAlert post={post.struct} />
      <Section>
        <div>
          <div className='DfContentPage DfEntirePost'>
            <div className='DfRow mt-3'>
              <PostCreator
                size={40}
                withSpaceAvatar
                postDetails={postData}
                withSpaceName
                space={spaceData}
              />
              {isNotMobile && (
                <div className='d-flex justify-content-end align-items-center'>
                  <StatsPanel post={struct} goToCommentsId={goToCommentsId} />
                  <div className='ml-2' style={{ position: 'relative', top: '2px' }}>
                    <PostDropDownMenu post={post} space={spaceStruct} withEditButton />
                  </div>
                </div>
              )}
            </div>
            <OriginalPostPanel canonicalUrl={content.canonical} />
            <div className='DfPostContent'>
              {titleMsg && <h1 className='DfPostName'>{titleMsg}</h1>}
              {struct.isSharedPost ? (
                <SharePostContent postDetails={postData} space={space} />
              ) : (
                <>
                  {image && (
                    <div className='d-flex justify-content-center'>
                      <DfImage src={resolveIpfsUrl(image)} className='DfPostImage' />
                    </div>
                  )}
                  {link && <Embed link={link} className={!!body ? 'mb-3' : 'mb-0'} />}
                  {body && <DfMd source={body} />}
                  <ViewTags tags={tags} className='mt-2' />
                </>
              )}
            </div>

            <div className='DfRow mt-2'>
              <PostActionsPanel postDetails={postData} space={space.struct} />
            </div>

            <div className='pt-2'>
              <AuthorCard
                className='mt-4'
                address={postData.post.struct.ownerId}
                withAuthorTag
                withTipButton
              />
            </div>
            {!isSameProfileAndSpace && (
              <SpaceCard className='mt-4' spaceId={postData.space?.id ?? ''} />
            )}

            <CommentSection post={postData} hashId={goToCommentsId} space={spaceStruct} />
          </div>
        </div>
      </Section>
    </PageContent>
  )
}

export async function loadPostOnNextReq({
  context,
  dispatch,
  subsocial,
  reduxStore,
}: NextContextWithRedux): Promise<PostWithSomeDetails & HasStatusCode> {
  const {
    query: { slug },
    res,
    asPath,
  } = context

  const { blockchain } = subsocial

  const slugStr = slug as string
  const postId = getPostIdFromSlug(slugStr)

  if (!postId) return return404(context)

  const replyIds = await blockchain.getReplyIdsByPostId(idToBn(postId))

  const ids = bnsToIds(replyIds).concat(postId)

  await dispatch(fetchPosts({ api: subsocial, ids, reload: true, eagerLoadHandles: true }))
  const postData = selectPost(reduxStore.getState(), { id: postId })

  if (!postData?.space) return return404(context)

  const {
    space: { struct },
    post,
  } = postData

  const currentPath = asPath?.split('?')[0]

  const expectedPostUrl = postUrl(struct, post)

  if (currentPath !== expectedPostUrl) {
    if (res) {
      res.writeHead(301, { Location: expectedPostUrl })
      res.end()
    } else {
      router.push(expectedPostUrl)
    }
  }

  return postData
}

const PostPage: FC<PostDetailsProps & HasStatusCode> = props => {
  const { statusCode } = props

  if (statusCode === 404) {
    return <PostNotFoundPage />
  }

  return <InnerPostPage {...props} />
}

getInitialPropsWithRedux(PostPage, async props => {
  const { subsocial, dispatch, reduxStore, context } = props

  const data = await loadPostOnNextReq(props)

  if (data.statusCode === 404) return return404(context)

  let rootPostData: PostWithSomeDetails | undefined

  const postStruct = data?.post?.struct

  if (postStruct?.isComment) {
    const { rootPostId } = asCommentStruct(postStruct)
    await dispatch(
      fetchPost({ api: subsocial, id: rootPostId, reload: true, eagerLoadHandles: true }),
    )
    rootPostData = selectPost(reduxStore.getState(), { id: rootPostId })
  }

  return {
    postData: data as PostWithAllDetails,
    rootPostData,
  }
})

export default PostPage
