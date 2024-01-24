import { Col, Radio, Row, Tabs } from 'antd'
import dynamic from 'next/dynamic'
import router from 'next/router'
import { useState } from 'react'
import { useMyAddress } from '../auth/MyAccountsContext'
import { PageContent } from '../main/PageWrapper'
import { StatisticsProps } from './Statistics'
import style from './Statistics.module.sass'

export const periodOpt = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last month', value: '30' },
  { label: 'Last 3 months', value: '90' },
]

const Statistics = dynamic(() => import('./Statistics'), { ssr: false })

export default function StatisticsPage(props: StatisticsProps) {
  const myAddress = useMyAddress()
  const [period, setPeriod] = useState<string>('30')

  const onRadioChange = (e: any) => {
    setPeriod(e.target.value)
  }

  return (
    <PageContent meta={{ title: 'Statistics' }} withLargerMaxWidth>
      <Tabs
        activeKey='stats'
        onChange={key => {
          if (key === 'general') router.push('/leaderboard')
          else if (key === 'user') router.push(`/leaderboard/${myAddress}?tab=staker`)
        }}
      >
        <Tabs.TabPane tab='My Staking Stats' key='user' />
        <Tabs.TabPane tab='Global Staking Stats' key='general' />
        <Tabs.TabPane tab='Polkaverse Activity' key='stats' />
      </Tabs>
      <Row className={`${style.DfGridParams} my-3`}>
        <Col>
          <Radio.Group
            options={periodOpt}
            onChange={onRadioChange}
            value={period}
            optionType={'button'}
          />
        </Col>
        {/* {!isMobile && (
          <Col className={style.DfNavButtonCol}>
            <Radio.Group
              options={tailsViewOpt}
              onChange={onRadioTilesChange}
              value={tilesView}
              optionType={'button'}
              className={style.DfTilesView}
            />
          </Col>
        )} */}
      </Row>
      <Statistics period={period} {...props} />
    </PageContent>
  )
}
