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
    >
      <TbCoins className='FontNormal' />
      <span className='FontWeightSemibold'>
        <FormatBalance
          style={{ whiteSpace: 'nowrap' }}
          currency='SUB'
          decimals={10}
          precision={2}
          withMutedDecimals={false}
          value={reward.amount}
        />
      </span>
      <span className='d-flex align-items-center GapMini ColorMuted'>earned</span>
    </div>
  )
}
