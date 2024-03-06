import { Tooltip } from 'antd'
import Button, { ButtonProps } from 'antd/lib/button'
import React from 'react'
import CustomLink from '../referral/CustomLink'

type LinkProps = {
  href: string
  as?: string
  target?: string
}

type ButtonLinkProps = LinkProps & ButtonProps

export const ButtonLink = ({ as, href, target, children, ...buttonProps }: ButtonLinkProps) => (
  <Button {...buttonProps}>
    <CustomLink href={href} as={as}>
      <a target={target}>{children}</a>
    </CustomLink>
  </Button>
)

type IconLinksProps = LinkProps & {
  title: string
  icon: React.ReactNode
}

export const IconLink = ({ title, icon, ...linkProps }: IconLinksProps) => (
  <CustomLink {...linkProps}>
    <a className='DfHoverIcon'>
      <Tooltip title={title}>{icon}</Tooltip>
    </a>
  </CustomLink>
)
