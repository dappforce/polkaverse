// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { AnyAccountId } from '@subsocial/api/types'
import { isEmptyStr } from '@subsocial/utils'
import clsx from 'clsx'
import { CSSProperties } from 'react'
import { DfBgImg, PreviewType } from 'src/components/utils/DfBgImg'
import IdentityIcon from 'src/components/utils/IdentityIcon'
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config'

export type BaseAvatarProps = {
  size?: number
  style?: CSSProperties
  avatar?: string
  identityValue?: string | AnyAccountId
  avatarPreview?: boolean | PreviewType
  noMargin?: boolean
}

const avatarCss = 'DfAvatar space ui--IdentityIcon'
// Do not show a gray overlay over preview image.
// gray overlay comes from antd component

export const BaseAvatar = (props: BaseAvatarProps) => {
  const {
    size = DEFAULT_AVATAR_SIZE,
    avatar,
    style,
    identityValue,
    avatarPreview,
    noMargin,
  } = props

  if (!avatar || isEmptyStr(avatar)) {
    return (
      <span className='d-flex align-items-center'>
        <IdentityIcon style={style} size={size} value={identityValue?.toString() || ''} />
      </span>
    )
  }

  return (
    <DfBgImg
      style={style}
      size={size}
      src={avatar}
      className={clsx(avatarCss, noMargin && 'mr-0')}
      preview={avatarPreview}
      rounded
    />
  )
}

export default BaseAvatar
