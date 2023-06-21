// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { AccountId } from '@polkadot/types/interfaces'
import { Popover } from 'antd'
import BN from 'bn.js'
import React from 'react'
import { ProfileData } from 'src/types'
import { Balance } from '../../common/balances/Balance'
import AuthorSpaceAvatar from './AuthorSpaceAvatar'
import Name from './Name'
import { ProfilePreviewPopup } from './ProfilePreview'
import { ExtendedAddressProps } from './utils/types'
import { withProfileByAccountId } from './utils/withLoadedOwner'

export type InfoProps = {
  address?: string | AccountId
  balance?: string | BN | number
  details?: JSX.Element
}

export const InfoDetails: React.FC<InfoProps> = ({ details, balance, address }) => {
  return (
    <>
      <div className='Df--AddressComponents-details'>
        {balance || (address && <Balance address={address.toString()} />)}
        {details && <div>{details}</div>}
      </div>
    </>
  )
}

export const AuthorPreview = (props: ExtendedAddressProps) => {
  const {
    address,
    owner = {} as ProfileData,
    className,
    isPadded = true,
    style,
    size,
    afterName,
    details,
    children,
    spaceId,
  } = props
  const nameClass = `ui--AddressComponents-address ${className}`

  return (
    <div className={`ui--AddressComponents ${isPadded ? 'padded' : ''} ${className}`} style={style}>
      <div className='ui--AddressComponents-info d-flex'>
        <AuthorSpaceAvatar size={size} authorAddress={address} spaceId={spaceId} />
        <div className='DfAddressMini-popup'>
          <span className='d-flex align-items-center'>
            <Popover
              trigger='hover'
              mouseEnterDelay={0.3}
              content={<ProfilePreviewPopup address={address} owner={owner} withDetails />}
            >
              <div className='d-flex align-items-center'>
                <Name address={address} owner={owner} className={nameClass} asLink />
                {afterName}
              </div>
            </Popover>
          </span>
          <InfoDetails details={details} />
        </div>
        {children}
      </div>
    </div>
  )
}

export const AuthorPreviewByAccountId = withProfileByAccountId(AuthorPreview)

export default AuthorPreviewByAccountId
