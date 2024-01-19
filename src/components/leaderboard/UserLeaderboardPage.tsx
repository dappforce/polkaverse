import { Radio, Tooltip } from 'antd'
import { useState } from 'react'
import { SlQuestion } from 'react-icons/sl'
import { ReactNode } from 'react-markdown'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useFetchUserRewardHistory } from 'src/rtk/features/activeStaking/hooks'
import { useFetchUserStatistics } from 'src/rtk/features/leaderboard/hooks'
import { UserStatistics } from 'src/rtk/features/leaderboard/userStatistics'
import { truncateAddress } from 'src/utils/storage'
import { FormatBalance } from '../common/balances'
import { RewardHistoryPanel } from '../creators/RewardHistoryModal'
import { PageContent } from '../main/PageWrapper'
import AuthorSpaceAvatar from '../profiles/address-views/AuthorSpaceAvatar'
import DfCard from '../utils/cards/DfCard'
import { MutedSpan } from '../utils/MutedText'

const stats: Record<
  string,
  { title: string; value: (data: UserStatistics) => ReactNode; tooltip: string }[]
> = {
  creator: [
    {
      title: 'Likes I received this week',
      value: data => data.creator.likesCountByPeriod,
      tooltip: 'The amount of likes that all of your posts received this week',
    },
    {
      title: 'SUB earned this week',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.creator.earnedByPeriod ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip: 'The amount of SUB rewards you have earned this week from Active Staking rewards',
    },
    {
      title: 'Stakers that liked me this week',
      value: data => data.creator.stakersWhoLiked,
      tooltip: 'The amount of individual readers that liked at least one of your posts this week',
    },
    {
      title: 'SUB earned in total',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.creator.earnedTotal ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip: 'The total amount of SUB rewards you have earned from Active Staking rewards',
    },
  ],
  staker: [
    {
      title: 'Posts I liked this week',
      value: data => data.staker.likedPosts,
      tooltip: 'The number of individual posts that you liked this week',
    },
    {
      title: 'SUB earned this week',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.staker.earnedByPeriod ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip: 'The amount of SUB rewards you have earned this week from Active Staking rewards',
    },
    {
      title: 'Creators I liked this week',
      value: data => data.staker.likedCreators,
      tooltip:
        'The number of individual creators that you supported this week by liking at least one of their posts',
    },
    {
      title: 'SUB earned in total',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.staker.earnedTotal ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip:
        'The total amount of SUB rewards you have earned this week from Active Staking rewards',
    },
  ],
}

export default function UserLeaderboardPage({ address }: { address: string }) {
  const [tabState, setTabState] = useState<'staker' | 'creator'>('staker')
  const { data } = useFetchUserStatistics(address)
  const profile = useSelectProfile(address)

  const { data: rewardHistory, loading } = useFetchUserRewardHistory(address)

  return (
    <PageContent withLargerMaxWidth meta={{ title: 'Active Staking Dashboard' }}>
      <div className='d-flex align-items-baseline justify-content-between'>
        <h1 className='DfUnboundedTitle ColorNormal mb-0'>Active Staking Dashboard</h1>
        <div className='d-flex align-items-center GapTiny'>
          <span>Role:</span>

          <Radio.Group
            className='DfRadioGroup'
            options={[
              { label: 'Staker', value: 'staker' },
              { label: 'Creator', value: 'creator' },
            ]}
            onChange={e => setTabState(e.target.value)}
            value={tabState}
            optionType='button'
          />
        </div>
      </div>
      {data && (
        <div
          className='mt-4 GapBig'
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}
        >
          <DfCard
            className='d-flex flex-column GapSmall align-items-center'
            variant='info'
            withShadow={false}
            style={{ gridRow: 'span 2' }}
          >
            {/* <div
            className='rounded-circle d-flex align-items-center justify-content-center'
            style={{ background: 'white', width: '88px', height: '88px' }}
          >
            <IoPeople style={{ fontSize: '42px', color: '#5089F8' }} />
          </div> */}
            <AuthorSpaceAvatar size={88} authorAddress={address} />
            <div className='d-flex flex-column align-items-center'>
              <span className='FontBig FontWeightSemibold'>
                {profile?.content?.name ?? truncateAddress(address)}
              </span>
              <MutedSpan>as a {tabState === 'creator' ? 'Creator' : 'Staker'}</MutedSpan>
            </div>
          </DfCard>
          {stats[tabState].map(stat => (
            <StatisticCard
              tooltip={stat.tooltip}
              title={stat.title}
              value={stat.value(data)}
              key={stat.title}
            />
          ))}
        </div>
      )}
      <div
        className='mt-4 GapLarge'
        style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}
      >
        <DfCard size='small' withShadow={false}>
          <RewardHistoryPanel
            title={tabState === 'creator' ? 'My Creator Rewards' : 'My Staker Rewards'}
            loading={loading}
            rewardHistory={rewardHistory}
            rewardType={tabState}
          />
        </DfCard>
        <DfCard size='small' withShadow={false}>
          <div className='d-flex flex-column'>
            <span className='FontSemilarge FontWeightSemibold'>Leaderboard</span>
            <MutedSpan className='FontSmall'>
              Stakers ranked based on the amount of SUB earned with Active Staking.
            </MutedSpan>
          </div>
          <div className='mt-3'>asdfasdfsdf</div>
        </DfCard>
      </div>
    </PageContent>
  )
}

function StatisticCard({
  title,
  value,
  tooltip,
}: {
  title: string
  value: ReactNode
  tooltip: string
}) {
  return (
    <DfCard size='small' className='d-flex flex-column GapMini' withShadow={false}>
      <div className='d-flex align-items-center ColorMuted GapTiny'>
        <span className='FontSmall'>{title}</span>
        <Tooltip title={tooltip}>
          <SlQuestion className='FontTiny' />
        </Tooltip>
      </div>
      <div className='d-flex align-items-center justify-content-between GapSmall mt-auto'>
        <span className='FontWeightMedium FontBig'>{value}</span>
        {/* <MutedSpan>+25 today</MutedSpan> */}
      </div>
    </DfCard>
  )
}
