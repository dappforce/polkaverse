import { Button } from 'antd'
import clsx from 'clsx'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import { CreatorDashboardHomeVariant } from '../CreatorDashboardSidebar'
import styles from './CreatePostCard.module.sass'

export type CreatePostCardProps = {
  variant: CreatorDashboardHomeVariant
}

export default function CreatePostCard({ variant }: CreatePostCardProps) {
  return (
    <Segment className={clsx(styles.CreatePostCard)}>
      <div className={styles.TitleContainer}>
        <DfImage src='/images/creators/registered-creators.jpeg' className={styles.Image} />
        <span className={styles.Title}>
          {variant === 'posts' ? (
            <span>All posts in Active Staking</span>
          ) : (
            <span>
              Registered
              <br />
              Creators
            </span>
          )}
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
