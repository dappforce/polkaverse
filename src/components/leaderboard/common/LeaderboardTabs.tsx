import { Tabs } from 'antd'
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
        {myAddress && <Tabs.TabPane tab='My Staking Stats' key='user' />}
        <Tabs.TabPane tab='Global Staking Stats' key='general' />
        <Tabs.TabPane tab='Polkaverse Activity' key='stats' />
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
        {myAddress && <Tabs.TabPane tab='My Activity' key='user' />}
        <Tabs.TabPane tab='Total Activity' key='general' />
        <Tabs.TabPane tab='App Stats' key='stats' />
      </Tabs>
    </>
  )
}
