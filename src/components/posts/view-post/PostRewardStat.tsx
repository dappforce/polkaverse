import clsx from 'clsx'
import { ComponentProps } from 'react'
import { TbCoins } from 'react-icons/tb'
import { FormatBalance } from 'src/components/common/balances'
import { useSelectPostReward } from 'src/rtk/features/activeStaking/hooks'

export type PostRewardStatProps = ComponentProps<'div'> & { postId: string }

export default function PostRewardStat({ postId, ...props }: PostRewardStatProps) {
  const reward = useSelectPostReward(postId)
  if (!reward?.isNotZero) return null

  return (
    <div
      {...props}
      className={clsx('d-flex align-items-center GapMini FontWeightMedium', props.className)}
      style={{ alignSelf: 'end', ...props.style }}
    >
      <span className='d-flex align-items-center GapMini ColorMuted'>
        <TbCoins className='FontNormal' />
        <span>Rewards earned:</span>
      </span>
      <span className='FontWeightSemibold'>
        <FormatBalance
          currency='SUB'
          decimals={10}
          precision={2}
          withMutedDecimals={false}
          value={reward.amount}
        />
      </span>
    </div>
  )
}
