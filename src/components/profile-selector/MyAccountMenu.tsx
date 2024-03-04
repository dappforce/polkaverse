import React, { createContext, FC, useContext } from 'react'
import { InfoDetails } from '../profiles/address-views'
import Avatar from '../profiles/address-views/Avatar'
import Address from '../profiles/address-views/Name'
import { AddressProps } from '../profiles/address-views/utils/types'
import {
  withMyProfile,
  withProfileByAccountId,
} from '../profiles/address-views/utils/withLoadedOwner'

type SelectAddressType = AddressProps & {
  onClick?: () => void
  withShortAddress?: boolean
  withoutBalances?: boolean
  network?: string
  emailAddress?: string
  isOnSelectAccount?: boolean
}

export const SelectAddressPreview: FC<SelectAddressType> = ({
  address,
  withShortAddress,
  onClick,
  owner,
  withoutBalances = false,
  emailAddress = '',
  isOnSelectAccount,
  network,
}) => {
  return (
    <div className='DfChooseAccount' onClick={onClick}>
      <div className='DfAddressIcon d-flex align-items-center'>
        <Avatar size={32} address={address} avatar={owner?.content?.image} asLink={false} />
      </div>
      <div className='DfAddressInfo ui--AddressComponents'>
        <Address
          truncate
          asLink={false}
          owner={owner}
          address={address}
          withShortAddress={withShortAddress}
          emailAddress={emailAddress}
          isOnSelectAccount={isOnSelectAccount}
        />
        {!withoutBalances && <InfoDetails address={address} network={network} />}
      </div>
    </div>
  )
}

type MyAccountSectionContextState = {
  visible: boolean
  open: () => void
  close: () => void
}

const initValue = {
  visible: false,
  open: {} as any,
  close: {} as any,
}

const MyAccountDrawerContext = createContext<MyAccountSectionContextState>(initValue)

export const useMyAccountDrawer = () => useContext(MyAccountDrawerContext)

export const AccountMenu: React.FunctionComponent<AddressProps> = ({ address, owner }) => {
  // TODO: open profile account
  return (
    <span className='DfCurrentAddress icon'>
      <Avatar address={address} avatar={owner?.content?.image} asLink={false} size={30} />
    </span>
  )
}

export const AddressPreviewByAccountId = withProfileByAccountId(SelectAddressPreview)
export const MyAccountPopup = withMyProfile(AccountMenu)
