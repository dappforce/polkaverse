import { Button, Skeleton } from 'antd'
import clsx from 'clsx'
import { ComponentProps, useEffect, useMemo } from 'react'
import { useFetchProfileSpaces, useSelectProfile } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/store'
import { useGetLeaderboardData } from 'src/rtk/features/leaderboard/hooks'
import {
  fetchLeaderboardData,
  LeaderboardData,
} from 'src/rtk/features/leaderboard/leaderboardSlice'
import { FormatBalance } from '../common/balances'
import Avatar from '../profiles/address-views/Avatar'
import ViewSpaceLink from '../spaces/ViewSpaceLink'
import { LeaderboardRole, LEADERBOARD_PAGE_LIMIT } from '../utils/datahub/leaderboard'
import { MutedSpan } from '../utils/MutedText'
import SpanSkeleton from '../utils/SpanSkeleton'
import styles from './LeaderboardTable.module.sass'

export type LeaderboardTableProps = ComponentProps<'div'> & {
  role: LeaderboardRole
}

export default function LeaderboardTable({ role, ...props }: LeaderboardTableProps) {
  const { page, data } = useGetLeaderboardData(role)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (page === 0) {
      dispatch(fetchLeaderboardData({ role }))
    }
  }, [dispatch, role])

  const addresses = useMemo(
    () => data.slice(0, LEADERBOARD_PAGE_LIMIT).map(row => row.address),
    [data],
  )
  const { loading } = useFetchProfileSpaces({ ids: addresses })

  return (
    <div
      {...props}
      className={clsx(styles.LeaderboardTable, 'FontWeightMedium FontSmall', props.className)}
    >
      <div className={clsx(styles.LeaderboardTitles, 'ColorMuted')}>
        <span>#</span>
        <span>Staker</span>
        <span>Rewards this week</span>
      </div>
      {data.map(row => (
        <div className={styles.LeaderboardRow} key={row.rank}>
          <UserRow data={row} loading={!!loading} />
        </div>
      ))}
      <Button type='link' className={styles.ViewMore}>
        View more
      </Button>
    </div>
  )
}

function UserRow({ data, loading }: { data: LeaderboardData['data'][number]; loading: boolean }) {
  const profile = useSelectProfile(data.address)
  const isLoading = loading && !profile
  const title = (
    <span
      style={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, whiteSpace: 'nowrap' }}
    >
      {profile?.content?.name ?? 'Unnamed'}
    </span>
  )

  return (
    <>
      <MutedSpan>{data.rank + 1}</MutedSpan>
      <div className='d-flex align-items-center'>
        {isLoading ? (
          <>
            <Skeleton.Avatar size={32} className='mr-2' />
            <SpanSkeleton />
          </>
        ) : (
          <>
            <Avatar address={data.address} avatar={profile?.content?.image} size={32} />
            {profile?.struct ? <ViewSpaceLink space={profile?.struct} title={title} /> : title}
          </>
        )}
      </div>
      <span style={{ textAlign: 'right' }}>
        <FormatBalance value={data.reward} currency='SUB' decimals={10} precision={2} />
      </span>
    </>
  )
}
