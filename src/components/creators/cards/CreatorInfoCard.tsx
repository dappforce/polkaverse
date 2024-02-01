import { SpaceData } from '@subsocial/api/types'
import clsx from 'clsx'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { SpaceFollowersModal } from 'src/components/profiles/AccountsListModal'
import { OfficialSpaceStatus, SpaceAvatar, useIsMySpace } from 'src/components/spaces/helpers'
import ViewSpaceLink from 'src/components/spaces/ViewSpaceLink'
import CollapsibleParagraph from 'src/components/utils/CollapsibleParagraph/CollapsibleParagraph'
import FollowSpaceButton from 'src/components/utils/FollowSpaceButton'
import { Pluralize } from 'src/components/utils/Plularize'
import Segment from 'src/components/utils/Segment'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getAmountRange } from 'src/utils/analytics'
import styles from './CreatorInfoCard.module.sass'

export type CreatorInfoCardProps = {
  space: SpaceData
}

export default function CreatorInfoCard({ space }: CreatorInfoCardProps) {
  const myAddress = useMyAddress() ?? ''
  const { data: totalStake } = useFetchTotalStake(myAddress)
  const sendEvent = useSendEvent()
  const isMySpace = useIsMySpace(space.struct)

  return (
    <Segment className={clsx(styles.CreatorInfoCard)}>
      <div className={styles.TitleContainer}>
        <SpaceAvatar noMargin space={space?.struct} size={44} avatar={space?.content?.image} />
        <div className='d-flex flex-column'>
          <ViewSpaceLink
            space={space.struct}
            title={
              <span className={styles.Title}>
                <span>{space.content?.name ?? 'Untitled'}</span>
                <OfficialSpaceStatus withoutContainer space={space.struct} />
              </span>
            }
          />
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
      <CollapsibleParagraph
        className='FontSmall mb-2'
        text={space.content?.about ?? ''}
        limit={120}
      />
      {!isMySpace && (
        <div className={clsx('GapSmall d-flex flex-column mt-2')}>
          <div
            className='w-100'
            onClick={() =>
              sendEvent('follow', {
                spaceId: space.id,
                eventSource: 'post',
                amountRange: getAmountRange(totalStake?.amount),
              })
            }
          >
            <FollowSpaceButton className='w-100' space={space.struct} />
          </div>
        </div>
      )}
    </Segment>
  )
}
