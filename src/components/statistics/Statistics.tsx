import { AppstoreOutlined, MenuOutlined } from '@ant-design/icons'
import { isEmptyArray } from '@subsocial/utils'
import { Col, Radio, Row } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useGetActivityCountStat } from 'src/graphql/hooks'
import messages from 'src/messages'
import { useMyAddress } from '../auth/MyAccountsContext'
import { PageContent } from '../main/PageWrapper'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { getSuperLikesStats, SuperLikesStat } from '../utils/datahub/active-staking'
import { Loading } from '../utils/index'
import Section from '../utils/Section'
import { Stats } from '../utils/Stats'
import GraphModal from './ChartModal'
import style from './Statistics.module.sass'

export type ActivityEvent =
  | 'SpaceCreated'
  | 'SpaceFollowed'
  | 'PostCreated'
  | 'PostShared,CommentShared'
  | 'CommentCreated,CommentReplyCreated'
  | 'PostReactionCreated,CommentReactionCreated'
  | 'AccountFollowed'

export const eventArr = [
  'PostReactionCreated,CommentReactionCreated',
  'PostCreated',
  'CommentCreated,CommentReplyCreated',
  'SpaceCreated',
  'SpaceFollowed',
  // 'PostShared,CommentShared',
  'AccountFollowed',
]

export const periodOpt = [
  { label: 'Last 7 days', value: '7' },
  { label: 'Last month', value: '30' },
  { label: 'Last 3 months', value: '90' },
]

const tailsViewOpt = [
  { label: <AppstoreOutlined />, value: 'block' },
  { label: <MenuOutlined />, value: 'inline' },
]

type StatsType = {
  format_date: string
  count: number
}

type GraphDataType = {
  x: string
  y: number
}

export type StatisticsDataType = {
  activityType: ActivityEvent
  graphData: GraphDataType[]
  countByPeriod: number
  totalCount: number
  todayCount: number
}

export type StatType = {
  activityType: ActivityEvent
  countByPeriod: number
  totalCount: number
  todayCount: number
  statisticsData: StatsType[]
}

type FormProps = {
  statisticsData?: StatisticsDataType[]
  tilesView?: string
  period?: string
}

export function InnerStatistics(props: FormProps) {
  const [modalData, setModalData] = useState<StatisticsDataType>()
  const [openModal, setOpenModal] = useState<boolean>(false)

  const { statisticsData, tilesView, period } = props

  if (!statisticsData) return null

  const showModal = (activityType: ActivityEvent) => {
    setModalData(statisticsData.find(data => data.activityType === activityType))
    setOpenModal(true)
  }

  return (
    <>
      <Row className={style.DfGridParams}>
        {statisticsData.map(data => (
          <Col
            key={data.activityType}
            className={tilesView == 'inline' ? style.DfFullSize : style.DfColStatistics}
          >
            <div onClick={() => showModal(data.activityType)}>
              <Stats
                title={
                  messages.statistics[data?.activityType as ActivityEvent] + ' during the period'
                }
                total={data.countByPeriod}
                contentHeight={50}
                footer={
                  <Row justify='space-between'>
                    <Col>{data?.todayCount} today</Col>
                    <Col>{data?.totalCount} all time</Col>
                  </Row>
                }
                areaHeight={70}
                data={data?.graphData}
                className={style.DfStatCard}
              />
            </div>
          </Col>
        ))}
      </Row>
      <GraphModal
        open={openModal}
        statisticData={modalData}
        period={period}
        onClose={() => setOpenModal(false)}
      />
    </>
  )
}

const AFTER_PARACHAIN_MIGRATION_DATE = new Date(2022, 8, 1)
const MAX_DAY_DIFF = dayjs(new Date()).diff(AFTER_PARACHAIN_MIGRATION_DATE, 'days')

