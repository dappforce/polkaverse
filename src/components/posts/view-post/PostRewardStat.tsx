import { simpleFormatBalance } from '@subsocial/utils'
import { Tooltip } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { TbCoins } from 'react-icons/tb'
import { FormatBalance } from 'src/components/common/balances'
import { useSelectPostReward } from 'src/rtk/features/activeStaking/hooks'
import { PostRewards } from 'src/rtk/features/activeStaking/postRewardSlice'

export type PostRewardStatProps = ComponentProps<'div'> & { postId: string }

function generateTooltip({
  fromCommentSuperLikes,
  fromDirectSuperLikes,
  fromShareSuperLikes,
}: PostRewards['rewardsBySource']) {
  let tooltip = `Post author has earned ${simpleFormatBalance(
    fromDirectSuperLikes,
    10,
  )} SUB from this post`
  if (BigInt(fromCommentSuperLikes) > 0) {
    tooltip += `, and another ${simpleFormatBalance(
      fromCommentSuperLikes,
      10,
    )} SUB from comment reward splitting`
  }
  if (BigInt(fromShareSuperLikes) > 0) {
    tooltip += `, and ${simpleFormatBalance(fromShareSuperLikes, 10)} SUB from shares of this post`
  }
  return tooltip
}

export default function PostRewardStat({ postId, ...props }: PostRewardStatProps) {
  const reward = useSelectPostReward(postId)
  if (!reward?.isNotZero) return null

  return (
    <div {...props} className={clsx(props.className)}>
      <div className='d-flex align-items-center GapMini FontWeightMedium ColorMuted'>
        <div className='position-relative d-flex align-items-center mr-1'>
          <TbCoins className='FontNormal' />
        </div>
        <Tooltip
          className='d-flex align-items-center GapMini'
          title={generateTooltip(reward.rewardsBySource)}
        >
          <span className='FontWeightSemibold'>
            <FormatBalance
              style={{ whiteSpace: 'nowrap' }}
              currency='SUB'
              decimals={10}
              precision={2}
              withMutedDecimals={false}
              value={reward.reward}
            />
          </span>
          <span className='d-flex align-items-center GapMini'>earned</span>
        </Tooltip>
      </div>
    </div>
  )
}
