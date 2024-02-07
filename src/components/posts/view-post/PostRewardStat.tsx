import { Tooltip } from 'antd'
import clsx from 'clsx'
import { ComponentProps } from 'react'
import { TbCoins } from 'react-icons/tb'
import { FormatBalance } from 'src/components/common/balances'
import { useSelectPostReward } from 'src/rtk/features/activeStaking/hooks'

export type PostRewardStatProps = ComponentProps<'div'> & { postId: string }

export default function PostRewardStat({ postId, ...props }: PostRewardStatProps) {
  const reward = useSelectPostReward(postId)
  if (!reward?.isNotZero) return null

  let finalReward = '0'
  try {
    finalReward = (BigInt(reward.reward) + BigInt(reward.draftReward)).toString()
  } catch {}

  return (
    <div {...props} className={clsx(props.className)}>
      <div className='d-flex align-items-center GapMini FontWeightMedium ColorMuted'>
        <div className='position-relative d-flex align-items-center mr-1'>
          {BigInt(reward.draftReward) > 0 ? (
            <Tooltip
              className='d-flex align-items-center'
              title={
                <span>
                  {BigInt(reward.reward) > 0 && (
                    <>
                      <FormatBalance
                        withMutedDecimals={false}
                        value={reward.reward}
                        currency='SUB'
                        decimals={10}
                        precision={2}
                      />{' '}
                      earned +{' '}
                    </>
                  )}
                  <FormatBalance
                    withMutedDecimals={false}
                    value={reward.draftReward}
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
          title='Rewards earned depend on how many likes a post or comment gets, and how much SUB each liker has locked'
        >
          <span className='FontWeightSemibold'>
            <FormatBalance
              style={{ whiteSpace: 'nowrap' }}
              currency='SUB'
              decimals={10}
              precision={2}
              withMutedDecimals={false}
              value={finalReward}
            />
          </span>
          <span className='d-flex align-items-center GapMini'>earned</span>
        </Tooltip>
      </div>
    </div>
  )
}
