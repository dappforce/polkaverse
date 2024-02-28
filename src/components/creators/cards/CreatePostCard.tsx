import { Button, Skeleton } from 'antd'
import clsx from 'clsx'
import { HiArrowUpRight } from 'react-icons/hi2'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { CreatePostButtonAndModal } from 'src/components/posts/NewPostButtonInTopMenu'
import CustomLink from 'src/components/referral/CustomLink'
import { CreateSpaceButton } from 'src/components/spaces/helpers'
import { DfImage } from 'src/components/utils/DfImage'
import Segment from 'src/components/utils/Segment'
import { useSendEvent } from 'src/providers/AnalyticContext'
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
  const sendEvent = useSendEvent()

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
        When users with locked SUB like your posts, you will receive SUB as a reward.{' '}
        <CustomLink href={activeStakingLinks.learnMore}>
          <a
            target='_blank'
            onClick={() =>
              sendEvent('astake_banner_learn_more', {
                eventSource: 'create-post-banner',
              })
            }
          >
            Learn more{' '}
            <HiArrowUpRight className='d-inline position-relative' style={{ top: '2px' }} />
          </a>
        </CustomLink>
      </span>
      <div className='mt-3 GapSmall flex-column d-flex'>
        {isLoading ? (
          <Skeleton.Button className='w-100' />
        ) : anySpace ? (
          <CreatePostButtonAndModal>
            {onClick => (
              <Button
                onClick={() => {
                  sendEvent('createpost_button_clicked', { eventSource: 'banner' })
                  onClick()
                }}
                type='primary'
              >
                Create post
              </Button>
            )}
          </CreatePostButtonAndModal>
        ) : (
          <div className='d-flex flex-column'>
            <CreateSpaceButton type='primary' ghost={false}>
              Create profile
            </CreateSpaceButton>
          </div>
        )}
      </div>
    </Segment>
  )
}
