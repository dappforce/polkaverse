import { isEmptyStr } from '@subsocial/utils'
import { summarize } from '@subsocial/utils/summarize'
import clsx from 'clsx'
import React, { HTMLProps } from 'react'
import { useIsMobileWidthOrDevice } from 'src/components/responsive'
import { SummarizedContent } from 'src/types'

const MOBILE_SUMMARY_LEN = 120
const DESKTOP_SUMMARY_LEN = 220

type Props = {
  content?: SummarizedContent
  limit?: number
  more?: JSX.Element
  omitDefaultClassName?: boolean
} & Omit<HTMLProps<HTMLDivElement>, 'content'>

export const SummarizeMd = React.memo((props: Props) => {
  const {
    content,
    limit: initialLimit,
    more,
    className,
    omitDefaultClassName,
    ...otherProps
  } = props
  const { summary: initialSummary = '', isShowMore: initialIsShowMore = false } = content || {}
  const isMobile = useIsMobileWidthOrDevice()

  if (isEmptyStr(initialSummary)) return null

  const limit = initialLimit ? initialLimit : isMobile ? MOBILE_SUMMARY_LEN : DESKTOP_SUMMARY_LEN

  const summary = summarize(initialSummary, { limit })
  let isShowMore = initialIsShowMore || initialSummary.length > limit

  if (isEmptyStr(summary)) return null

  return (
    <div className={clsx(!omitDefaultClassName && 'DfSummary', className)} {...otherProps}>
      {summary}
      {isShowMore && (
        <span className='DfSeeMore' onClick={e => e.stopPropagation()}>
          {' '}
          {more}
        </span>
      )}
    </div>
  )
})

export default SummarizeMd
