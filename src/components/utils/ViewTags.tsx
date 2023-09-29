import { TagOutlined } from '@ant-design/icons'
import { isEmptyArray, isEmptyStr, nonEmptyStr } from '@subsocial/utils'
import { Tag } from 'antd'
import Link from 'next/link'
import React from 'react'
import { BareProps } from './types'

type ViewTagProps = {
  tag?: string
}

const ViewTag = React.memo(({ tag }: ViewTagProps) => {
  const searchLink = `/search?tags=${tag}`

  return isEmptyStr(tag) ? null : (
    <Tag key={tag} className='mt-2'>
      <Link href={searchLink} as={searchLink} legacyBehavior>
        <a className='DfGreyLink'>
          <TagOutlined />
          {tag}
        </a>
      </Link>
    </Tag>
  )
})

type ViewTagsProps = BareProps & {
  tags?: string[]
}

export const ViewTags = React.memo(({ tags = [], className = '', ...props }: ViewTagsProps) =>
  isEmptyArray(tags) ? null : (
    <div className={`DfTags ${className}`} {...props}>
      {tags.filter(nonEmptyStr).map((tag, i) => (
        <ViewTag key={`${tag}-${i}`} tag={tag} />
      ))}
    </div>
  ),
)

export default ViewTags
