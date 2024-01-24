import { Col, Row } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useGetActivityCountStat } from 'src/graphql/hooks'
import messages from 'src/messages'
import { useMyAddress } from '../auth/MyAccountsContext'
import { getSuperLikesStats, SuperLikesStat } from '../utils/datahub/active-staking'
import { Loading } from '../utils/index'
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

// const tailsViewOpt = [
//   { label: <AppstoreOutlined />, value: 'block' },
//   { label: <MenuOutlined />, value: 'inline' },
// ]

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

export type StatisticsProps = {
  statisticsData?: StatisticsDataType[]
  tilesView?: string
  period?: string
}

export function InnerStatistics(props: StatisticsProps) {
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

const cachedData: Record<number, StatType[]> = {}
export default function Statistics({ period, ...props }: StatisticsProps & { period: string }) {
  const address = useMyAddress()
  const getActivityCountStat = useGetActivityCountStat()

  const [data, setData] = useState<StatType[]>()
  const [isLoaded, setIsLoaded] = useState(false)
  const tilesView = 'block'
  // const [tilesView, setTilesView] = useState<string>('block')
  // const { isMobile } = useResponsiveSize()

  let constrainedPeriod = parseInt(period)
  if (constrainedPeriod > MAX_DAY_DIFF) constrainedPeriod = MAX_DAY_DIFF

  const dates = useMemo(() => {
    const currentDate = dayjs.utc().startOf('day').subtract(1, 'day')
    const startDate = currentDate.subtract(90, 'day')
    return getDatesBetweenDates(startDate, currentDate)
  }, [period])

  // const onRadioTilesChange = (e: any) => {
  //   setTilesView(e.target.value)
  // }

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
        cachedData[constrainedPeriod] = statisticsDataArr
        setData(statisticsDataArr)
        setIsLoaded(true)
      }
    }

    if (cachedData[constrainedPeriod]) {
      setData(cachedData[constrainedPeriod])
      setIsLoaded(true)
    } else {
      load()
    }

    return () => {
      isMounted = false
    }
  }, [address, period])

  return isLoaded ? (
    <InnerStatistics
      statisticsData={parseData(constrainedPeriod.toString(), dates, data)}
      tilesView={tilesView}
      period={period}
      {...props}
    />
  ) : (
    <Loading />
  )
}

function combineOldLikesAndSuperLikes(
  stats: StatType[],
  superLikesStats: SuperLikesStat,
): StatType[] {
  const likesStat = stats.find(
    stat => stat.activityType === 'PostReactionCreated,CommentReactionCreated',
  )
  if (!likesStat) return stats

  const totalSuperLikes = superLikesStats.data.reduce((acc, stat) => acc + stat.count, 0)
  likesStat.totalCount += superLikesStats.total
  likesStat.countByPeriod += totalSuperLikes
  likesStat.todayCount = superLikesStats.data[superLikesStats.data.length - 1].count

  const allLikesMap = new Map<string, StatsType>()
  likesStat.statisticsData.forEach(stat => allLikesMap.set(stat.format_date, stat))

  superLikesStats.data.forEach(stat => {
    const dateFormat = dayjs.utc(stat.dayUnixTimestamp * 1000).format('YYYY-MM-DD')
    if (dayjs.utc().startOf('day').format('YYYY-MM-DD') === dateFormat) return

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

const getDatesBetweenDates = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
  let dates: string[] = []
  let theDate = dayjs.utc(startDate)
  while (theDate <= endDate) {
    dates = [...dates, theDate.format('YYYY-MM-DD')]
    theDate = theDate.add(1, 'day')
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
