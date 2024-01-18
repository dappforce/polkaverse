import { summarizeMd } from '@subsocial/utils'
import clsx from 'clsx'
import { ComponentProps, useMemo, useState } from 'react'
import { DfMd } from '../DfMd'
import { SummarizeMd } from '../md'
import styles from './CollapsibleParagraph.module.sass'

export type CollapsibleParagraphProps = ComponentProps<'span'> & {
  text: string
  limit?: number
}

export default function CollapsibleParagraph({ text, limit, ...props }: CollapsibleParagraphProps) {
  const [collapseAbout, setCollapseAbout] = useState(true)
  const summarized = useMemo(() => summarizeMd(text), [text])

  const onToggleShow = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    setCollapseAbout(prev => !prev)
  }

  return (
    <span {...props} className={clsx(styles.CollapsibleParagraph, props.className)}>
      {!collapseAbout ? (
        <>
          <DfMd className='mb-0' omitDefaultClassName source={text} />
          <div className='DfBlackLink font-weight-semibold mt-1' onClick={onToggleShow}>
            Show Less
          </div>
        </>
      ) : (
        <SummarizeMd
          omitDefaultClassName
          limit={limit}
          content={summarized}
          more={
            <span className='DfBlackLink font-weight-semibold' onClick={onToggleShow}>
              Show More
            </span>
          }
        />
      )}
    </span>
  )
}
