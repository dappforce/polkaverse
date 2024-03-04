import { Checkbox, Col, Radio, RadioChangeEvent, Row, Select } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { MdVerified } from 'react-icons/md'
import { ReactNode } from 'react-markdown'
import config from 'src/config'
import LatestPostsPage from '../posts/LatestPostsPage'
import { useShowLikeablePostsContext } from '../posts/ShowLikeablePostsContext'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import LatestSpacesPage from '../spaces/LatestSpacesPage'
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

type Filter = { label: string; value: string; icon?: ReactNode }

const verifiedIcon = (
  <MdVerified className='VerifiedIcon FontSemilarge' style={{ top: '4px', position: 'relative' }} />
)

export const postFilterOpt: Filter[] = [
  { label: 'Hot Posts', icon: '🔥', value: 'hot' },
  { label: 'All Posts', value: 'latest' },
  // removed most liked and commented
  // ...offchainPostFilterOpt,
]

export const commentFilterOpt: Filter[] = enableGraphQl
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

export const spaceFilterOpt: Filter[] = [
  {
    label: 'Featured Creators',
    icon: verifiedIcon,
    value: 'suggested',
  },
  ...commonFilterOption,
  // { label: 'Creators Staking', value: 'creators' },
  // ...offchainSpaceFilterOpt,
]

export const dateFilterOpt: Filter[] = [
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

export const PostFilterView = ({ filter: { type, date }, ...props }: PostFilterProps) => {
  return <LatestPostsPage filter={type} dateFilter={date} {...props} />
}

export const SpaceFilterView = ({ filter: { type, date }, ...props }: SpaceFilterProps) => {
  return <LatestSpacesPage filter={type} dateFilter={date} {...props} />
}

const onChangeWrap = (onChange: OnChangeFn) => (e: RadioChangeEvent) => onChange(e.target.value)

export const Filters = (props: Props) => {
  const { tabKey, isAffix } = props
  const { isMobile } = useResponsiveSize()

  const { setValue, value } = useShowLikeablePostsContext()

  const router = useRouter()

  const { type, date } = router.query

  if (tabKey === 'feed' || !enableGraphQl) return null

  const onFilterChange: any = (value: PostFilterType = 'hot') =>
    setFiltersInUrl(router, tabKey, { type: value, date: date as DateFilterType })

  const onDateChange: any = (value: DateFilterType = 'week') =>
    setFiltersInUrl(router, tabKey, { type: type as EntityFilter, date: value })

  const needDateFilter =
    !!type && type !== 'latest' && type !== 'suggested' && type !== 'creators' && type !== 'hot'

  const showLikablePostsCheckbox = type === 'latest' && tabKey === 'posts'
  const hasRightElement = needDateFilter || showLikablePostsCheckbox

  if (!needDateFilter && !filterByKey[tabKey]?.length) return null

  const filters = filterByKey[tabKey]

  if (isAffix && showLikablePostsCheckbox) {
    return (
      <div className={clsx('AffixCheckbox')}>
        <Checkbox checked={value} onChange={e => setValue(e.target.checked)}>
          <span className='ColorMuted' style={{ userSelect: 'none' }}>
            Show likeable posts only
          </span>
        </Checkbox>
      </div>
    )
  }

  return (
    <div className={`DfFilters ${!isAffix ? 'mt-3' : ''}`}>
      <Row className={style.DfGridParams}>
        {!isMobile ? (
          <Col className={hasRightElement ? style.DfCol : 'ant-col-24'}>
            <Radio.Group
              options={filters.map(({ label, value, icon }) => ({
                label: (
                  <span>
                    <span className='mr-1'>{icon}</span>
                    {label}
                  </span>
                ),
                value,
              }))}
              onChange={onChangeWrap(onFilterChange)}
              value={type}
              optionType={'button'}
            />
          </Col>
        ) : (
          <Col className={clsx(needDateFilter ? style.DfCol : 'ant-col-24')}>
            <Select
              value={type}
              onChange={onFilterChange}
              className={clsx('w-100', style.FilterSelect)}
            >
              {filters.map(({ label, value, icon }) => (
                <Select.Option key={value} value={value}>
                  {label}
                  {icon && <span className='ml-1'>{icon}</span>}
                </Select.Option>
              ))}
            </Select>
          </Col>
        )}
        {showLikablePostsCheckbox && (
          <Col className={clsx(isMobile && 'mt-2')}>
            <Checkbox checked={value} onChange={e => setValue(e.target.checked)}>
              <span className='ColorMuted' style={{ userSelect: 'none' }}>
                Show likeable posts only
              </span>
            </Checkbox>
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
