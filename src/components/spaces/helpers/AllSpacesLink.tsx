import React from 'react'
import CustomLink from 'src/components/referral/CustomLink'
import { BareProps } from 'src/components/utils/types'

type Props = BareProps & {
  title?: React.ReactNode
}

export const AllSpacesLink = ({ title = 'See all', ...otherProps }: Props) => (
  <CustomLink href='/spaces' as='/spaces'>
    <a className='DfGreyLink text-uppercase' style={{ fontSize: '1rem' }} {...otherProps}>
      {title}
    </a>
  </CustomLink>
)
