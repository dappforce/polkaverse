import { Button } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import styles from './CreatorInfoCard.module.sass'

export type CreatorInfoCardProps = ComponentProps<'div'>

export default function CreatorInfoCard({ ...props }: CreatorInfoCardProps) {
  return (
    <Segment {...props} className={clsx(styles.CreatorInfoCard, props.className)}>
      <div className={styles.TitleContainer}>
        <DfImage src='/images/creators/registered-creators.jpeg' className={styles.Image} />
        <div className='d-flex flex-column'>
          <span className={styles.Title}>Creators Info</span>
          <span className='FontSmall ColorMuted'>8.3K Followers</span>
        </div>
      </div>
      <span className='FontSmall mb-3'>
        Father of SpaceX and Tesla. Recently adopted Twitter and other interesting stuff... Show
        more
      </span>
      <Button type='primary' ghost>
        Follow
      </Button>
    </Segment>
  )
}
