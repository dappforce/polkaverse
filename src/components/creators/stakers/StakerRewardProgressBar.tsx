import { Progress } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { CREATORS_CONSTANTS } from 'src/config/constants'
import { useFetchUserRewardReport } from 'src/rtk/features/activeStaking/hooks'
import styles from './StakerRewardProgressBar.module.sass'

const { SUPER_LIKES_FOR_MAX_REWARD } = CREATORS_CONSTANTS

export type StakerRewardProgressBarProps = Omit<ComponentProps<'div'>, 'size'> & {
  size?: 'small' | 'default'
}

export default function StakerRewardProgressBar({
  size = 'default',
  ...props
}: StakerRewardProgressBarProps) {
  const { data } = useFetchUserRewardReport()

  const likeCount = data?.superLikesCount ?? 0

  let progress = (likeCount / SUPER_LIKES_FOR_MAX_REWARD) * 100
  let strokeColor = '#D232CF'
  if (progress >= 100) {
    strokeColor = '#32D255'
  }

  return (
    <div
      {...props}
      className={clsx(styles.StakerRewardProgressBar, props.className)}
      style={{
        ...props.style,
        gridTemplateColumns: progress <= 100 ? '1fr' : `1fr ${(progress - 100) / 100}fr`,
      }}
    >
      <Progress
        showInfo={false}
        percent={progress > 100 ? 100 : progress}
        strokeColor={strokeColor}
        trailColor='#CBD5E1'
        size={size}
      />
      {progress > 100 && (
        <Progress showInfo={false} percent={100} strokeColor='#5089F8' trailColor='#CBD5E1' />
      )}
    </div>
  )
}
