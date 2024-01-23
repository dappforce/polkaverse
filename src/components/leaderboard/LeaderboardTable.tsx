import { Button, Skeleton } from 'antd'
import clsx from 'clsx'
import { ComponentProps, useEffect, useMemo, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useFetchProfileSpaces, useSelectProfile } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/store'
import { useGetLeaderboardData } from 'src/rtk/features/leaderboard/hooks'
import {
  fetchLeaderboardData,
  LeaderboardData,
} from 'src/rtk/features/leaderboard/leaderboardSlice'
import { fetchProfileSpaces } from 'src/rtk/features/profiles/profilesSlice'
import { FormatBalance } from '../common/balances'
import { DEFAULT_MODAL_THRESHOLD } from '../lists'
import Avatar from '../profiles/address-views/Avatar'
import ViewSpaceLink from '../spaces/ViewSpaceLink'
import { useSubsocialApi } from '../substrate'
import { Loading } from '../utils'
import CustomModal, { CustomModalProps } from '../utils/CustomModal'
import { LeaderboardRole, LEADERBOARD_PAGE_LIMIT } from '../utils/datahub/leaderboard'
import { MutedSpan } from '../utils/MutedText'
import SpanSkeleton from '../utils/SpanSkeleton'
import styles from './LeaderboardTable.module.sass'

export type LeaderboardTableProps = ComponentProps<'div'> & {
  role: LeaderboardRole
}

export default function LeaderboardTable({ role, ...props }: LeaderboardTableProps) {
  const [isOpenModal, setIsOpenModal] = useState(false)
  const { page, data } = useGetLeaderboardData(role)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (page === 0) {
      dispatch(fetchLeaderboardData({ role }))
    }
  }, [dispatch, role])

  const { addresses, slicedData } = useMemo(
    () => ({
      addresses: data.slice(0, LEADERBOARD_PAGE_LIMIT).map(row => row.address),
      slicedData: data.slice(0, LEADERBOARD_PAGE_LIMIT),
    }),
    [data],
  )
  const { loading } = useFetchProfileSpaces({ ids: addresses })

  return (
    <>
      <div
        {...props}
        className={clsx(styles.LeaderboardTable, 'FontWeightMedium FontSmall', props.className)}
      >
        <div className={clsx(styles.LeaderboardTitles, 'ColorMuted')}>
          <span>#</span>
          <span>Staker</span>
          <span>Rewards this week</span>
        </div>
        {slicedData.map(row => (
          <UserRow key={row.rank} data={row} loading={!!loading} />
        ))}
        <Button onClick={() => setIsOpenModal(true)} type='link' className={styles.ViewMore}>
          View more
        </Button>
      </div>
      <LeaderboardTableModal
        visible={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        role={role}
      />
    </>
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
    <div className={styles.LeaderboardRow}>
      <MutedSpan>{data.rank + 1}</MutedSpan>
      <div className='d-flex align-items-center' style={{ minWidth: 0 }}>
        {isLoading ? (
          <>
            <Skeleton.Avatar size={32} className='mr-2' />
            <SpanSkeleton />
          </>
        ) : (
          <>
            <Avatar address={data.address} avatar={profile?.content?.image} size={32} />
            {profile?.struct ? (
              <ViewSpaceLink
                containerStyle={{ minWidth: 0, display: 'flex' }}
                style={{ minWidth: 0, display: 'flex' }}
                space={profile?.struct}
                title={title}
              />
            ) : (
              title
            )}
          </>
        )}
      </div>
      <span style={{ textAlign: 'right' }}>
        <FormatBalance value={data.reward} currency='SUB' decimals={10} precision={2} />
      </span>
    </div>
  )
}

type LeaderboardTableModalProps = {
  role: LeaderboardRole
} & CustomModalProps
function LeaderboardTableModal({ role, ...props }: LeaderboardTableModalProps) {
  const { data, hasMore } = useGetLeaderboardData(role)
  const { subsocial } = useSubsocialApi()
  const dispatch = useAppDispatch()

  const loadMore = async () => {
    const { payload } = (await dispatch(fetchLeaderboardData({ role }))) as {
      payload: LeaderboardData
    }
    await dispatch(
      fetchProfileSpaces({ ids: payload.data.map(({ address }) => address), api: subsocial }),
    )
  }

  let wording = {
    title: 'Top Stakers this week',
    subtitle: 'Stakers ranked based on the amount of SUB earned with Active Staking.',
  }
  if (role === 'CREATOR') {
    wording = {
      title: 'Top Creators this week',
      subtitle: 'Creators ranked based on the amount of SUB earned with Active Staking.',
    }
  }

  return (
    <CustomModal {...props} {...wording} contentElementId='leaderboard-container'>
      <div className={clsx(styles.ModalTable, 'FontWeightMedium')}>
        <div className={clsx(styles.ModalTitles, 'ColorMuted')}>
          <span>#</span>
          <span>Staker</span>
          <span>Rewards this week</span>
        </div>
        <InfiniteScroll
          dataLength={data.length}
          pullDownToRefreshThreshold={DEFAULT_MODAL_THRESHOLD}
          next={loadMore}
          hasMore={hasMore}
          scrollableTarget='leaderboard-container'
          loader={<Loading className={styles.Loading} />}
        >
          {data.map(row => (
            <UserRow data={row} loading={false} key={row.rank} />
          ))}
        </InfiniteScroll>
      </div>
    </CustomModal>
  )
}
