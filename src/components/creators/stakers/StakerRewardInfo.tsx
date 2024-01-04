import { Skeleton, Tooltip } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { ComponentProps } from 'react'
import { SlQuestion } from 'react-icons/sl'
import { FormatBalance } from 'src/components/common/balances'
import { MutedSpan } from 'src/components/utils/MutedText'
import { Pluralize } from 'src/components/utils/Plularize'
import { CREATORS_CONSTANTS } from 'src/config/constants'
import { useFetchUserRewardReport } from 'src/rtk/features/activeStaking/hooks'
import styles from './StakerRewardInfo.module.sass'
import StakerRewardProgressBar, { StakerRewardProgressBarProps } from './StakerRewardProgressBar'

const { DISTRIBUTION_DAY, SUPER_LIKES_FOR_MAX_REWARD } = CREATORS_CONSTANTS

export type StakerRewardInfoProps = Omit<ComponentProps<'div'>, 'size'> &
  Pick<StakerRewardProgressBarProps, 'size'>

export default function StakerRewardInfo({ size, ...props }: StakerRewardInfoProps) {
  const { data, loading } = useFetchUserRewardReport()

  const likeCount = data?.superLikesCount ?? 0
  const likesLeftToGoal = SUPER_LIKES_FOR_MAX_REWARD - likeCount

  const todayReward = data?.currentRewardAmount ?? '0'
  const weekReward = data?.weeklyReward ?? '0'
  const dayLeftUntilDistribution = DISTRIBUTION_DAY + 7 - dayjs.utc().get('day')

  return (
    <div {...props} className={clsx(styles.StakerRewardInfo, props.className)}>
      <div className={clsx(styles.Goal, 'pb-1')}>
        <div className={styles.GoalInfo}>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx('FontSmall')}>
              {likesLeftToGoal <= 0 ? 'Goal achieved' : `Like ${likesLeftToGoal} more posts`}
            </MutedSpan>
            <Tooltip title='Each post you like, up to a maximum of 10, will boost your rewards for today'>
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
            <MutedSpan className={clsx('FontSmall')}>Earned today</MutedSpan>
            <Tooltip title='The bonus rewards you have earned today from participating in Active Staking'>
              <SlQuestion className='FontTiny ColorMuted' />
            </Tooltip>
          </div>
          <span className='FontWeightSemibold d-flex align-items-center GapMini'>
            {loading ? (
              <NumberSkeleton />
            ) : (
              <span>
                ≈<FormatBalance currency='SUB' decimals={10} value={todayReward} precision={2} />{' '}
              </span>
            )}
          </span>
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx('FontSmall')}>Earned this week</MutedSpan>
            <Tooltip title='The bonus rewards you have earned this week from participating in Active Staking'>
              <SlQuestion className='FontTiny ColorMuted' />
            </Tooltip>
          </div>
          <span className='FontWeightSemibold d-flex align-items-center GapMini'>
            {loading ? (
              <NumberSkeleton />
            ) : (
              <span>
                ≈
                <FormatBalance currency='SUB' value={weekReward} decimals={10} precision={2} />
              </span>
            )}
          </span>
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx('FontSmall')}>Distribution in</MutedSpan>
            <Tooltip title='How long until you will receive your bonus staking rewards for this week'>
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

export function StakerSuperLikeCount() {
  const { data, loading } = useFetchUserRewardReport()

  const likeCount = data?.superLikesCount ?? 0
  const isMoreThanMax = likeCount > SUPER_LIKES_FOR_MAX_REWARD
  const surplusLike = isMoreThanMax ? likeCount - SUPER_LIKES_FOR_MAX_REWARD : 0

  return (
    <span className='FontWeightSemibold d-flex align-items-center'>
      {loading ? (
        <NumberSkeleton />
      ) : (
        <span>{Math.min(likeCount, SUPER_LIKES_FOR_MAX_REWARD)}</span>
      )}
      <MutedSpan>/10</MutedSpan>
      {!!surplusLike && <span className='ml-1'> +{surplusLike}</span>}
    </span>
  )
}

function NumberSkeleton() {
  return (
    <div className='d-flex align-items-center'>
      <Skeleton.Input
        style={{
          height: '1em',
          width: '3ch',
          marginRight: '4px',
          borderRadius: '20px',
          position: 'relative',
          top: '1px',
          display: 'block',
        }}
      />
    </div>
  )
}
