import { Drawer } from 'antd'
import dynamic from 'next/dynamic'
import React, { createContext, FC, useContext, useState } from 'react'
import { isMobileDevice } from 'src/config/Size.config'
import { InfoDetails } from '../profiles/address-views'
import Avatar from '../profiles/address-views/Avatar'
import Address from '../profiles/address-views/Name'
import { AddressProps } from '../profiles/address-views/utils/types'
import {
  withMyProfile,
  withProfileByAccountId,
} from '../profiles/address-views/utils/withLoadedOwner'
import { useResponsiveSize } from '../responsive'

type SelectAddressType = AddressProps & {
  onClick?: () => void
  withShortAddress?: boolean
  withoutBalances?: boolean
  network?: string
}

export const SelectAddressPreview: FC<SelectAddressType> = ({
  address,
  withShortAddress,
  onClick,
  owner,
  withoutBalances = false,
  network
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
  const MyAccountSection = dynamic(
    () => import('src/components/profile-selector/MyAccountSection'),
    { ssr: false },
  )
  const { isMobile } = useResponsiveSize()
  const [visible, setVisible] = useState(false)

  const open = () => setVisible(true)
  const close = () => setVisible(false)

  return (
    <>
      <span className='DfCurrentAddress icon' onClick={open}>
        {isMobile ? (
          <Avatar address={address} avatar={owner?.content?.image} asLink={false} />
        ) : (
          <SelectAddressPreview address={address} owner={owner} />
        )}
      </span>
      <Drawer
        placement='right'
        className='DfAccountMenu'
        width={isMobileDevice ? 320 : 365}
        closable={true}
        onClose={close}
        visible={visible || false}
      >
        <MyAccountDrawerContext.Provider value={{ visible, open, close }}>
          <MyAccountSection />
        </MyAccountDrawerContext.Provider>
      </Drawer>
    </>
  )
}

export const AddressPreviewByAccountId = withProfileByAccountId(SelectAddressPreview)
export const MyAccountPopup = withMyProfile(AccountMenu)
