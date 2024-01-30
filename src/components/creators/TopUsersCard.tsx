import { Button, Skeleton } from 'antd'
import clsx from 'clsx'
import { ComponentProps, CSSProperties, useMemo } from 'react'
import { IoChevronForward } from 'react-icons/io5'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchProfileSpaces, useSelectProfile } from 'src/rtk/app/hooks'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { useFetchTopUsers } from 'src/rtk/features/leaderboard/hooks'
import { getAmountRange } from 'src/utils/analytics'
import { truncateAddress } from 'src/utils/storage'
import { useMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance } from '../common/balances'
import Avatar from '../profiles/address-views/Avatar'
import ViewProfileLink from '../profiles/ViewProfileLink'
import { useIsMobileWidthOrDevice } from '../responsive'
import ViewSpaceLink from '../spaces/ViewSpaceLink'
import { MutedSpan } from '../utils/MutedText'
import Segment from '../utils/Segment'

export type TopUsersCardProps = ComponentProps<'div'>

export default function TopUsersCard({ ...props }: TopUsersCardProps) {
  const myAddress = useMyAddress() ?? ''
  const { data, loading } = useFetchTopUsers()
  const { data: totalStake } = useFetchTotalStake(myAddress)
  const isMobile = useIsMobileWidthOrDevice()
  const sendEvent = useSendEvent()

  const args = useMemo(
    () => ({
      ids: [...(data?.stakers ?? []), ...(data?.creators ?? [])].map(({ address }) => address),
    }),
    [data],
  )
  const { loading: loadingSpaces } = useFetchProfileSpaces(args)

  const isLoading = loading || !data || loadingSpaces

  const seeMoreButton = (
    <Button
      type='primary'
      ghost
      className='p-0 GapMini d-flex align-items-center'
      href={myAddress ? `/leaderboard/${myAddress}` : '/leaderboard'}
      style={{ height: 'auto', border: 'none', boxShadow: 'none' }}
      onClick={() => {
        if (myAddress) {
          sendEvent('leaderboard_my_stats_opened', {
            myStats: true,
            role: 'staker',
            eventSource: 'top_users',
            amountRange: getAmountRange(totalStake?.amount),
          })
        } else {
          sendEvent('leaderboard_global_stats_opened', {
            eventSource: 'top_users',
            amountRange: getAmountRange(totalStake?.amount),
          })
        }
      }}
    >
      <span>See more</span>
      <IoChevronForward />
    </Button>
  )

  const content = isLoading ? (
    <Skeleton />
  ) : (
    <>
      <div className='d-flex justify-content-between align-items-center'>
        <div className='d-flex align-items-center FontWeightSemibold GapMini'>
          <span className='FontSemilarge'>Weekly Top Users</span>
        </div>
        {isMobile && seeMoreButton}
      </div>
      <div
        className={clsx('mt-2', isMobile && 'GapNormal')}
        style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr' }}
      >
        <div className='d-flex flex-column FontSmall' style={{ minWidth: 0 }}>
          <MutedSpan className='FontWeightMedium mb-1'>Stakers</MutedSpan>
          <div className='d-flex flex-column GapTiny'>
            {data.stakers.map((staker, i) => (
              <UserInfo rank={i + 1} key={i} user={staker} />
            ))}
          </div>
        </div>
        <div
          className={clsx('d-flex flex-column FontSmall', !isMobile && 'mt-3 pt-2')}
          style={{ borderTop: !isMobile ? '1px solid #E2E8F0' : 'none', minWidth: 0 }}
        >
          <MutedSpan className='FontWeightMedium mb-1'>Creators</MutedSpan>
          <div className='d-flex flex-column GapTiny'>
            {data?.creators.map((creator, i) => (
              <UserInfo rank={i + 1} key={i} user={creator} />
            ))}
          </div>
        </div>
      </div>
      {!isMobile && <div className='d-flex justify-content-center mt-2'>{seeMoreButton}</div>}
    </>
  )

  if (isMobile) {
    return (
      <div {...props} className={clsx(props.className, 'p-3 pt-2.5')}>
        {content}
      </div>
    )
  }

  return (
    <Segment
      {...props}
      style={{ background: 'white', ...props.style }}
      className={clsx(props.className, 'p-3')}
    >
      {content}
    </Segment>
  )
}

function UserInfo({ rank, user }: { rank: number; user: { address: string; reward: string } }) {
  const profile = useSelectProfile(user.address)

  const avatar = (
    <Avatar asLink={!profile} address={user.address} avatar={profile?.content?.image} size={34} />
  )
  const name = (
    <span
      className='FontWeightMedium FontNormal'
      style={{
        minWidth: 0,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'relative',
        top: '2px',
      }}
    >
      {profile?.content?.name || truncateAddress(user.address)}
    </span>
  )
  return (
    <div className='d-flex align-items-center'>
      <div className='position-relative'>
        {profile ? <ViewSpaceLink space={profile.struct} title={avatar} /> : avatar}
        {[1, 2, 3].includes(rank) && (
          <Medal
            className='position-absolute FontTiny'
            style={{ bottom: -2, right: 6 }}
            rank={rank as 1 | 2 | 3}
          />
        )}
      </div>
      <div className='d-flex flex-column' style={{ minWidth: 0 }}>
        {profile ? (
          <ViewSpaceLink
            containerClassName='d-flex'
            className='d-flex'
            style={{ minWidth: 0 }}
            title={name}
            space={profile?.struct}
          />
        ) : (
          <ViewProfileLink
            className='ColorNormal'
            title={name}
            account={{ address: user.address }}
          />
        )}
        <div className='d-flex align-items-center ColorMuted GapMini'>
          <FormatBalance value={user.reward} currency='SUB' decimals={10} precision={2} />
        </div>
      </div>
    </div>
  )
}

function Medal({ rank, ...props }: ComponentProps<'div'> & { rank: 1 | 2 | 3 }) {
  const rankStyles: Record<number, CSSProperties> = {
    1: {
      backgroundColor: '#FCDF40',
      color: '#887304',
    },
    2: {
      backgroundColor: '#D4D4D4',
      color: '#8C8C8C',
    },
    3: {
      backgroundColor: '#DEA368',
      color: '#9B5E23',
    },
  }

  const style: CSSProperties = {
    ...rankStyles[rank],
    border: '1px solid white',
    width: '1rem',
    height: '1rem',
    borderRadius: '50%',
  }

  return (
    <div
      {...props}
      style={{ ...style, ...props.style }}
      className={clsx(
        'FontWeightMedium d-flex align-items-center justify-content-center',
        props.className,
      )}
    >
      <span>{rank}</span>
    </div>
  )
}
