import clsx from 'clsx'
import { NextPage } from 'next'
import { FC } from 'react'
import { PostData, PostWithSomeDetails, SpaceStruct } from 'src/types'
import { useSelectSpace } from '../../rtk/features/spaces/spacesHooks'
import { PageContent } from '../main/PageWrapper'
import ViewPostLink from '../posts/ViewPostLink'
import { getProfileName } from '../substrate'
import { postUrl } from '../urls'
import { Pluralize } from '../utils/Plularize'
import Section from '../utils/Section'
import { ViewCommentsTree } from './CommentTree'
import { NewComment } from './CreateComment'
import { ViewComment } from './ViewComment'

type CommentSectionProps = {
  post: PostWithSomeDetails
  space?: SpaceStruct
  replies?: PostWithSomeDetails[]
  hashId?: string
  withBorder?: boolean
}

export const CommentSection: FC<CommentSectionProps> = ({ post, hashId, withBorder }) => {
  const {
    post: { struct },
  } = post
  const { id, repliesCount } = struct
  const hasAnyReply = (repliesCount ?? 0) > 0

  return (
    <Section
      id={hashId}
      className={clsx('DfCommentSection', hasAnyReply ? 'mb-2' : 'mb-4', {
        TopBorder: withBorder,
      })}
    >
      <h3>
        <Pluralize count={repliesCount || 0} singularText='comment' />
      </h3>
      <NewComment post={struct} asStub />
      <ViewCommentsTree parentId={id} />
    </Section>
  )
}

type CommentPageProps = {
  comment: PostWithSomeDetails
  parentPost: PostData
  space: SpaceStruct
  replies: PostWithSomeDetails[]
}

export const CommentPage: NextPage<CommentPageProps> = ({ comment, parentPost, space }) => {
  const {
    post: { struct, content },
  } = comment
  const { content: postContent } = parentPost
  const address = struct.ownerId

  const owner = useSelectSpace()
  const profileName = getProfileName({ address, owner }).toString()

  const renderResponseTitle = () => (
    <>
      In response to <ViewPostLink space={space} post={parentPost} title={postContent?.title} />
    </>
  )

  const meta = {
    title: `${profileName} commented on ${content?.title}`,
    desc: content?.summary,
    canonical: postUrl(space, comment.post),
  }

  return (
    <PageContent meta={meta} className='DfContentPage DfEntirePost' withOnBoarding>
      {renderResponseTitle()}
      <ViewComment space={space} comment={comment} withShowReplies />
    </PageContent>
  )
}
