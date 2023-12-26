import { SpaceData } from '@subsocial/api/types'
import { Button } from 'antd'
import clsx from 'clsx'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { SpaceFollowersModal } from 'src/components/profiles/AccountsListModal'
import { OfficialSpaceStatus, SpaceAvatar } from 'src/components/spaces/helpers'
import CollapsibleParagraph from 'src/components/utils/CollapsibleParagraph/CollapsibleParagraph'
import FollowSpaceButton from 'src/components/utils/FollowSpaceButton'
import { Pluralize } from 'src/components/utils/Plularize'
import Segment from 'src/components/utils/Segment'
import { useFetchStakeData } from 'src/rtk/features/stakes/stakesHooks'
import { getSubIdCreatorsLink } from 'src/utils/links'
import styles from './CreatorInfoCard.module.sass'

export type CreatorInfoCardProps = {
  space: SpaceData
}

export default function CreatorInfoCard({ space }: CreatorInfoCardProps) {
  const myAddress = useMyAddress()
  const { data } = useFetchStakeData(myAddress ?? '', space.id)

  return (
    <Segment className={clsx(styles.CreatorInfoCard)}>
      <div className={styles.TitleContainer}>
        <SpaceAvatar noMargin space={space?.struct} size={50} avatar={space?.content?.image} />
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
      <CollapsibleParagraph className='FontSmall mb-3' text={space.content?.about ?? ''} />
      <div className='GapSmall d-flex flex-column'>
        {data?.hasStaked && (
          <Button target='_blank' type='primary' href={getSubIdCreatorsLink(space)}>
            Stake
          </Button>
        )}
        <FollowSpaceButton space={space.struct} />
      </div>
    </Segment>
  )
}
