import Link from 'next/link'
import React, { CSSProperties } from 'react'
import { accountUrl, HasAddress } from '../urls'

type Props = {
  account: HasAddress
  title?: React.ReactNode
  hint?: string
  className?: string
  style?: CSSProperties
}

export const ViewProfileLink = React.memo(({ account, title, hint, className, style }: Props) => {
  const { address } = account

  if (!address) return null

  return (
    <Link href='/accounts/[address]' as={accountUrl(account)}>
      <a className={className} title={hint} style={style}>
        {title || address.toString()}
      </a>
    </Link>
  )
})

export default ViewProfileLink
