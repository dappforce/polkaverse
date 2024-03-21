import { useRouter } from 'next/router'
import React, { createContext, FC, useContext, useEffect, useRef, useState } from 'react'
import { isDevMode } from 'src/config/env'
import { parseGrillMessage } from 'src/utils/iframe'
import { getCurrentUrlOrigin } from 'src/utils/url'
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [isOpenProfileModal, setIsOpenProfileModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function listener(event: MessageEvent<any>) {
      const message = parseGrillMessage(event.data + '')
      if (!message) return

      const { name, value } = message
      if (name === 'profile' && value === 'close') {
        setIsOpenProfileModal(false)
      } else if (name === 'redirect') {
        router.push(value)
        setIsOpenProfileModal(false)
      } else if (name === 'redirect-hard') {
        // Using router push for redirect don't redirect properly, it just have loading for a bit and changes the url much later
        window.location.href = value
        setIsOpenProfileModal(false)
      }
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [])

  return (
    <span
      onClick={() => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: 'grill:profile',
            payload: 'open',
          },
          '*',
        )
        setIsOpenProfileModal(true)
      }}
      className='DfCurrentAddress icon CursorPointer'
    >
      <Avatar address={address} avatar={owner?.content?.image} asLink={false} size={30} noMargin />
      {!isDevMode && (
        <iframe
          ref={iframeRef}
          src={`${getCurrentUrlOrigin()}/c/widget/profile?theme=light`}
          style={{
            opacity: isOpenProfileModal ? 1 : 0,
            pointerEvents: isOpenProfileModal ? 'auto' : 'none',
            transition: 'opacity 0.3s ease-in-out',
            border: 'none',
            colorScheme: 'none',
            background: 'transparent',
            position: 'fixed',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
          allow='clipboard-write'
        />
      )}
    </span>
  )
}

export const AddressPreviewByAccountId = withProfileByAccountId(SelectAddressPreview)
export const MyAccountPopup = withMyProfile(AccountMenu)
