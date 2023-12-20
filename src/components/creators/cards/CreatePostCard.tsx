import { Button } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import styles from './CreatePostCard.module.sass'

export type CreatePostCardProps = ComponentProps<'div'>

export default function CreatePostCard({ ...props }: CreatePostCardProps) {
  return (
    <Segment {...props} className={clsx(props.className, styles.CreatePostCard)}>
      <div className={styles.TitleContainer}>
        <DfImage src='/images/creators/registered-creators.jpeg' className={styles.Image} />
        <span className={styles.Title}>
          Registered
          <br />
          Creators
        </span>
      </div>
      <span className='FontSmall'>
        By creating new posts and liking new content of others, stakers of SUB can increase their
        staking rewards by 50% or more.
      </span>
      <Button type='primary' className='mt-3'>
        Create Post
      </Button>
    </Segment>
  )
}
