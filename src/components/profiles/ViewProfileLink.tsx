import React, { CSSProperties } from 'react'
import useGetProfileUrl from 'src/hooks/useGetProfileUrl'
import CustomLink from '../referral/CustomLink'
import { HasAddress } from '../urls'

type Props = {
  account: HasAddress
  title?: React.ReactNode
  hint?: string
  className?: string
  style?: CSSProperties
}

export const ViewProfileLink = React.memo(({ account, title, hint, className, style }: Props) => {
  const { address } = account
  const profileUrl = useGetProfileUrl(address.toString())

  if (!address) return null

  return (
    <CustomLink href={profileUrl} rel='noreferrer nofollow'>
      <a className={className} title={hint} style={style}>
        {title || address.toString()}
      </a>
    </CustomLink>
  )
})

export default ViewProfileLink
