import { LineChartOutlined } from '@ant-design/icons'
import { Skeleton, Tooltip } from 'antd'
import clsx from 'clsx'
import Link from 'next/link'
import { ComponentProps, useState } from 'react'
import { RiHistoryFill } from 'react-icons/ri'
import { SlQuestion } from 'react-icons/sl'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { FormatBalance } from 'src/components/common/balances'
import { MutedSpan } from 'src/components/utils/MutedText'
import { Pluralize } from 'src/components/utils/Plularize'
import { CREATORS_CONSTANTS } from 'src/config/constants'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchUserRewardReport } from 'src/rtk/features/activeStaking/hooks'
import { RewardReport } from 'src/rtk/features/activeStaking/rewardReportSlice'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getAmountRange } from 'src/utils/analytics'
import NumberSkeleton from '../common/NumberSkeleton'
import RewardHistoryModal from '../RewardHistoryModal'
import styles from './RewardInfo.module.sass'
import StakerRewardProgressBar, { StakerRewardProgressBarProps } from './StakerRewardProgressBar'

const { getDistributionDaysLeft, SUPER_LIKES_FOR_MAX_REWARD } = CREATORS_CONSTANTS

export type RewardInfoProps = ComponentProps<'div'> & {
  size?: StakerRewardProgressBarProps['size']
}

export default function RewardInfo({ size, ...props }: RewardInfoProps) {
  const sendEvent = useSendEvent()
  const myAddress = useMyAddress() ?? ''
  const { data: totalStake } = useFetchTotalStake(myAddress)
  const [isOpenRewardHistoryModal, setIsOpenRewardHistoryModal] = useState(false)
  const { data, loading } = useFetchUserRewardReport()

  if (loading) {
    return (
      <div className='p-3'>
        <Skeleton />
      </div>
    )
  }

  const hasCreatorReward = (data?.receivedLikes ?? 0) > 0

  return (
    <div {...props} className={clsx(styles.RewardInfo, props.className)}>
      <StakerRewardInfo rewardReport={data} size={size} loading={loading} />
      {hasCreatorReward && (
        <>
          <div className='pt-2 mt-2.5' style={{ borderTop: '1px solid #E2E8F0' }} />
          <CreatorRewardInfo rewardReport={data} size={size} loading={loading} />
        </>
      )}
      <div
        className='mt-3'
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderTop: '1px solid #dddddd',
          marginLeft: '-1rem',
          marginBottom: '-0.75rem',
          width: 'calc(100% + 2rem)',
        }}
      >
        <div
          className='py-2.5 px-3 d-flex justify-content-center align-items-center ColorPrimary FontWeightMedium GapTiny'
          onClick={() => {
            sendEvent('astake_reward_history_opened', {
              amountRange: getAmountRange(totalStake?.amount),
            })
            setIsOpenRewardHistoryModal(true)
          }}
          style={{ cursor: 'pointer', flex: 1, borderRight: '1px solid #dddddd' }}
        >
          <RiHistoryFill />
          <span className='FontSmall'>History</span>
        </div>

        <Link href={`/leaderboard/${myAddress}?role=staker`} passHref>
          <a
            className='py-2.5 px-3 d-flex justify-content-center align-items-center ColorPrimary FontWeightMedium GapTiny'
            onClick={() => {
              sendEvent('leaderboard_my_stats_opened', {
                myStats: true,
                eventSource: 'my_stats_banner',
                role: 'staker',
                amountRange: getAmountRange(totalStake?.amount),
              })
            }}
            style={{ cursor: 'pointer', flex: 1 }}
          >
            <LineChartOutlined />
            <span className='FontSmall'>My Stats</span>
          </a>
        </Link>
      </div>

      <RewardHistoryModal
        visible={isOpenRewardHistoryModal}
        onCancel={() => setIsOpenRewardHistoryModal(false)}
      />
    </div>
  )
}

type InnerRewardInfoProps = {
  rewardReport: RewardReport | undefined
  loading?: boolean
} & Pick<RewardInfoProps, 'size'>

