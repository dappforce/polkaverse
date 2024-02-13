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
  const formatBalance = (value: string) =>
    formatBalanceToJsx({
      value,
      precision: 2,
      currency: 'SUB',
      decimals: 10,
      withMutedDecimals: false,
    })
  return (
    <div>
      <span>{capitalize(entity)} author rewards:</span>
      <ul className='pl-3 mb-1'>
        <li>
          {formatBalance(fromDirectSuperLikes)} from direct likes on this {entity}
        </li>
        {BigInt(fromCommentSuperLikes) > 0 && entity === 'post' && (
          <li>
            {formatBalance(fromCommentSuperLikes)} from the likes on comments to this {entity}
          </li>
        )}
        {BigInt(fromShareSuperLikes) > 0 && (
          <li>
            {formatBalance(fromShareSuperLikes)} from the likes on shared posts of this {entity}
          </li>
        )}
      </ul>
    </div>
  )
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
          {BigInt(reward.rewardDetail.draftReward) > 0 ? (
            <Tooltip
              className='d-flex align-items-center'
              title={
                <span>
                  {BigInt(reward.rewardDetail.finalizedReward) > 0 && (
                    <>
                      <FormatBalance
                        withMutedDecimals={false}
                        value={reward.rewardDetail.finalizedReward}
                        currency='SUB'
                        decimals={10}
                        precision={2}
                      />{' '}
                      earned +{' '}
                    </>
                  )}
                  <FormatBalance
                    withMutedDecimals={false}
                    value={reward.rewardDetail.draftReward}
                    currency='SUB'
                    decimals={10}
                    precision={2}
                  />{' '}
                  approx. today
                </span>
              }
            >
              <TbCoins className='FontNormal' />
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  background: '#F8963A',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  borderRadius: '50%',
                }}
              />
            </Tooltip>
          ) : (
            <TbCoins className='FontNormal' />
          )}
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
