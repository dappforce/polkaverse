import { Button, Skeleton } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { HiArrowUpRight } from 'react-icons/hi2'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { CreatePostButtonAndModal } from 'src/components/posts/NewPostButtonInTopMenu'
import { CreateSpaceButton } from 'src/components/spaces/helpers'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import { useSelectSpaceIdsWhereAccountCanPostWithLoadingStatus } from 'src/rtk/app/hooks'
import { selectSpaceIdsThatCanSuggestIfSudo } from 'src/utils'
import { activeStakingLinks } from 'src/utils/links'
import { CreatorDashboardHomeVariant } from '../CreatorDashboardSidebar'
import styles from './CreatePostCard.module.sass'

export type CreatePostCardProps = {
  variant: CreatorDashboardHomeVariant
}

export default function CreatePostCard({ variant }: CreatePostCardProps) {
  const myAddress = useMyAddress()

  const { isLoading, spaceIds: ids } =
    useSelectSpaceIdsWhereAccountCanPostWithLoadingStatus(myAddress)
  const spaceIds = selectSpaceIdsThatCanSuggestIfSudo({ myAddress, spaceIds: ids })

  const anySpace = spaceIds[0]

  let imagePath = '/images/creators/active-staking.jpeg'
  if (variant === 'spaces') imagePath = '/images/creators/registered-creators.jpeg'

  return (
    <Segment className={clsx(styles.CreatePostCard)}>
      <div className={styles.TitleContainer}>
        <DfImage preview={false} src={imagePath} className={styles.Image} />
        <span className={styles.Title}>
          {variant === 'posts' ? <span>Earn Extra SUB</span> : <span>Featured Creators</span>}
        </span>
      </div>
      <span className='FontSmall'>
        By creating new posts and liking new content of others, stakers of SUB can increase their
        staking rewards by 50% to 200%.{' '}
        <Link href={activeStakingLinks.learnMore}>
          <a target='_blank'>
            Learn more{' '}
            <HiArrowUpRight className='d-inline position-relative' style={{ top: '2px' }} />
          </a>
        </Link>
      </span>
      <div className='mt-3 GapSmall flex-column d-flex'>
        {isLoading ? (
          <Skeleton.Button className='w-100' />
        ) : anySpace ? (
          <CreatePostButtonAndModal>
            {onClick => (
              <Button onClick={onClick} type='primary'>
                Create post
              </Button>
            )}
          </CreatePostButtonAndModal>
        ) : (
          <div className='d-flex flex-column'>
            <span className='FontSmall ColorMuted'>Create a profile to get started.</span>
            <CreateSpaceButton className='mt-3' type='primary' ghost={false}>
              Create profile
            </CreateSpaceButton>
          </div>
        )}
      </div>
    </Segment>
  )
}
