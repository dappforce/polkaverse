import clsx from 'clsx'
import { FC } from 'react'
import { PostWithSomeDetails, SpaceStruct } from 'src/types'
import { useIsMyAddress } from '../auth/MyAccountsContext'
import { Pluralize } from '../utils/Plularize'
import Section from '../utils/Section'
import { ViewCommentsTree } from './CommentTree'
import { NewComment } from './CreateComment'

type CommentSectionProps = {
  post: PostWithSomeDetails
  space?: SpaceStruct
  replies?: PostWithSomeDetails[]
  hashId?: string
  withBorder?: boolean
  eventSource: 'post-page' | 'post-preview'
}

export const CommentSection: FC<CommentSectionProps> = ({
  post,
  hashId,
  withBorder,
  eventSource,
}) => {
  const {
    post: { struct },
  } = post
  const { id, repliesCount, ownerId } = struct
  const isPostAuthor = useIsMyAddress(ownerId)

  return (
    <Section
      id={hashId}
      className={clsx('DfCommentSection', {
        TopBorder: withBorder,
      })}
    >
      <h3>
        <Pluralize count={repliesCount || 0} singularText='comment' />
      </h3>
      <NewComment post={struct} asStub eventProps={{ eventSource, level: 0, isPostAuthor }} />
      <ViewCommentsTree
        eventProps={{ eventSource, level: 1, isPostAuthor }}
        parentId={id}
        directlyExpandReplies
      />
    </Section>
  )
}

// type CommentPageProps = {
//   comment: PostWithSomeDetails
//   parentPost: PostData
//   space: SpaceStruct
//   replies: PostWithSomeDetails[]
// }

// export const CommentPage: NextPage<CommentPageProps> = ({ comment, parentPost, space }) => {
//   const {
//     post: { struct, content },
//   } = comment
//   const { content: postContent } = parentPost
//   const address = struct.ownerId

//   const owner = useSelectSpace()
//   const profileName = getProfileName({ address, owner }).toString()

//   const renderResponseTitle = () => (
//     <>
//       In response to <ViewPostLink space={space} post={parentPost} title={postContent?.title} />
//     </>
//   )

//   const meta = {
//     title: `${profileName} commented on ${content?.title}`,
//     desc: content?.summary,
//     canonical: postUrl(space, comment.post),
//   }

//   return (
//     <PageContent meta={meta} className='DfContentPage DfEntirePost' withSidebar>
//       {renderResponseTitle()}
//       <ViewComment space={space} comment={comment} withShowReplies />
//     </PageContent>
//   )
// }
