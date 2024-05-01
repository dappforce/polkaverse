import { Tabs } from 'antd'
import router from 'next/router'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import CustomLink from 'src/components/referral/CustomLink'
import config from 'src/config'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { useFetchTotalStake } from 'src/rtk/features/creators/totalStakeHooks'
import { getAmountRange } from 'src/utils/analytics'
import styles from './LeaderboardTable.module.sass'

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
        activeKey={activeKey}
        onChange={key => {
          if (key === 'user') {
            sendEvent('leaderboard_my_stats_opened', {
              myStats: true,
              eventSource: 'leaderboard_tab',
              role: 'staker',
              amountRange: getAmountRange(totalStake?.amount),
            })
            router.push(`/c/leaderboard/${myAddress}`, undefined, { shallow: true })
          } else if (key === 'general') {
            sendEvent('leaderboard_global_stats_opened', {
              eventSource: 'leaderboard_tab',
              amountRange: getAmountRange(totalStake?.amount),
            })
            router.push('/c/leaderboard', undefined, { shallow: true })
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
              <CustomLink
                href={`/c/leaderboard/${myAddress}`}
                className={styles.LinkTab}
                shallow
                passHref
              >
                <a style={{ color: 'inherit' }}>My Staking Stats</a>
              </CustomLink>
            }
            key='user'
          />
        )}
        <Tabs.TabPane
          tab={
            <CustomLink href='/c/leaderboard' className={styles.LinkTab} shallow passHref>
              <a style={{ color: 'inherit' }}>Global Staking Stats</a>
            </CustomLink>
          }
          key='general'
        />
        <Tabs.TabPane
          tab={
            <CustomLink href='/c/stats' shallow passHref>
              <a style={{ color: 'inherit' }}>{config.appName} Stats</a>
            </CustomLink>
          }
          key='stats'
        />
      </Tabs>
      {/* <Tabs
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
              <CustomLink href={`/leaderboard/${myAddress}?role=staker`} shallow passHref>
                <a style={{ color: 'inherit' }}>My Activity</a>
              </CustomLink>
            }
            key='user'
          />
        )}
        <Tabs.TabPane
          tab={
            <CustomLink href='/leaderboard' shallow passHref>
              <a style={{ color: 'inherit' }}>Total Activity</a>
            </CustomLink>
          }
          key='general'
        />
        <Tabs.TabPane
          tab={
            <CustomLink href='/stats' shallow passHref>
              <a style={{ color: 'inherit' }}>App Stats</a>
            </CustomLink>
          }
          key='stats'
        />
      </Tabs> */}
    </>
  )
}