function StakerRewardInfo({ rewardReport, loading, size }: InnerRewardInfoProps) {
  const todayReward = rewardReport?.currentRewardAmount ?? '0'
  const weekReward = rewardReport?.weeklyReward ?? '0'

  const likeCount = rewardReport?.superLikesCount ?? 0
  const likesToMaxReward = SUPER_LIKES_FOR_MAX_REWARD - likeCount

  const dayLeftUntilDistribution = getDistributionDaysLeft()

  return (
    <div className={clsx(styles.InnerRewardInfo, 'FontSmall')}>
      <span
        className={clsx('FontWeightSemibold pb-1', size === 'small' ? 'FontSmall' : 'FontNormal')}
      >
        Staker Rewards
      </span>
      <div className={clsx(styles.Goal, 'pb-1')}>
        <div className={styles.GoalInfo}>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan>
              {likesToMaxReward > 0 ? 'Daily activity target' : 'Daily target hit'}
            </MutedSpan>
            <Tooltip
              title={
                <>
                  <p className='mb-2'>
                    Each post or comment you like today, up to a maximum of 10, will boost your
                    rewards, and reward the authors of the posts or comments you like.
                  </p>
                  <p className='mb-0'>
                    Liking more than 10 posts or comments will spread the author rewards across more
                    authors, resulting in each author receiving fewer rewards.
                  </p>
                </>
              }
            >
              <SlQuestion className='FontTiny ColorMuted' />
            </Tooltip>
          </div>
          <StakerSuperLikeCount />
        </div>
        <StakerRewardProgressBar size={size} className='mt-1' />
      </div>
      <div className='d-flex flex-column GapTiny mt-2'>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan>Earned today</MutedSpan>
            <Tooltip title='The minimum bonus rewards you have earned today from Content Staking, which may increase depending on network activity'>
              <SlQuestion className='FontTiny ColorMuted' />
            </Tooltip>
          </div>
          <span className='FontWeightSemibold d-flex align-items-center GapMini'>
            {loading ? (
              <NumberSkeleton />
            ) : (
              <span>
                <MutedSpan>≥</MutedSpan>{' '}
                <FormatBalance
                  withMutedDecimals={false}
                  currency='SUB'
                  decimals={10}
                  value={todayReward}
                  precision={2}
                />
              </span>
            )}
          </span>
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan>Earned this week</MutedSpan>
            <Tooltip title='The bonus rewards you have earned this week from participating in Content Staking'>
              <SlQuestion className='FontTiny ColorMuted' />
            </Tooltip>
          </div>
          <span className='FontWeightSemibold d-flex align-items-center GapMini'>
            {loading ? (
              <NumberSkeleton />
            ) : (
              <span>
                <MutedSpan>≥</MutedSpan>{' '}
                <FormatBalance
                  withMutedDecimals={false}
                  currency='SUB'
                  value={weekReward}
                  decimals={10}
                  precision={2}
                />
              </span>
            )}
          </span>
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan>Distribution in</MutedSpan>
            <Tooltip title='The amount of time remaining until your bonus rewards for this week are deposited into your account'>
              <SlQuestion className='FontTiny ColorMuted' />
            </Tooltip>
          </div>
          <span className='FontWeightSemibold'>
            <Pluralize count={dayLeftUntilDistribution} singularText='day' pluralText='days' />
          </span>
        </div>
      </div>
    </div>
  )
}

function CreatorRewardInfo({ rewardReport, loading, size }: InnerRewardInfoProps) {
  return (
    <div className={clsx(styles.InnerRewardInfo, 'FontSmall')}>
      <span
        className={clsx('FontWeightSemibold pb-1', size === 'small' ? 'FontSmall' : 'FontNormal')}
      >
        Creator Rewards
      </span>
      <div className='d-flex flex-column GapTiny'>
        <div className='d-flex align-items-center justify-content-between'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan>Received likes</MutedSpan>
            <Tooltip title='The amount of times your posts and comments have been superliked this week'>
              <SlQuestion className='FontTiny ColorMuted' />
            </Tooltip>
          </div>
          <span className='FontWeightSemibold d-flex align-items-center GapMini'>
            {loading ? <NumberSkeleton /> : <span>{rewardReport?.receivedLikes}</span>}
          </span>
        </div>
        <div className='d-flex align-items-center justify-content-between'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan>Earned from posts</MutedSpan>
            <Tooltip title='The minimum amount of SUB that you will earn as a result of your posts and comments being superliked this week'>
              <SlQuestion className='FontTiny ColorMuted' />
            </Tooltip>
          </div>
          <span className='FontWeightSemibold d-flex align-items-center GapMini'>
            {loading ? (
              <NumberSkeleton />
            ) : (
              <span>
                <MutedSpan>≥</MutedSpan>{' '}
                <FormatBalance
                  withMutedDecimals={false}
                  currency='SUB'
                  decimals={10}
                  value={rewardReport?.creatorReward}
                  precision={2}
                />
              </span>
            )}
          </span>
        </div>
        <div className='d-flex align-items-center justify-content-between'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan>Distribution in</MutedSpan>
            <Tooltip title='The amount of time remaining until your bonus rewards for this week are deposited into your account'>
              <SlQuestion className='FontTiny ColorMuted' />
            </Tooltip>
          </div>
          <span className='FontWeightSemibold'>
            <Pluralize
              count={CREATORS_CONSTANTS.getDistributionDaysLeft()}
              singularText='day'
              pluralText='days'
            />
          </span>
        </div>
      </div>
    </div>
  )
}

export function StakerSuperLikeCount() {
  const { data, loading } = useFetchUserRewardReport()

  const likeCount = data?.superLikesCount ?? 0
  const surplusLikes = likeCount - SUPER_LIKES_FOR_MAX_REWARD

  return (
    <span className='FontWeightSemibold d-flex align-items-center'>
      {loading ? (
        <NumberSkeleton />
      ) : (
        <>
          <span>{Math.min(likeCount, SUPER_LIKES_FOR_MAX_REWARD)}</span>
          {surplusLikes > 0 && <span>+{surplusLikes}</span>}
        </>
      )}{' '}
      <MutedSpan className='ml-1'>likes</MutedSpan>
    </span>
  )
}
