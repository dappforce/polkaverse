import { Pagination } from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import clsx from 'clsx'
import isEmpty from 'lodash/isEmpty'
import React from 'react'
import NoData from 'src/components/utils/EmptyList'
import Section from 'src/components/utils/Section'
import { DataListItemProps } from '.'

export type DataListOptProps = {
  title?: React.ReactNode
  level?: number
  noDataDesc?: React.ReactNode
  noDataExt?: React.ReactNode
  customNoData?: React.ReactNode
  className?: string
}

export type DataListProps<T extends any> = DataListOptProps &
  DataListItemProps<T> & {
    totalCount?: number
    dataSource: T[]
    paginationConfig?: PaginationConfig
    beforeList?: React.ReactNode
    children?: React.ReactNode
    listClassName?: string
  }

export function DataList<T extends any>(props: DataListProps<T>) {
  const {
    dataSource,
    renderItem,
    getKey,
    className,
    title,
    level,
    noDataDesc = null,
    noDataExt,
    customNoData,
    paginationConfig,
    beforeList,
    listClassName,
  } = props

  const total = dataSource.length

  const hasData = total > 0

  const list = (
    <>
      {beforeList}
      {hasData ? (
        <>
          <div
            className={clsx(
              'ant-list',
              'ant-list-vertical',
              'ant-list-lg',
              'ant-list-split',
              'DfDataList',
              className || '',
            )}
          >
            <ul className={clsx('ant-list-items', listClassName)}>
              {dataSource.map((x, i) => (
                <li key={getKey(x)}>{renderItem(x, i)}</li>
              ))}
            </ul>
          </div>

          {!isEmpty(paginationConfig) && (
            // Here is why we render a Pagination separately:
            // If a Pagination is rendered as a part of a List component,
            // then it triggers one extra re-render of a List on page transition.

            <div className='text-center mt-4'>
              <Pagination {...paginationConfig} />
            </div>
          )}
        </>
      ) : (
        customNoData || <NoData description={noDataDesc}>{noDataExt}</NoData>
      )}
    </>
  )

  const renderTitle = () => <div className='DfTitle--List'>{title}</div>

  return !title ? (
    list
  ) : (
    <Section title={renderTitle()} level={level}>
      {list}
    </Section>
  )
}

export default DataList
