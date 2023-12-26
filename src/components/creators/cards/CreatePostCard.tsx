import { Button } from 'antd'
import clsx from 'clsx'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { CreatePostButtonAndModal } from 'src/components/posts/NewPostButtonInTopMenu'
import { CreateSpaceButton } from 'src/components/spaces/helpers'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import { useSelectSpaceIdsWhereAccountCanPost } from 'src/rtk/app/hooks'
import { selectSpaceIdsThatCanSuggestIfSudo } from 'src/utils'
import { CreatorDashboardHomeVariant } from '../CreatorDashboardSidebar'
import styles from './CreatePostCard.module.sass'

export type CreatePostCardProps = {
  variant: CreatorDashboardHomeVariant
}

export default function CreatePostCard({ variant }: CreatePostCardProps) {
  const myAddress = useMyAddress()

  const ids = useSelectSpaceIdsWhereAccountCanPost(myAddress)
  const spaceIds = selectSpaceIdsThatCanSuggestIfSudo({ myAddress, spaceIds: ids })

  const anySpace = spaceIds[0]

  let imagePath = '/images/creators/active-staking.jpeg'
  if (variant === 'spaces') imagePath = '/images/creators/registered-creators.jpeg'

  return (
    <Segment className={clsx(styles.CreatePostCard)}>
      <div className={styles.TitleContainer}>
        <DfImage src={imagePath} className={styles.Image} />
        <span className={styles.Title}>
          {variant === 'posts' ? (
            <span>All posts in Active Staking</span>
          ) : (
            <span>
              Featured
              <br />
              Creators
            </span>
          )}
        </span>
      </div>
      <span className='FontSmall'>
        By creating new posts and liking new content of others, stakers of SUB can increase their
        staking rewards by 50% to 200%.
      </span>
      {anySpace ? (
        <CreatePostButtonAndModal>
          {onClick => (
            <Button onClick={onClick} type='primary' className='mt-3'>
              Create post
            </Button>
          )}
        </CreatePostButtonAndModal>
      ) : (
        <>
          <span className='FontSmall ColorMuted mt-2'>Create a profile to get started.</span>
          <CreateSpaceButton className='mt-2' type='primary' ghost={false}>
            Create profile
          </CreateSpaceButton>
        </>
      )}
    </Segment>
  )
}
