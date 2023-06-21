// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Tooltip } from 'antd'
import Button, { ButtonProps } from 'antd/lib/button'
import Link from 'next/link'
import React from 'react'

type LinkProps = {
  href: string
  as?: string
  target?: string
}

type ButtonLinkProps = LinkProps & ButtonProps

export const ButtonLink = ({ as, href, target, children, ...buttonProps }: ButtonLinkProps) => (
  <Button {...buttonProps}>
    <Link href={href} as={as}>
      <a target={target}>{children}</a>
    </Link>
  </Button>
)

type IconLinksProps = LinkProps & {
  title: string
  icon: React.ReactNode
}

export const IconLink = ({ title, icon, ...linkProps }: IconLinksProps) => (
  <Link {...linkProps}>
    <a className='DfHoverIcon'>
      <Tooltip title={title}>{icon}</Tooltip>
    </a>
  </Link>
)
