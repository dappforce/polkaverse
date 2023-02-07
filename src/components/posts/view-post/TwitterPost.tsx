import { PostContent } from '@subsocial/api/types'
import { createTwitterURL, parseTwitterTextToMarkdown } from '@subsocial/utils'
import clsx from 'clsx'
import Link from 'next/link'
import { HTMLProps } from 'react'
import { BsTwitter } from 'react-icons/bs'
import { DfMd } from 'src/components/utils/DfMd'
import { PostImage } from './helpers'
import styles from './TwitterPost.module.sass'

export type TwitterPostProps = Omit<HTMLProps<HTMLDivElement>, 'content'> & {
  content: PostContent
}

export default function TwitterPost({ content, ...props }: TwitterPostProps) {
  if (!content.tweet) return null

  const parsedBody = parseTwitterTextToMarkdown(content.body)
  const originalTweetUrl = createTwitterURL(content.tweet)

  return (
    <div {...props} className={clsx(styles.TwitterPost, props.className)}>
      <div className={styles.TwitterPostHeader}>
        <Link passHref href={originalTweetUrl}>
          <a
            target='_blank'
            rel='noreferrer noopener'
            className='font-weight-bold d-flex align-items-center'
          >
            <span>Saved From</span>
            <BsTwitter className='ml-2' />
          </a>
        </Link>
        <Link href='https://post4ever.app/' passHref>
          <a target='_blank' rel='noreferrer noopener'>
            How it works?
          </a>
        </Link>
      </div>
      <div className={styles.TwitterPostBody}>
        <PostImage className='CursorPointer my-2' content={content} />
        <DfMd source={parsedBody} />
      </div>
    </div>
  )
}
