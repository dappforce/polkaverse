// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { BareProps } from 'src/components/utils/types'
import { SpaceProps } from './common'

type Props = BareProps &
  SpaceProps & {
    withIcon?: boolean
  }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const EditMenuLink = (_props: Props) => null

/* export const EditMenuLink = ({ space: { id, owner }, withIcon }: Props) => isMyAddress(owner)
  ? <div className='SpaceNavSettings'>
    <Link
      href='/[spaceId]/space-navigation/edit'
      as={`/spaces/${id}/space-navigation/edit`}
    >
      <a className='DfSecondaryColor'>
        {withIcon && <SettingOutlined className='mr-2' />}
        Edit menu
      </a>
    </Link>
  </div>
  : null */
