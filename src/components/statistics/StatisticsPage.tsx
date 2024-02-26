import { Col, Radio, Row } from 'antd'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import LeaderboardTabs from '../leaderboard/common/LeaderboardTabs'
import { PageContent } from '../main/PageWrapper'
import { StatisticsProps } from './Statistics'
import style from './Statistics.module.sass'

export const periodOpt = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last month', value: '30' },
]

const Statistics = dynamic(() => import('./Statistics'), { ssr: false })

export default function StatisticsPage(props: StatisticsProps) {
  const [period, setPeriod] = useState<string>('7')

  const onRadioChange = (e: any) => {
    setPeriod(e.target.value)
  }

  return (
    <PageContent meta={{ title: 'Statistics' }} withLargerMaxWidth>
      <LeaderboardTabs activeKey='stats' />
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
