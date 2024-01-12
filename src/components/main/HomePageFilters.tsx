import { Col, Radio, RadioChangeEvent, Row, Select } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import config from 'src/config'
import LatestPostsPage from '../posts/LatestPostsPage'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import LatestSpacesPage, { CreatorsSpaces } from '../spaces/LatestSpacesPage'
import style from './HomePage.module.sass'
import {
  DateFilterType,
  EntityFilter,
  PostFilterProps,
  PostFilterType,
  SpaceFilterProps,
  TabKeys,
} from './types'
import { setFiltersInUrl } from './utils'

const { enableGraphQl } = config

const commonFilterOption = [{ label: 'Latest', value: 'latest' }]

// const offchainPostFilterOpt = enableGraphQl
//   ? [
//       ...commonFilterOption,
//       { label: 'Most liked', value: 'liked' },
//       { label: 'Most commented', value: 'commented' },
//     ]
//   : []

export const postFilterOpt = [
  { label: 'Featured Posts', value: 'suggested' },
  { label: 'All Posts', value: 'latest' },
  // removed most liked and commented
  // ...offchainPostFilterOpt,
]

export const commentFilterOpt = enableGraphQl
  ? [
      ...commonFilterOption,
      { label: 'Most liked', value: 'liked' },
      { label: 'Most commented', value: 'commented' },
    ]
  : []

// const offchainSpaceFilterOpt = enableGraphQl
//   ? [
//       ...commonFilterOption,
//       { label: 'Sort by followers ', value: 'sortByFollowers' },
//       { label: 'Sort by posts', value: 'sortByPosts' },
//     ]
//   : []

export const spaceFilterOpt = [
  { label: 'Active Staking', value: 'suggested' },
  { label: 'Featured Creators', value: 'creators' },
  // ...offchainSpaceFilterOpt,
]

export const dateFilterOpt = [
  { label: '1 day', value: 'day' },
  { label: '7 days', value: 'week' },
  { label: '30 days', value: 'month' },
  { label: 'All time', value: 'allTime' },
]

export const filterByKey = {
  posts: postFilterOpt,
  comments: commentFilterOpt,
  spaces: spaceFilterOpt,
  creators: [],
}

type OnChangeFn = (value: any) => void

type Props = {
  tabKey: TabKeys
  isAffix?: boolean
}

export const PostFilterView = ({ filter: { type, date }, ...props }: PostFilterProps) => (
  <LatestPostsPage filter={type} dateFilter={date} {...props} />
)

export const SpaceFilterView = ({ filter: { type, date }, ...props }: SpaceFilterProps) => {
  if (type === 'creators') return <CreatorsSpaces />
  return <LatestSpacesPage filter={type} dateFilter={date} {...props} />
}

const onChangeWrap = (onChange: OnChangeFn) => (e: RadioChangeEvent) => onChange(e.target.value)

export const Filters = (props: Props) => {
  const { tabKey, isAffix } = props
  const { isMobile } = useResponsiveSize()

  const router = useRouter()

  const { type, date } = router.query

  if (tabKey === 'feed' || !enableGraphQl) return null

  const onFilterChange: any = (value: PostFilterType = 'suggested') =>
    setFiltersInUrl(router, tabKey, { type: value, date: date as DateFilterType })

  const onDateChange: any = (value: DateFilterType = 'week') =>
    setFiltersInUrl(router, tabKey, { type: type as EntityFilter, date: value })

  const needDateFilter = !!type && type !== 'latest' && type !== 'suggested' && type !== 'creators'

  if (!needDateFilter && !filterByKey[tabKey]?.length) return null

  return (
    <div className={`DfFilters ${!isAffix ? 'mt-3' : ''}`}>
      <Row className={style.DfGridParams}>
        {!isMobile ? (
          <Col className={needDateFilter ? style.DfCol : 'ant-col-24'}>
            <Radio.Group
              options={filterByKey[tabKey]}
              onChange={onChangeWrap(onFilterChange)}
              value={type}
              optionType={'button'}
            />
          </Col>
        ) : (
          <Col className={needDateFilter ? style.DfCol : 'ant-col-24'}>
            <Select
              value={type}
              onChange={onFilterChange}
              className={clsx('w-100', style.FilterSelect)}
            >
              {filterByKey[tabKey].map(({ label, value }) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
        {needDateFilter && (
          <Col className={style.DfDateCol}>
            <Select
              value={date}
              className='w-100'
              disabled={!needDateFilter}
              onChange={onDateChange}
            >
              {dateFilterOpt.map(({ label, value }) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
      </Row>
    </div>
  )
}