export function Statistics(props: FormProps) {
  const address = useMyAddress()
  const getActivityCountStat = useGetActivityCountStat()

  const [data, setData] = useState<StatType[]>()
  const [isLoaded, setIsLoaded] = useState(false)
  const [dates, setDates] = useState<string[]>([])
  const [period, setPeriod] = useState<string>('30')
  const [tilesView, setTilesView] = useState<string>('block')
  const { isMobile } = useResponsiveSize()

  let constrainedPeriod = parseInt(period)
  if (constrainedPeriod > MAX_DAY_DIFF) constrainedPeriod = MAX_DAY_DIFF

  if (isEmptyArray(dates)) {
    const currentDate = new Date()
    const formatDate = new Date(currentDate.setDate(currentDate.getDate() - 90))
    setDates(getDatesBetweenDates(formatDate, new Date()))
  }

  const onRadioChange = (e: any) => {
    setPeriod(e.target.value)
  }

  const onRadioTilesChange = (e: any) => {
    setTilesView(e.target.value)
  }

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setIsLoaded(false)

      const statisticsDataArrPromise = Promise.all(
        eventArr.map(async eventName => {
          const event = eventName as ActivityEvent
          return getActivityCountStat({ event, period: constrainedPeriod })
        }),
      )
      const superLikeDataPromise = getSuperLikesStats(constrainedPeriod)

      const [statisticsDataArr, superLikeData] = await Promise.all([
        statisticsDataArrPromise,
        superLikeDataPromise,
      ] as const)

      combineOldLikesAndSuperLikes(statisticsDataArr, superLikeData)

      if (isMounted) {
        setData(statisticsDataArr)
        setIsLoaded(true)
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [address, period])

  return (
    <PageContent meta={{ title: 'Statistics' }}>
      <Section title='Statistics'>
        <Row className={`${style.DfGridParams} my-3`}>
          <Col>
            <Radio.Group
              options={periodOpt}
              onChange={onRadioChange}
              value={period}
              optionType={'button'}
            />
          </Col>
          {!isMobile && (
            <Col className={style.DfNavButtonCol}>
              <Radio.Group
                options={tailsViewOpt}
                onChange={onRadioTilesChange}
                value={tilesView}
                optionType={'button'}
                className={style.DfTilesView}
              />
            </Col>
          )}
        </Row>
        {isLoaded ? (
          <InnerStatistics
            statisticsData={parseData(constrainedPeriod.toString(), dates, data)}
            tilesView={tilesView}
            period={period}
            {...props}
          />
        ) : (
          <Loading />
        )}
      </Section>
    </PageContent>
  )
}

function combineOldLikesAndSuperLikes(
  stats: StatType[],
  superLikesStats: SuperLikesStat[],
): StatType[] {
  const likesStat = stats.find(
    stat => stat.activityType === 'PostReactionCreated,CommentReactionCreated',
  )
  if (!likesStat) return stats

  const totalSuperLikes = superLikesStats.reduce((acc, stat) => acc + stat.count, 0)
  likesStat.totalCount += totalSuperLikes
  likesStat.countByPeriod += totalSuperLikes
  likesStat.todayCount = superLikesStats[superLikesStats.length - 1].count

  const allLikesMap = new Map<string, StatsType>()
  likesStat.statisticsData.forEach(stat => allLikesMap.set(stat.format_date, stat))

  superLikesStats.forEach(stat => {
    const dateFormat = dayjs(stat.dayUnixTimestamp * 1000).format('YYYY-MM-DD')
    const existingStat = allLikesMap.get(dateFormat)
    if (existingStat) {
      existingStat.count += stat.count
    } else {
      likesStat.statisticsData.push({ count: stat.count, format_date: dateFormat })
    }
  })

  likesStat.statisticsData.sort((a, b) => {
    return dayjs(a.format_date).unix() - dayjs(b.format_date).unix()
  })
  return stats
}

const getDatesBetweenDates = (startDate: Date, endDate: Date) => {
  let dates: string[] = []
  const theDate = new Date(startDate)
  while (theDate <= endDate) {
    dates = [...dates, dayjs(new Date(theDate)).format('YYYY-MM-DD')]
    theDate.setDate(theDate.getDate() + 1)
  }
  return dates
}

const parseData = (period: string, dates: string[], statData: StatType[] | undefined) => {
  const statisticsDataArr: StatisticsDataType[] = []
  if (!statData) return []

  for (const data of statData) {
    const { countByPeriod, totalCount, activityType, statisticsData, todayCount } = data
    const graphData: GraphDataType[] = []

    for (const item of dates.slice(dates.length - Number(period) - 1, dates.length)) {
      const statData = statisticsData.find(value => value.format_date === item)

      graphData.push({
        x: statData ? dayjs(statData.format_date).format('YYYY-MM-DD') : item,
        y: statData ? Number(statData.count) : 0,
      })
    }

    statisticsDataArr.push({
      activityType,
      graphData,
      countByPeriod,
      totalCount,
      todayCount,
    })
  }

  return statisticsDataArr
}

export default InnerStatistics
