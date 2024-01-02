import { Skeleton } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { SlQuestion } from 'react-icons/sl'
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

  const todayReward = data?.currentRewardAmount ?? 0
  const weekReward = data?.weeklyReward ?? 0 + todayReward
  const dayLeftUntilDistribution = DISTRIBUTION_DAY + 7 - new Date().getDay()

  return (
    <div {...props} className={clsx(styles.StakerRewardInfo, props.className)}>
      <div className={styles.Goal}>
        <div className={styles.GoalInfo}>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx(size === 'small' && 'FontSmall')}>
              {likesLeftToGoal <= 0 ? 'Goal achieved' : `Like ${likesLeftToGoal} more posts`}
            </MutedSpan>
            {/* TODO: add tooltip */}
            <SlQuestion className='FontTiny ColorMuted' />
          </div>
          <span className='FontWeightSemibold d-flex align-items-center'>
            {loading ? <NumberSkeleton /> : <span>{likeCount}</span>}
            <MutedSpan>/10</MutedSpan>
            {!!surplusLike && <span> +{surplusLike}</span>}
          </span>
        </div>
        <StakerRewardProgressBar size={size} className='mt-1' />
      </div>
      <div className='d-flex flex-column GapTiny mt-2'>
        <div className='d-flex justify-content-between'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx(size === 'small' && 'FontSmall')}>Approx. today</MutedSpan>
            {/* TODO: add tooltip */}
            <SlQuestion className='FontTiny ColorMuted' />
          </div>
          <span className='FontWeightSemibold d-flex align-items-center GapMini'>
            {loading ? <NumberSkeleton /> : <span>≈{todayReward} </span>}
            SUB
          </span>
        </div>
        <div className='d-flex justify-content-between'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx(size === 'small' && 'FontSmall')}>
              Approx. this week
            </MutedSpan>
            {/* TODO: add tooltip */}
            <SlQuestion className='FontTiny ColorMuted' />
          </div>
          <span className='FontWeightSemibold d-flex align-items-center GapMini'>
            {loading ? <NumberSkeleton /> : <span>≈{weekReward} </span>} SUB
          </span>
        </div>
        <div className='d-flex justify-content-between'>
          <div className='d-flex align-items-baseline GapMini'>
            <MutedSpan className={clsx(size === 'small' && 'FontSmall')}>Distribution in</MutedSpan>
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
