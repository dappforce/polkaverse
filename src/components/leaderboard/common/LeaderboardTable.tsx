import { Button, Skeleton, Tag } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { DfImage } from 'src/components/utils/DfImage'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchProfileSpaces, useSelectProfile } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/store'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { useGetLeaderboardData } from 'src/rtk/features/leaderboard/hooks'
import {
  fetchLeaderboardData,
  LeaderboardData,
} from 'src/rtk/features/leaderboard/leaderboardSlice'
import { fetchProfileSpaces } from 'src/rtk/features/profiles/profilesSlice'
import { getAmountRange } from 'src/utils/analytics'
import { truncateAddress } from 'src/utils/storage'
import { useMyAddress } from '../../auth/MyAccountsContext'
import { FormatBalance } from '../../common/balances'
import { DEFAULT_MODAL_THRESHOLD } from '../../lists'
import Avatar from '../../profiles/address-views/Avatar'
import { useSubsocialApi } from '../../substrate'
import { Loading } from '../../utils'
import CustomModal, { CustomModalProps } from '../../utils/CustomModal'
import { LeaderboardRole } from '../../utils/datahub/leaderboard'
import { MutedSpan } from '../../utils/MutedText'
import SpanSkeleton from '../../utils/SpanSkeleton'
import styles from './LeaderboardTable.module.sass'

export type LeaderboardTableProps = ComponentProps<'div'> & {
  role: LeaderboardRole
  currentUserRank?: {
    rank?: number
    reward: string
    address: string
  }
}

const TABLE_LIMIT = 10
export default function LeaderboardTable({
  role,
  currentUserRank,
  ...props
}: LeaderboardTableProps) {
  const [isOpenModal, setIsOpenModal] = useState(false)
  const { page, data } = useGetLeaderboardData(role)
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (page === 0) {
      dispatch(fetchLeaderboardData({ role }))
    }
  }, [dispatch, role])

  const { addresses, slicedData } = useMemo<{
    addresses: string[]
    slicedData: typeof data
  }>(() => {
    if (!currentUserRank || (currentUserRank?.rank ?? 0) < TABLE_LIMIT) {
      return {
        addresses: data.slice(0, TABLE_LIMIT).map(row => row.address),
        slicedData: data.slice(0, TABLE_LIMIT),
      }
    }
    return {
      addresses: [
        ...data.slice(0, TABLE_LIMIT - 1).map(row => row.address),
        currentUserRank.address,
      ],
      slicedData: [...data.slice(0, TABLE_LIMIT - 1), currentUserRank],
    }
  }, [data, currentUserRank])

  const { loading } = useFetchProfileSpaces({ ids: addresses })
  const isLoading = loading || page === 0

  return (
    <>
      <div
        {...props}
        className={clsx(styles.LeaderboardTable, 'FontWeightMedium FontSmall', props.className)}
      >
        <div className={clsx(styles.LeaderboardTitles, 'ColorMuted')}>
          <span>#</span>
          <span>Staker</span>
          <span style={{ textAlign: 'right' }}>Rewards</span>
        </div>
        {slicedData.length === 0 &&
          (isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => <UserRowSkeleton key={idx} />)
          ) : (
            <div
              className='d-flex flex-column justify-content-center align-items-center text-center pb-3'
              style={{ gridColumn: '1/4' }}
            >
              <DfImage src='/images/medals.png' preview={false} size={70} />
              <span className='FontSmall' style={{ color: '#64748B' }}>
                {role === 'creator'
                  ? 'Create great content and get the most likes to show up here!'
                  : 'Like the most posts to reach the top!'}
              </span>
            </div>
          ))}
        {slicedData.map(row => (
          <UserRow
            currentAddress={currentUserRank?.address}
            role={role}
            key={row.rank}
            data={row}
            loading={!!loading}
          />
        ))}
        {slicedData.length !== 0 && (
          <Button onClick={() => setIsOpenModal(true)} type='link' className={styles.ViewMore}>
            View more
          </Button>
        )}
      </div>
      <LeaderboardTableModal
        isLoadingFirstBatchOfData={!!loading}
        visible={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        role={role}
        currentAddress={currentUserRank?.address}
      />
    </>
  )
}

