import { Skeleton, Tooltip } from 'antd'
import clsx from 'clsx'
import capitalize from 'lodash/capitalize'
import { ComponentProps, ReactNode } from 'react'
import { TiWarningOutline } from 'react-icons/ti'
import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
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

export function PostRewardStatWrapper({
  postId,
  children,
}: {
  postId: string
  children: (props: { tooltip: ReactNode; reward: ReactNode; isZeroReward: boolean }) => ReactNode
}) {
  const reward = useSelectPostReward(postId)
  const post = useSelectPost(postId)
  const isComment = post?.post.struct.isComment
  const owner = post?.post.struct.ownerId
  const isMyPost = useIsMyAddress(post?.post.struct.ownerId)

  const { data: totalStake } = useFetchTotalStake(owner || '')

  const showCouldEarn = !totalStake?.hasStakedEnough && isMyPost

  let tooltip = null
  if (!reward) {
    tooltip = null
  } else if (showCouldEarn) {
    tooltip = (
      <>
        These are your potential SUB rewards for the week. Lock at least{' '}
        <FormatBalance value={MINIMUM_LOCK.toString()} decimals={10} currency='SUB' precision={2} />{' '}
        this week to be eligible to receive them
      </>
    )
  } else {
    tooltip = generateTooltip(reward.rewardsBySource, isComment ? 'comment' : 'post')
  }

  return (
    <>
      {children({
        isZeroReward: !reward?.isNotZero,
        tooltip: reward?.isNotZero ? tooltip : null,
        reward: !reward ? (
          <>
            <Skeleton className={styles.Skeleton} paragraph={false} round /> SUB
          </>
        ) : (
          <span
            className='d-flex align-items-center GapMini FontWeightMedium'
            style={{ color: showCouldEarn ? '#F89A42' : 'inherit' }}
          >
            {showCouldEarn && <TiWarningOutline className='FontNormal' />}
            <FormatBalance
              style={{ whiteSpace: 'nowrap' }}
              currency='SUB'
              decimals={10}
              precision={2}
              withMutedDecimals={false}
              value={reward.reward}
            />
          </span>
        ),
      })}
    </>
  )
}

export default function PostRewardStat({ postId, ...props }: PostRewardStatProps) {
  return (
    <PostRewardStatWrapper postId={postId}>
      {({ reward, tooltip, isZeroReward }) =>
        isZeroReward ? null : (
          <div {...props} className={props.className}>
            <Tooltip title={tooltip} className={clsx('d-flex align-items-center')}>
              <span className={clsx('d-flex align-items-center GapTiny ColorMuted')}>{reward}</span>
            </Tooltip>
          </div>
        )
      }
    </PostRewardStatWrapper>
  )
}
