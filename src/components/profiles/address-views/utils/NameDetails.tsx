// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { toShortAddress } from 'src/components/utils'
import MyEntityLabel from 'src/components/utils/MyEntityLabel'
import { ProfileData } from 'src/types'
import { CopyAddress } from '.'
import { Balance } from '../../../common/balances/Balance'
import { InfoPanel } from '../InfoSection'
import Name from '../Name'
import { AddressProps } from './types'

type Props = AddressProps & {
  withFollowButton?: boolean
  withLabel?: boolean
  withDetails?: boolean
  emailAddress?: string
}

export const NameDetails = ({
  owner = {} as ProfileData,
  address,
  withLabel,
  withDetails,
  emailAddress = '',
}: Props) => {
  // const { struct } = owner

  const getDetails = () =>
    withDetails
      ? [
          {
            label: 'Balance',
            value: <Balance address={address} />,
          },
          // {
          //   label: 'Reputation',
          //   value: struct?.reputation?.toString() || 0
          // }
        ]
      : []

  const isMyAccount = useIsMyAddress(address)
  const shortAddress = toShortAddress(address)
  // const extensionName = useExtensionName(address)

  return (
    <>
      <div className='header DfAccountTitle'>
        <Name owner={owner} address={address} isOnHeader emailAddress={emailAddress} />
        {withLabel && <MyEntityLabel isMy={isMyAccount}>Me</MyEntityLabel>}
      </div>
      {/* {extensionName && <div className='DfPopup-handle'>{extensionName}</div>} */}
      <CopyAddress address={address}>
        <span className='DfGreyLink'>{shortAddress}</span>
      </CopyAddress>
      <InfoPanel layout='horizontal' column={1} items={[...getDetails()]} />
    </>
  )
}

export default NameDetails