function UserRowSkeleton() {
  return (
    <a className={clsx(styles.LeaderboardRow)}>
      <SpanSkeleton style={{ width: '2ch' }} />
      <div className='d-flex align-items-center' style={{ minWidth: 0 }}>
        <Skeleton.Avatar size={32} className='mr-1' />
        <SpanSkeleton />
      </div>
      <span style={{ textAlign: 'right' }}>
        <SpanSkeleton />
      </span>
    </a>
  )
}

function UserRow({
  data,
  loading,
  role,
  currentAddress,
}: {
  data: LeaderboardData['data'][number]
  loading: boolean
  role: LeaderboardRole
  currentAddress?: string
}) {
  const myAddress = useMyAddress() ?? ''
  const sendEvent = useSendEvent()
  const profile = useSelectProfile(data.address)
  const { data: totalStake } = useFetchTotalStake(myAddress)
  const isLoading = loading && !profile

  const isMyAddress = myAddress === data.address

  return (
    <Link href={`/leaderboard/${data.address}?role=${role}`} passHref>
      <a
        onClick={() => {
          sendEvent('leaderboard_my_stats_opened', {
            myStats: isMyAddress,
            role,
            eventSource: 'leaderboard_table',
            amountRange: getAmountRange(totalStake?.amount),
          })
        }}
        className={clsx(
          styles.LeaderboardRow,
          role === 'creator' && styles.RowPink,
          (isMyAddress || currentAddress === data.address) && styles.Active,
          '!ColorNormal',
        )}
      >
        <MutedSpan>{data?.rank !== undefined && data.rank + 1}</MutedSpan>
        <div className='d-flex align-items-center' style={{ minWidth: 0, height: '41px' }}>
          {isLoading ? (
            <>
              <Skeleton.Avatar size={32} className='mr-1' />
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
              <div className='d-flex flex-column justify-content-center' style={{ minWidth: 0 }}>
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {profile?.content?.name || truncateAddress(data.address)}{' '}
                  <MutedSpan>
                    {isMyAddress ? (
                      <Tag color='blue' className='FontWeightNormal'>
                        you
                      </Tag>
                    ) : (
                      ''
                    )}
                  </MutedSpan>
                </span>
                <span
                  className='ColorMuted FontTiny FontWeightNormal'
                  style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
                >
                  {profile?.content?.summary}
                </span>
              </div>
            </>
          )}
        </div>
        <span style={{ textAlign: 'right' }}>
          <FormatBalance
            alwaysShowDecimals
            value={data.reward}
            currency='SUB'
            decimals={10}
            fixedDecimalsLength={2}
          />
        </span>
      </a>
    </Link>
  )
}

type LeaderboardTableModalProps = {
  role: LeaderboardRole
  isLoadingFirstBatchOfData: boolean
  currentAddress?: string
} & CustomModalProps
function LeaderboardTableModal({
  role,
  isLoadingFirstBatchOfData,
  currentAddress,
  ...props
}: LeaderboardTableModalProps) {
  const { data, hasMore } = useGetLeaderboardData(role)
  const { subsocial } = useSubsocialApi()
  const dispatch = useAppDispatch()

  const currentPageLoading = useRef(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentPageLoading.current === 0) setIsLoading(isLoadingFirstBatchOfData)
  }, [isLoadingFirstBatchOfData])

  const loadMore = async () => {
    const { payload } = (await dispatch(fetchLeaderboardData({ role }))) as {
      payload: LeaderboardData
    }
    // prevent race condition
    currentPageLoading.current += 1
    const currentPage = currentPageLoading.current
    setIsLoading(true)
    await dispatch(
      fetchProfileSpaces({ ids: payload.data.map(({ address }) => address), api: subsocial }),
    )
    if (currentPage === currentPageLoading.current) setIsLoading(false)
  }

  let wording = {
    title: 'Top Stakers this week',
    subtitle: 'Users ranked by the amount of SUB earned with Content Staking.',
  }
  if (role === 'creator') {
    wording = {
      title: 'Top Creators this week',
      subtitle: 'Creators ranked by the amount of SUB earned from their posts.',
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
            <UserRow
              currentAddress={currentAddress}
              role={role}
              data={row}
              loading={isLoading}
              key={row.rank}
            />
          ))}
        </InfiniteScroll>
      </div>
    </CustomModal>
  )
}
