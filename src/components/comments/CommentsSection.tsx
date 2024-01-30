import { Checkbox } from 'antd'
import clsx from 'clsx'
import { FC } from 'react'
import { useIsMyAddressWhitelisted } from 'src/config/constants'
import { PostWithSomeDetails, SpaceStruct } from 'src/types'
import useLocalStorage from 'use-local-storage'
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

  const isWhitelisted = useIsMyAddressWhitelisted()
  let [showAllComments, setShowAllComments] = useLocalStorage<boolean>('showAllComments', false, {
    parser: str => str === 'true',
    serializer: bool => String(bool),
  })

  if (!isWhitelisted) {
    showAllComments = true
  }

  return (
    <Section
      id={hashId}
      className={clsx('DfCommentSection', {
        TopBorder: withBorder,
      })}
    >
      <div className='d-flex GapNormal justify-content-between align-items-center'>
        <h3>
          <Pluralize count={repliesCount || 0} singularText='comment' />
        </h3>
        {isWhitelisted && (
          <Checkbox
            checked={showAllComments}
            style={{ marginRight: '-8px' }}
            onChange={e => setShowAllComments(e.target.checked)}
          >
            <span className='ColorMuted'>Show all comments</span>
          </Checkbox>
        )}
      </div>
      <NewComment post={struct} asStub eventProps={{ eventSource, level: 0, isPostAuthor }} />
      <ViewCommentsTree
        rootPostId={id}
        eventProps={{ eventSource, level: 1, isPostAuthor }}
        parentId={id}
        directlyExpandReplies
        showAllReplies={showAllComments}
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
