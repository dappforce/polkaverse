import { Skeleton } from 'antd'
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
  const isMoreThanMax = likeCount > SUPER_LIKES_FOR_MAX_REWARD
  const surplusLike = isMoreThanMax ? likeCount - SUPER_LIKES_FOR_MAX_REWARD : 0
  const likesLeftToGoal = SUPER_LIKES_FOR_MAX_REWARD - likeCount

  const todayReward = data?.currentRewardAmount ?? '0'
  const weekReward = data?.weeklyReward ?? '0'
  const dayLeftUntilDistribution = DISTRIBUTION_DAY + 7 - dayjs.utc().get('day')

  return (
    <div {...props} className={clsx(styles.StakerRewardInfo, props.className)}>
      <div className={styles.Goal}>
        <div className={styles.GoalInfo}>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx('FontSmall')}>
              {likesLeftToGoal <= 0 ? 'Goal achieved' : `Like ${likesLeftToGoal} more posts`}
            </MutedSpan>
            {/* TODO: add tooltip */}
            <SlQuestion className='FontTiny ColorMuted' />
          </div>
          <span className='FontWeightSemibold d-flex align-items-center'>
            {loading ? (
              <NumberSkeleton />
            ) : (
              <span>{Math.min(likeCount, SUPER_LIKES_FOR_MAX_REWARD)}</span>
            )}
            <MutedSpan>/10</MutedSpan>
            {!!surplusLike && <span className='ml-1'> +{surplusLike}</span>}
          </span>
        </div>
        <StakerRewardProgressBar size={size} className='mt-1' />
      </div>
      <div className='d-flex flex-column GapTiny mt-2'>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx('FontSmall')}>Approx. today</MutedSpan>
            {/* TODO: add tooltip */}
            <SlQuestion className='FontTiny ColorMuted' />
          </div>
          <span className='FontWeightSemibold d-flex align-items-center GapMini'>
            {loading ? (
              <NumberSkeleton />
            ) : (
              <span>
                ≈<FormatBalance decimals={10} value={todayReward} isShort />{' '}
              </span>
            )}
          </span>
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx('FontSmall')}>Approx. this week</MutedSpan>
            {/* TODO: add tooltip */}
            <SlQuestion className='FontTiny ColorMuted' />
          </div>
          <span className='FontWeightSemibold d-flex align-items-center GapMini'>
            {loading ? (
              <NumberSkeleton />
            ) : (
              <span>
                ≈<FormatBalance value={weekReward.toString()} decimals={10} isShort />
              </span>
            )}
          </span>
        </div>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx('FontSmall')}>Distribution in</MutedSpan>
            {/* TODO: add tooltip */}
            <SlQuestion className='FontTiny ColorMuted' />
          </div>
          <span className='FontWeightSemibold'>
            <Pluralize count={dayLeftUntilDistribution} singularText='day' pluralText='days' />
          </span>
        </div>
      </div>
    </div>
  )
}

function NumberSkeleton() {
  return (
    <Skeleton.Input
      style={{
        height: '1em',
        width: '3ch',
        marginRight: '4px',
        borderRadius: '20px',
        position: 'relative',
        top: '1px',
      }}
    />
  )
}
