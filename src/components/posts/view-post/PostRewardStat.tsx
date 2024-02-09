import { Tooltip } from 'antd'
import clsx from 'clsx'
import capitalize from 'lodash/capitalize'
import { ComponentProps } from 'react'
import { TbCoins } from 'react-icons/tb'
import { FormatBalance, formatBalanceToJsx } from 'src/components/common/balances'
import { useSelectPost } from 'src/rtk/app/hooks'
import { useSelectPostReward } from 'src/rtk/features/activeStaking/hooks'
import { PostRewards } from 'src/rtk/features/activeStaking/postRewardSlice'

export type PostRewardStatProps = ComponentProps<'div'> & { postId: string }

function generateTooltip(
  {
    fromCommentSuperLikes,
    fromDirectSuperLikes,
    fromShareSuperLikes,
  }: PostRewards['rewardsBySource'],
  entity: 'post' | 'comment',
) {
  let tooltip = `${capitalize(entity)} author has earned ${formatBalanceToJsx({
    value: fromDirectSuperLikes,
    precision: 2,
    currency: 'SUB',
    decimals: 10,
  })} SUB from this ${entity}`
  if (BigInt(fromCommentSuperLikes) > 0 && entity === 'post') {
    tooltip += `, and another ${formatBalanceToJsx({
      value: fromCommentSuperLikes,
      precision: 2,
      currency: 'SUB',
      decimals: 10,
    })} SUB from comment reward splitting`
  }
  if (BigInt(fromShareSuperLikes) > 0) {
    tooltip += `, and ${formatBalanceToJsx({
      value: fromShareSuperLikes,
      precision: 2,
      currency: 'SUB',
      decimals: 10,
    })} SUB from shares of this ${entity}`
  }
  return tooltip
}

export default function PostRewardStat({ postId, ...props }: PostRewardStatProps) {
  const reward = useSelectPostReward(postId)
  const post = useSelectPost(postId)
  const isComment = post?.post.struct.isComment
  if (!reward?.isNotZero) return null

  return (
    <div {...props} className={clsx(props.className)}>
      <div className='d-flex align-items-center GapMini FontWeightMedium ColorMuted'>
        <div className='position-relative d-flex align-items-center mr-1'>
          <TbCoins className='FontNormal' />
        </div>
        <Tooltip
          className='d-flex align-items-center GapMini'
          title={generateTooltip(reward.rewardsBySource, isComment ? 'comment' : 'post')}
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
