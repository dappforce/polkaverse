import { PostData, SpaceStruct } from '@subsocial/api/types'
import { createTwitterURL, parseTwitterTextToMarkdown } from '@subsocial/utils'
import clsx from 'clsx'
import Link from 'next/link'
import { HTMLProps } from 'react'
import { DfMd } from 'src/components/utils/DfMd'
import ViewPostLink from '../ViewPostLink'
import { PostImage } from './helpers'
import styles from './TwitterPost.module.sass'

export type TwitterPostProps = Omit<HTMLProps<HTMLDivElement>, 'content'> & {
  post: PostData
  space: SpaceStruct | undefined
}

export default function TwitterPost({ post, space, ...props }: TwitterPostProps) {
  const { content } = post
  if (!content?.tweet) return null

  const parsedBody = parseTwitterTextToMarkdown(content.body)
  const originalTweetUrl = createTwitterURL(content.tweet)

  return (
    <div {...props} className={clsx(styles.TwitterPost, props.className)}>
      <div className={styles.TwitterPostHeader}>
        <Link passHref href={originalTweetUrl}>
          <a target='_blank' rel='noreferrer noopener' className='font-weight-bold'>
            Saved from Twitter
          </a>
        </Link>
        <Link href='https://post4ever.app/' passHref>
          <a target='_blank' rel='noreferrer noopener'>
            How it works?
          </a>
        </Link>
      </div>
      <div className={styles.TwitterPostContent}>
        <PostImage className='CursorPointer my-2' content={content} />
        <div className={styles.TwitterPostBodyContainer}>
          <ViewPostLink
            post={post}
            space={space}
            title=' '
            className={styles.TwitterPostBodyLink}
          />
          <DfMd className={styles.TwitterPostBody} source={parsedBody} />
        </div>
      </div>
    </div>
  )
}
