import { Checkbox, Col, Radio, RadioChangeEvent, Row, Select } from 'antd'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { MdVerified } from 'react-icons/md'
import { ReactNode } from 'react-markdown'
import config from 'src/config'
import { useIsMyAddressWhitelisted } from 'src/config/constants'
import LatestPostsPage from '../posts/LatestPostsPage'
import { useShowLikeablePostsContext } from '../posts/ShowLikeablePostsContext'
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
import { setFiltersInUrl, useShufflePostsStorage } from './utils'

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
  {
    label: 'Featured Posts',
    icon: verifiedIcon,
    value: 'suggested',
  },
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

export const PostFilterView = ({ filter: { type, date, shuffle }, ...props }: PostFilterProps) => (
  <LatestPostsPage filter={type} dateFilter={date} shuffle={shuffle} {...props} />
)

export const SpaceFilterView = ({ filter: { type, date }, ...props }: SpaceFilterProps) => {
  if (type === 'creators') return <CreatorsSpaces />
  return <LatestSpacesPage filter={type} dateFilter={date} {...props} />
}

const onChangeWrap = (onChange: OnChangeFn) => (e: RadioChangeEvent) => onChange(e.target.value)

export const Filters = (props: Props) => {
  const { tabKey, isAffix } = props
  const { isMobile } = useResponsiveSize()
  const isWhitelisted = useIsMyAddressWhitelisted()
  const { getDefaultValueFromUrl, setValue: setShufflePosts } = useShufflePostsStorage()

  const { setValue, value } = useShowLikeablePostsContext()

  const router = useRouter()

  const { type, date, shuffle } = router.query
  const usedShuffle = getDefaultValueFromUrl(shuffle)

  if (tabKey === 'feed' || !enableGraphQl) return null

  const onShuffleChange: any = (value: boolean) => {
    setShufflePosts(value)
    setFiltersInUrl(router, tabKey, {
      type: type as EntityFilter,
      date: date as DateFilterType,
      shuffle: value,
    })
  }

  const onFilterChange: any = (value: PostFilterType = 'suggested') =>
    setFiltersInUrl(router, tabKey, {
      type: value,
      date: date as DateFilterType,
      shuffle: usedShuffle,
    })

  const onDateChange: any = (value: DateFilterType = 'week') =>
    setFiltersInUrl(router, tabKey, {
      type: type as EntityFilter,
      date: value,
      shuffle: usedShuffle,
    })

  const needDateFilter =
    !!type && type !== 'latest' && type !== 'suggested' && type !== 'creators' && type !== 'hot'

  const showLikablePostsCheckbox = type === 'latest' && tabKey === 'posts'
  const showShuffleCheckbox = type === 'hot' && tabKey === 'posts'
  const hasRightElement = needDateFilter || showLikablePostsCheckbox || showShuffleCheckbox

  if (!needDateFilter && !filterByKey[tabKey]?.length) return null

  let filters = filterByKey[tabKey]
  if (!isWhitelisted && tabKey === 'posts') {
    filters = filters.filter(({ value }) => value !== 'hot')
  }

  const likeablePostsCheckbox = (
    <Checkbox checked={value} onChange={e => setValue(e.target.checked)}>
      <span className='ColorMuted' style={{ userSelect: 'none' }}>
        Show likeable posts only
      </span>
    </Checkbox>
  )
  const shuffleCheckbox = (
    <Checkbox checked={usedShuffle} onChange={e => onShuffleChange(e.target.checked)}>
      <span className='ColorMuted' style={{ userSelect: 'none' }}>
        Shuffle posts
      </span>
    </Checkbox>
  )

  if (isAffix && showLikablePostsCheckbox) {
    return <div className={clsx('AffixCheckbox')}>{likeablePostsCheckbox}</div>
  }
  if (isAffix && showShuffleCheckbox) {
    return <div className={clsx('AffixCheckbox')}>{shuffleCheckbox}</div>
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
          <Col className={clsx(isMobile && 'mt-2')}>{likeablePostsCheckbox}</Col>
        )}
        {showShuffleCheckbox && <Col className={clsx(isMobile && 'mt-2')}>{shuffleCheckbox}</Col>}
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
