import { PostData, SpaceStruct } from '@subsocial/api/types'
import { createTwitterURL, parseTwitterTextToMarkdown } from '@subsocial/utils'
import clsx from 'clsx'
import { HTMLProps } from 'react'
import { BsQuestionCircle, BsTwitter } from 'react-icons/bs'
import CustomLink from 'src/components/referral/CustomLink'
import { DfMd } from 'src/components/utils/DfMd'
import ViewPostLink from '../ViewPostLink'
import { PostImage } from './helpers'
import styles from './TwitterPost.module.sass'

export type TwitterPostProps = Omit<HTMLProps<HTMLDivElement>, 'content'> & {
  post: PostData
  space: SpaceStruct | undefined
  withLinkToDetailPage?: boolean
  withLargeFont?: boolean
}

export default function TwitterPost({
  post,
  space,
  withLinkToDetailPage,
  withLargeFont,
  ...props
}: TwitterPostProps) {
  const { content } = post
  if (!content?.tweet) return null

  const parsedBody = parseTwitterTextToMarkdown(content.body)
  const originalTweetUrl = createTwitterURL(content.tweet)

  return (
    <div {...props} className={clsx(styles.TwitterPost, props.className)}>
      <div className={styles.TwitterPostHeader}>
        <CustomLink passHref href={originalTweetUrl}>
          <a
            target='_blank'
            rel='noreferrer noopener'
            className='d-flex align-items-center font-weight-bold CursorPointer'
          >
            <BsTwitter className='mr-2 FontLarge CursorPointer' />
            <span className='CursorPointer'>{content.tweet.username || 'Saved Tweet'}</span>
          </a>
        </CustomLink>
        <CustomLink href='https://post4ever.app/' passHref>
          <a className='d-flex align-items-center' target='_blank' rel='noreferrer noopener'>
            <span className='mr-2'>Saved from Twitter</span>
            <BsQuestionCircle className='position-relative' style={{ top: 1 }} />
          </a>
        </CustomLink>
      </div>
      <div className={clsx(styles.TwitterPostContent, withLargeFont ? 'FontLarge' : 'FontNormal')}>
        <PostImage className='mb-0 BorderNone RoundedNone' content={content} />
        <div className={styles.TwitterPostBodyContainer}>
          {withLinkToDetailPage && (
            <ViewPostLink
              post={post}
              space={space}
              title=' '
              className={styles.TwitterPostBodyLink}
            />
          )}
          <DfMd className={styles.TwitterPostBody} source={parsedBody} />
        </div>
      </div>
    </div>
  )
}
