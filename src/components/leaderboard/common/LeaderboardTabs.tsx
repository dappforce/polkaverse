import { Tabs } from 'antd'
import Link from 'next/link'
import router from 'next/router'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getAmountRange } from 'src/utils/analytics'

export default function LeaderboardTabs({
  activeKey,
}: {
  activeKey: '' | 'user' | 'general' | 'stats'
}) {
  const myAddress = useMyAddress() ?? ''
  const sendEvent = useSendEvent()
  const { data: totalStake } = useFetchTotalStake(myAddress)

  return (
    <>
      <Tabs
        className='sm-hidden'
        activeKey={activeKey}
        onChange={key => {
          if (key === 'user') {
            sendEvent('leaderboard_my_stats_opened', {
              myStats: true,
              eventSource: 'leaderboard_tab',
              role: 'staker',
              amountRange: getAmountRange(totalStake?.amount),
            })
            router.push(`/leaderboard/${myAddress}?role=staker`, undefined, { shallow: true })
          } else if (key === 'general') {
            sendEvent('leaderboard_global_stats_opened', {
              eventSource: 'leaderboard_tab',
              amountRange: getAmountRange(totalStake?.amount),
            })
            router.push('/leaderboard', undefined, { shallow: true })
          } else if (key === 'stats') {
            sendEvent('leaderboard_activity_opened', {
              eventSource: 'leaderboard_tab',
              amountRange: getAmountRange(totalStake?.amount),
            })
            router.push('/stats', undefined, { shallow: true })
          }
        }}
      >
        {myAddress && (
          <Tabs.TabPane
            tab={
              <Link href={`/leaderboard/${myAddress}?role=staker`} shallow passHref>
                <a style={{ color: 'inherit' }}>My Staking Stats</a>
              </Link>
            }
            key='user'
          />
        )}
        <Tabs.TabPane
          tab={
            <Link href='/leaderboard' shallow passHref>
              <a style={{ color: 'inherit' }}>Global Staking Stats</a>
            </Link>
          }
          key='general'
        />
        <Tabs.TabPane
          tab={
            <Link href='/stats' shallow passHref>
              <a style={{ color: 'inherit' }}>Polkaverse Stats</a>
            </Link>
          }
          key='stats'
        />
      </Tabs>
      <Tabs
        className='lg-hidden'
        activeKey={activeKey}
        onChange={key => {
          if (key === 'user')
            router.push(`/leaderboard/${myAddress}?role=staker`, undefined, { shallow: true })
          else if (key === 'stats') router.push('/stats', undefined, { shallow: true })
          else if (key === 'general') router.push('/leaderboard', undefined, { shallow: true })
        }}
      >
        {myAddress && (
          <Tabs.TabPane
            tab={
              <Link href={`/leaderboard/${myAddress}?role=staker`} shallow passHref>
                <a style={{ color: 'inherit' }}>My Activity</a>
              </Link>
            }
            key='user'
          />
        )}
        <Tabs.TabPane
          tab={
            <Link href='/leaderboard' shallow passHref>
              <a style={{ color: 'inherit' }}>Total Activity</a>
            </Link>
          }
          key='general'
        />
        <Tabs.TabPane
          tab={
            <Link href='/stats' shallow passHref>
              <a style={{ color: 'inherit' }}>App Stats</a>
            </Link>
          }
          key='stats'
        />
      </Tabs>
    </>
  )
}
