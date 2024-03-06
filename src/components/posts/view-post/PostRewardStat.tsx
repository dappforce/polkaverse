import { Tooltip } from 'antd'
import BN from 'bignumber.js'
import clsx from 'clsx'
import capitalize from 'lodash/capitalize'
import { ComponentProps } from 'react'
import { TbCoins } from 'react-icons/tb'
import { FormatBalance, formatBalanceToJsx } from 'src/components/common/balances'
import { MINIMUM_LOCK } from 'src/config/constants'
import { useSelectPost } from 'src/rtk/app/hooks'
import { useSelectPostReward } from 'src/rtk/features/activeStaking/hooks'
import { PostRewards } from 'src/rtk/features/activeStaking/postRewardSlice'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import styles from './helpers.module.sass'

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
  const owner = post?.post.struct.ownerId

  const { data: totalStake } = useFetchTotalStake(owner || '')
  if (!reward?.isNotZero) return null

  const totalStakeAmount = new BN(totalStake?.amount || '0')

  return (
    <div {...props} className={clsx(props.className)}>
      <div className='d-flex align-items-center GapMini FontWeightMedium ColorMuted'>
        {totalStakeAmount.isZero() ? (
          <Tooltip
            className='d-flex align-items-center GapMini'
            title={
              <>
                These are your potential SUB rewards for the week. Lock at least{' '}
                <FormatBalance
                  value={MINIMUM_LOCK.toString()}
                  decimals={10}
                  currency='SUB'
                  precision={2}
                />{' '}
                this week to be eligible to receive them
              </>
            }
          >
            <div className='d-flex align-items-center'>
              <div className={styles.PotentialRewardsIcon}>
                <div className={styles.closeIcon}></div>
                <TbCoins className='FontNormal' />
              </div>
              <span className='FontWeightSemibold'>
                <FormatBalance
                  style={{ whiteSpace: 'nowrap' }}
                  currency='SUB'
                  decimals={10}
                  precision={2}
                  withMutedDecimals={false}
                  value={reward.reward || '0'}
                />
              </span>
              <span className='d-flex align-items-center GapMini'>could earn</span>
            </div>
          </Tooltip>
        ) : (
          <>
            <div className='position-relative d-flex align-items-center mr-1'>
              {BigInt(reward.rewardDetail.draftReward || '0') > 0 ? (
                <Tooltip
                  className='d-flex align-items-center'
                  title={
                    <span>
                      {BigInt(reward.rewardDetail.finalizedReward || '0') > 0 && (
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
          </>
        )}
      </div>
    </div>
  )
}
