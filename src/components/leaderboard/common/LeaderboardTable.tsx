import { Button, Skeleton } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
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
import { useMyAddress } from '../../auth/MyAccountsContext'
import { FormatBalance } from '../../common/balances'
import { DEFAULT_MODAL_THRESHOLD } from '../../lists'
import Avatar from '../../profiles/address-views/Avatar'
import { useSubsocialApi } from '../../substrate'
import { Loading } from '../../utils'
import CustomModal, { CustomModalProps } from '../../utils/CustomModal'
import { LeaderboardRole, LEADERBOARD_PAGE_LIMIT } from '../../utils/datahub/leaderboard'
import { MutedSpan } from '../../utils/MutedText'
import SpanSkeleton from '../../utils/SpanSkeleton'
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
          <UserRow role={role} key={row.rank} data={row} loading={!!loading} />
        ))}
        <Button onClick={() => setIsOpenModal(true)} type='link' className={styles.ViewMore}>
          View more
        </Button>
      </div>
      <LeaderboardTableModal
        isLoadingFirstBatchOfData={!!loading}
        visible={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        role={role}
      />
    </>
  )
}

function UserRow({
  data,
  loading,
  role,
}: {
  data: LeaderboardData['data'][number]
  loading: boolean
  role: LeaderboardRole
}) {
  const myAddress = useMyAddress()
  const profile = useSelectProfile(data.address)
  const isLoading = loading && !profile

  const isMyAddress = myAddress === data.address

  const title = (
    <span
      style={{ overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, whiteSpace: 'nowrap' }}
      className={clsx(!profile?.content?.name && 'ColorMuted')}
    >
      {profile?.content?.name ?? 'Unnamed'} {<MutedSpan>{isMyAddress ? '(you)' : ''}</MutedSpan>}
    </span>
  )

  return (
    <Link href={`/leaderboard/${data.address}?role=${role}`} passHref>
      <a
        className={clsx(
          styles.LeaderboardRow,
          role === 'creator' && styles.RowPink,
          myAddress === data.address && styles.Active,
          '!ColorNormal',
        )}
      >
        <MutedSpan>{data.rank + 1}</MutedSpan>
        <div className='d-flex align-items-center' style={{ minWidth: 0 }}>
          {isLoading ? (
            <>
              <Skeleton.Avatar size={32} className='mr-2' />
              <SpanSkeleton />
            </>
          ) : (
            <>
              <Avatar
                asLink={false}
                address={data.address}
                avatar={profile?.content?.image}
                size={32}
              />
              <span>{title}</span>
            </>
          )}
        </div>
        <span style={{ textAlign: 'right' }}>
          <FormatBalance
            alwaysShowDecimals
            value={data.reward}
            currency='SUB'
            decimals={10}
            precision={2}
          />
        </span>
      </a>
    </Link>
  )
}

type LeaderboardTableModalProps = {
  role: LeaderboardRole
  isLoadingFirstBatchOfData: boolean
} & CustomModalProps
function LeaderboardTableModal({
  role,
  isLoadingFirstBatchOfData,
  ...props
}: LeaderboardTableModalProps) {
  const { data, hasMore } = useGetLeaderboardData(role)
  const { subsocial } = useSubsocialApi()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isLoadingFirstBatchOfData) setIsLoading(true)
  }, [isLoadingFirstBatchOfData])

  const loadMore = async () => {
    const { payload } = (await dispatch(fetchLeaderboardData({ role }))) as {
      payload: LeaderboardData
    }
    setIsLoading(true)
    await dispatch(
      fetchProfileSpaces({ ids: payload.data.map(({ address }) => address), api: subsocial }),
    )
    setIsLoading(false)
  }

  let wording = {
    title: 'Top Stakers this week',
    subtitle: 'Stakers ranked based on the amount of SUB earned with Active Staking.',
  }
  if (role === 'creator') {
    wording = {
      title: 'Top Creators this week',
      subtitle: 'Creators ranked based on the amount of SUB earned with Active Staking.',
    }
  }

  return (
    <CustomModal
      {...props}
      {...wording}
      contentElementId='leaderboard-container'
      contentClassName={styles.ModalContent}
    >
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
            <UserRow role={role} data={row} loading={isLoading} key={row.rank} />
          ))}
        </InfiniteScroll>
      </div>
    </CustomModal>
  )
}
