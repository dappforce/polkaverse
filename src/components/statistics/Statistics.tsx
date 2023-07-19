import { AppstoreOutlined, MenuOutlined } from '@ant-design/icons'
import { isEmptyArray, pluralize } from '@subsocial/utils'
import { Card, Col, Divider, Radio, Row } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import {
  useGetActiveUsersTotalCount,
  useGetActivityCountStat,
  useGetUserRetentionCount,
} from 'src/graphql/hooks'
import messages from 'src/messages'
import { useMyAddress } from '../auth/MyAccountsContext'
import { PageContent } from '../main/PageWrapper'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
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
  'SpaceCreated',
  'SpaceFollowed',
  'PostCreated',
  'PostShared,CommentShared',
  'CommentCreated,CommentReplyCreated',
  'PostReactionCreated,CommentReactionCreated',
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
                title={messages.statistics[data?.activityType as ActivityEvent] + ' today'}
                total={data.todayCount}
                contentHeight={50}
                footer={
                  <Row justify='space-between'>
                    <Col>{data?.countByPeriod} total</Col>
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

const retentionOpt = [
  { key: 'activeUsersTotalCountWithOnePost', label: 'Total Users', minPosts: 1 },
  { key: 'activeUsersTotalCountWithThreePost', label: 'Active Users  ', minPosts: 3 },
  { key: 'userRetentionCount', label: 'Retained users', minPosts: 2 },
]

type RetentionData = {
  activeUsersTotalCountWithOnePost: number
  activeUsersTotalCountWithThreePost: number
  userRetentionCount: number
}

type RetentionStatsProps = {
  period: string
}

const RetentionStats = ({ period }: RetentionStatsProps) => {
  const [retentionData, setRetentionData] = useState<RetentionData | undefined>()
  const getActiveUsersTotalCount = useGetActiveUsersTotalCount()
  const getUserRetentionCount = useGetUserRetentionCount()

  useEffect(() => {
    const load = async () => {
      const activeUsersTotalCountWithOnePost =
        (await getActiveUsersTotalCount({
          period,
          minPostNumber: 1,
        })) || 0

      const activeUsersTotalCountWithThreePost =
        (await getActiveUsersTotalCount({
          period,
          minPostNumber: 3,
        })) || 0

      const userRetentionCount =
        (await getUserRetentionCount({
          period,
          minPostNumber: 1,
          totalMinPostsNumber: 2,
        })) || 0

      setRetentionData({
        activeUsersTotalCountWithOnePost,
        activeUsersTotalCountWithThreePost,
        userRetentionCount,
      })
    }

    load()
  }, [period])

  const retentionStats = retentionOpt.map(({ key, label, minPosts = 0 }) => {
    const value = retentionData ? retentionData[key as keyof RetentionData] : 0

    return (
      <Card key={key} className={style.DfRetentionCard}>
        <div className={style.DfRetentionStats}>
          <div className={style.DfRetentionStatsLabel}>{label}</div>
          <div className={style.DfRetentionStatsValue}>{value}</div>
          <Divider className='my-2' />
          <div>{pluralize({ count: minPosts, singularText: 'action' })} per period</div>
        </div>
      </Card>
    )
  })

  return <div className={style.RetentionWrapper}>{retentionStats}</div>
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

      const statisticsDataArr = await Promise.all(
        eventArr.map(async eventName => {
          const event = eventName as ActivityEvent

          return getActivityCountStat({ event, period: constrainedPeriod })
        }),
      )

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
        <RetentionStats period={period} />

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
