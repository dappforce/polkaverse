import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { newLogger, nonEmptyStr } from '@subsocial/utils'
import { PaginationConfig } from 'antd/lib/pagination'
import Link from 'next/link'
import { NextRouter, useRouter } from 'next/router'
import { ButtonLink } from 'src/components/utils/CustomLinks'
import {
  DEFAULT_FIRST_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../../config/ListData.config'
import { tryParseInt } from '../../utils'
import DataList, { DataListProps } from './DataList'
import { useLinkParams } from './utils'

const log = newLogger('PaginatedList')

// Ant's Pagination requires page options to be strings,
// that's why we convert them from numbers to strings here
const pageSizeOptions = PAGE_SIZE_OPTIONS.map(x => x.toString())

const getCurrentPageFromRouter = (router: NextRouter): number => {
  let page = DEFAULT_FIRST_PAGE
  const pageParam = router.query.page

  if (nonEmptyStr(pageParam)) {
    page = tryParseInt(pageParam, DEFAULT_FIRST_PAGE)
    page = page > 0 ? page : DEFAULT_FIRST_PAGE
  }

  return page
}

const getCurrentPageSizeFromRouter = (router: NextRouter): number => {
  let size = DEFAULT_PAGE_SIZE
  const sizeParam = router.query.size

  if (nonEmptyStr(sizeParam)) {
    size = tryParseInt(sizeParam, DEFAULT_PAGE_SIZE)
    size = size > 0 && size <= MAX_PAGE_SIZE ? size : DEFAULT_PAGE_SIZE
  }

  return size
}

type PaginatedListProps<T> = DataListProps<T>

export function PaginatedList<T extends any>(props: PaginatedListProps<T>) {
  const { dataSource, totalCount } = props
  const total = totalCount || dataSource.length
  const router = useRouter()
  const currentPage = getCurrentPageFromRouter(router)
  const pageSize = getCurrentPageSizeFromRouter(router)
  const lastPage = Math.ceil(total / pageSize)

  log.debug('Current page:', currentPage, ', current size:', pageSize)

  const getLinksParams = useLinkParams({ defaultSize: pageSize, triggers: [currentPage] })

  const hasData = total > 0
  const noPagination = !hasData || total <= pageSize

  const paginationConfig = (): PaginationConfig | undefined => {
    if (noPagination) return undefined

    return {
      current: currentPage,
      total,
      defaultCurrent: DEFAULT_FIRST_PAGE,
      pageSize,
      pageSizeOptions,
      hideOnSinglePage: true,
      showSizeChanger: hasData,
      onShowSizeChange: (_, newSize: number) => {
        if (newSize === pageSize) return

        const { href, as } = getLinksParams(currentPage, newSize)
        router.push(href, as)
      },
      style: { marginBottom: '1rem' },
      itemRender: (page, type, original) => {
        switch (type) {
          case 'page':
            return (
              <Link {...getLinksParams(page)} legacyBehavior>
                <a>{page}</a>
              </Link>
            )
          case 'next':
            return (
              <ButtonLink {...getLinksParams(currentPage + 1)} disabled={currentPage === lastPage}>
                <RightOutlined />
              </ButtonLink>
            )
          case 'prev':
            return (
              <ButtonLink {...getLinksParams(currentPage - 1)} disabled={currentPage === 1}>
                <LeftOutlined />
              </ButtonLink>
            )
          default:
            return original
        }
      },
    }
  }

  return <DataList paginationConfig={paginationConfig()} {...props} />
}

export default PaginatedList
