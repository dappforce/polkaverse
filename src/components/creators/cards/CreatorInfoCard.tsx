import { SpaceData } from '@subsocial/api/types'
import { Button } from 'antd'
import clsx from 'clsx'
import { BsBoxArrowUpRight } from 'react-icons/bs'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { FormatBalance } from 'src/components/common/balances'
import { SpaceFollowersModal } from 'src/components/profiles/AccountsListModal'
import { OfficialSpaceStatus, SpaceAvatar } from 'src/components/spaces/helpers'
import CollapsibleParagraph from 'src/components/utils/CollapsibleParagraph/CollapsibleParagraph'
import FollowSpaceButton from 'src/components/utils/FollowSpaceButton'
import { Pluralize } from 'src/components/utils/Plularize'
import Segment from 'src/components/utils/Segment'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useIsCreatorSpace } from 'src/rtk/features/creators/creatorsListHooks'
import { useFetchStakeData } from 'src/rtk/features/creators/stakesHooks'
import { getSubIdCreatorsLink } from 'src/utils/links'
import styles from './CreatorInfoCard.module.sass'

export type CreatorInfoCardProps = {
  space: SpaceData
  showStakeButton?: boolean
}

export default function CreatorInfoCard({ space, showStakeButton = true }: CreatorInfoCardProps) {
  const myAddress = useMyAddress() ?? ''
  const { isCreatorSpace } = useIsCreatorSpace(space.id)
  const { data: stakeData } = useFetchStakeData(myAddress, space.id)
  const sendEvent = useSendEvent()

  return (
    <Segment className={clsx(styles.CreatorInfoCard)}>
      <div className={styles.TitleContainer}>
        <SpaceAvatar noMargin space={space?.struct} size={44} avatar={space?.content?.image} />
        <div className='d-flex flex-column'>
          <span className={styles.Title}>
            <span>{space.content?.name ?? 'Untitled'}</span>
            <OfficialSpaceStatus withoutContainer space={space.struct} />
          </span>
          <SpaceFollowersModal
            address={space.id}
            pluralizeTitle='Follower'
            renderOpenButton={(open, count) =>
              !!count && (
                <div onClick={open} className='FontSmall ColorMuted' style={{ cursor: 'pointer' }}>
                  <Pluralize count={count} singularText='Follower' />
                </div>
              )
            }
          />
        </div>
      </div>
      <CollapsibleParagraph className='FontSmall mb-2' text={space.content?.about ?? ''} />
      {!stakeData?.hasStaked ? (
        <div className='GapSmall d-flex flex-column mt-2'>
          {isCreatorSpace && showStakeButton && (
            <Button
              target='_blank'
              type='primary'
              href={getSubIdCreatorsLink(space)}
              onClick={() =>
                sendEvent('astake_banner_add_stake', {
                  eventSource: 'creator-info-banner',
                  spaceId: space.id,
                })
              }
            >
              Stake
            </Button>
          )}
          <div onClick={() => sendEvent('follow', { spaceId: space.id, eventSource: 'post' })}>
            <FollowSpaceButton space={space.struct} />
          </div>
        </div>
      ) : (
        <div className={clsx('d-flex flex-column GapNormal', styles.MyStake)}>
          <div className='GapSmall d-flex align-items-center justify-content-between FontSmall'>
            <span className='ColorMuted'>My Stake</span>
            <span className='FontWeightMedium'>
              <FormatBalance
                value={stakeData?.stakeAmount}
                decimals={10}
                currency='SUB'
                precision={2}
              />
            </span>
          </div>
          <Button
            className={clsx('d-flex align-items-center GapTiny justify-content-center pt-1')}
            type='primary'
            ghost
            href={getSubIdCreatorsLink(space)}
            target='_blank'
            onClick={() =>
              sendEvent('astake_dashboard_manage_stake', {
                eventSource: 'creator-info-banner',
                spaceId: space.id,
              })
            }
          >
            Manage my stake
            <BsBoxArrowUpRight />
          </Button>
        </div>
      )}
    </Segment>
  )
}
