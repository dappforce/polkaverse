import { Button, Radio } from 'antd'
import clsx from 'clsx'
import router, { useRouter } from 'next/router'
import { useState } from 'react'
import { ReactNode } from 'react-markdown'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useFetchUserRewardHistory } from 'src/rtk/features/activeStaking/hooks'
import { useFetchUserStatistics } from 'src/rtk/features/leaderboard/hooks'
import { UserStatistics } from 'src/rtk/features/leaderboard/userStatisticsSlice'
import { getContentStakingLink } from 'src/utils/links'
import { truncateAddress } from 'src/utils/storage'
import { useAuth } from '../auth/AuthContext'
import { useMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance, formatBalanceToJsx } from '../common/balances'
import RewardHistoryModal, { RewardHistoryPanel } from '../creators/RewardHistoryModal'
import { PageContent } from '../main/PageWrapper'
import { useIsMobileWidthOrDevice } from '../responsive'
import DfCard from '../utils/cards/DfCard'
import { LeaderboardRole } from '../utils/datahub/leaderboard'
import { DfImage } from '../utils/DfImage'
import { MutedSpan } from '../utils/MutedText'
import LeaderboardTable from './common/LeaderboardTable'
import LeaderboardTabs from './common/LeaderboardTabs'
import ProfileCard from './common/ProfileCard'
import StatisticCard from './common/StatisticCard'
import styles from './UserLeaderboardPage.module.sass'

type Stat = {
  title: (isMyAddress: boolean) => string
  value: (data: UserStatistics) => ReactNode
  tooltip: (isMyAddress: boolean) => string
}
const stats: Record<LeaderboardRole, Stat[]> = {
  creator: [
    {
      title: isMyAddress =>
        isMyAddress ? 'Likes I received this week' : 'Likes received this week',
      value: data => data.creator.likesCountByPeriod,
      tooltip: isMyAddress =>
        isMyAddress
          ? 'The amount of likes that all of your posts and comments received this week'
          : "The amount of likes that all of this user's posts and comments received this week",
    },
    {
      title: () => 'SUB earned this week',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.creator.earnedByPeriod ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip: isMyAddress =>
        isMyAddress
          ? 'The amount of SUB rewards you have earned this week from Content Staking rewards'
          : 'The amount of SUB rewards this user has earned this week from Content Staking rewards',
    },
    {
      title: isMyAddress =>
        isMyAddress ? 'Stakers that liked me this week' : 'Stakers that liked this week',
      value: data => data.creator.stakersWhoLiked,
      tooltip: isMyAddress =>
        isMyAddress
          ? 'The amount of individual stakers that liked at least one of your posts or comments this week'
          : "The amount of individual stakers that liked at least one of this user's posts or comments this week",
    },
    {
      title: () => 'SUB earned in total',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.creator.earnedTotal ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip: isMyAddress =>
        isMyAddress
          ? 'The total amount of SUB rewards you have earned from Content Staking rewards'
          : 'The total amount of SUB rewards this user has earned from Content Staking rewards',
    },
  ],
  staker: [
    {
      title: isMyAddress => (isMyAddress ? 'Posts I liked this week' : 'Posts liked this week'),
      value: data => data.staker.likedPosts,
      tooltip: isMyAddress =>
        isMyAddress
          ? 'The number of individual posts or comments that you liked this week'
          : 'The number of individual posts or comments this user liked this week',
    },
    {
      title: () => 'SUB earned this week',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.staker.earnedByPeriod ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip: isMyAddress =>
        isMyAddress
          ? 'The amount of SUB rewards you have earned this week from Content Staking rewards'
          : 'The amount of SUB rewards this user has earned this week from Content Staking rewards',
    },
    {
      title: isMyAddress =>
        isMyAddress ? 'Creators I liked this week' : 'Creators liked this week',
      value: data => data.staker.likedCreators,
      tooltip: isMyAddress =>
        isMyAddress
          ? 'The number of individual creators that you supported this week by liking at least one of their posts or comments'
          : 'The number of individual creators that this user supported this week by liking at least one of their posts or comments',
    },
    {
      title: () => 'SUB earned in total',
      value: data => (
        <FormatBalance
          withMutedDecimals={false}
          precision={2}
          value={data.staker.earnedTotal ?? '0'}
          currency='SUB'
          decimals={10}
        />
      ),
      tooltip: isMyAddress =>
        isMyAddress
          ? 'The total amount of SUB rewards you have earned this week from Content Staking rewards'
          : 'The total amount of SUB rewards this user has earned from Content Staking rewards',
    },
  ],
}

const rankTooltip: Record<LeaderboardRole, (isMyAddress: boolean) => string> = {
  staker: isMyAddress =>
    isMyAddress
      ? 'Your position on the staker leaderboard'
      : "This user's position on the staker leaderboard",
  creator: isMyAddress =>
    isMyAddress
      ? 'Your position on the creator leaderboard'
      : "This user's position on the creator leaderboard",
}

export type UserLeaderboardPageProps = {
  address: string
  customMeta?: {
    image?: string
  }
}
export default function UserLeaderboardPage({
  address: initialPropsAddress,
  customMeta,
}: UserLeaderboardPageProps) {
  const { query } = useRouter()
  const address = (query.address as string) || initialPropsAddress
  const myAddress = useMyAddress()
  const profile = useSelectProfile(address)

  let tabState = query.role as LeaderboardRole
  if (tabState !== 'staker' && tabState !== 'creator') {
    tabState = 'staker'
  }

  const { data } = useFetchUserStatistics(address)
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false)
  const isMobile = useIsMobileWidthOrDevice()
  const { balance: availableBalance } = useAuth()

  const { data: rewardHistory, loading } = useFetchUserRewardHistory(address)

  const isMyAddress = address === myAddress

  const name = profile?.content?.name
  const title = name
    ? 'Leaderboard of ' + profile?.content?.name
    : `Leaderboard of ${truncateAddress(address)}`
  return (
    <PageContent
      withLargerMaxWidth
      meta={{
        title: title,
        desc: profile?.content?.summary,
        image: customMeta?.image || profile?.content?.image,
      }}
    >
      <LeaderboardTabs activeKey={isMyAddress ? 'user' : ''} />
      {data && (
        <div className={clsx(styles.Statistics)}>
          <ProfileCard
            rank={data[tabState]?.rank}
            rankTooltip={rankTooltip[tabState]?.(isMyAddress)}
            variant={tabState === 'creator' ? 'pink' : 'blue'}
            address={address}
            detail={
              <Radio.Group
                className={clsx('DfRadioGroup mt-2', tabState === 'staker' && 'Blue')}
                options={[
                  { label: 'Staker', value: 'staker' },
                  { label: 'Creator', value: 'creator' },
                ]}
                onChange={e => {
                  const value = e.target.value
                  router.push(`/leaderboard/${address}?role=${value}`, undefined, { shallow: true })
                }}
                value={tabState}
                optionType='button'
              />
            }
          />
          {stats[tabState].map(stat => (
            <StatisticCard
              tooltip={stat.tooltip(isMyAddress)}
              title={stat.title(isMyAddress)}
              value={stat.value(data)}
              key={stat.title(isMyAddress)}
            />
          ))}
        </div>
      )}
      <div className={styles.IncreaseRewardsAlert}>
        <DfImage preview={false} src='/images/coins.png' className={styles.Image} />
        <div className={clsx('d-flex flex-column GapMini')} style={{ marginLeft: '45px' }}>
          <span className={clsx(styles.WeightNormal, styles.Title)}>
            Increase your daily rewards by locking more SUB
          </span>
          <span className='FontSmall'>
            You can lock{' '}
            {formatBalanceToJsx({
              value: availableBalance.toString(),
              currency: '',
              decimals: 10,
              withMutedDecimals: false,
              precision: 2,
            })}
            more SUB to increase your future rewards
          </span>
        </div>
        <Button
          size='middle'
          type='primary'
          href={getContentStakingLink()}
          shape='round'
          target='_blank'
        >
          Lock SUB
        </Button>
      </div>
      <div className={clsx(styles.Leaderboard)}>
        <DfCard size='small' withShadow={false} className='sm-hidden'>
          <RewardHistoryPanel
            title={tabState === 'creator' ? 'Creator Rewards' : 'Staker Rewards'}
            description={`The last 30 days of ${
              isMyAddress ? 'my' : "this user's"
            } Content Staking rewards`}
            loading={loading}
            rewardHistory={rewardHistory}
            rewardType={tabState}
          />
        </DfCard>
        <DfCard size='small' withShadow={false} style={{ overflowX: 'clip', gridColumn: 'span 2' }}>
          <div className='d-flex flex-column'>
            <span className='FontSemilarge FontWeightSemibold'>
              {tabState === 'staker' ? 'Staker' : 'Creator'} Leaderboard
            </span>
            <MutedSpan className='FontSmall'>
              {tabState === 'staker'
                ? 'Users ranked by the amount of SUB earned with Content Staking this week.'
                : 'Creators ranked by the amount of SUB earned from their posts this week.'}
            </MutedSpan>
          </div>
          <LeaderboardTable
            className='mt-3'
            role={tabState}
            currentUserRank={
              data && { address, rank: data[tabState].rank, reward: data[tabState].earnedByPeriod }
            }
          />
        </DfCard>
      </div>
      <DfCard size='small' withShadow={false} className='lg-hidden mt-4'>
        <RewardHistoryPanel
          title={tabState === 'creator' ? 'Creator Rewards' : 'Staker Rewards'}
          description='The last 30 days of your Content Staking rewards'
          loading={loading}
          rewardHistory={rewardHistory}
          rewardType={tabState}
        />
      </DfCard>
      {isMobile && (
        <RewardHistoryModal
          visible={isOpenHistoryModal}
          onCancel={() => setIsOpenHistoryModal(false)}
        />
      )}
    </PageContent>
  )
}
