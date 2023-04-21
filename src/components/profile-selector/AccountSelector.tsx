import { Divider } from 'antd'
import { useState } from 'react'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useMyAccounts, useMyAccountsContext, useMyAddress } from '../auth/MyAccountsContext'
import { ProfilePreviewByAccountId, SelectAddressPreview } from '../profiles/address-views'
import SubTitle from '../utils/SubTitle'

import { asAccountId } from '@subsocial/api'
import { isEmptyArray } from '@subsocial/utils'
import config from 'src/config'
import { isMobileDevice } from 'src/config/Size.config'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useAppDispatch } from 'src/rtk/app/store'
import { fetchProfileSpaces } from 'src/rtk/features/profiles/profilesSlice'
import { AccountId, DataSourceTypes } from 'src/types'
import { useSubstrate } from '../substrate/useSubstrate'
import { Loading } from '../utils'
import { ActionMenu } from './ActionMenu'

type SelectAccountItems = {
  accounts: string[]
  withShortAddress?: boolean
  onItemClick?: (address: string) => void
}

type AccountItemProps = {
  address: string
  onClick?: (address: string) => void
  withShortAddress?: boolean
}
const AccountItem = ({ address, onClick, withShortAddress }: AccountItemProps) => {
  const profile = useSelectProfile(address)

  return (
    <div
      className='SelectAccountItem'
      style={{ cursor: 'pointer', height: 'auto' }}
      onClick={() => onClick && onClick(address)}
    >
      <SelectAddressPreview address={address} owner={profile} withShortAddress={withShortAddress} />
    </div>
  )
}

const SelectAccountItems = ({
  accounts: addresses,
  withShortAddress,
  onItemClick,
}: SelectAccountItems) => {
  const { setAddress } = useMyAccountsContext()

  const onAccountClick = (address: string) => {
    setAddress(address)
    onItemClick?.(address)
  }

  return (
    <div className='SelectAccountSection'>
      {addresses.map(address => (
        <AccountItem
          key={address}
          address={address}
          onClick={onAccountClick}
          withShortAddress={withShortAddress}
        />
      ))}
    </div>
  )
}

const renderExtensionContent = (content: JSX.Element) => {
  return (
    <>
      <SubTitle title={'Extension accounts:'} />
      {content}
    </>
  )
}

const noExtension = !isMobileDevice ? (
  <div className='text-center my-3'>
    <div className='mb-3 mx-3'>
      <a
        className='DfBoldBlackLink'
        href='https://github.com/polkadot-js/extension'
        rel='noreferrer'
        target='_blank'
      >
        Polkadot extension
      </a>{' '}
      was not found or disabled. Please read our{' '}
      <a href='/docs/sign-up' rel='noreffer'>
        Sign Up guide
      </a>
      .
    </div>
    {/* <div className='mx-5'>
        <Button block className='mb-2' type='default' href='https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd' target='_blank' >
          <Avatar size={20} src='/chrome.svg' />
          <span className='ml-2'>polkadot.js for Chrome</span>
        </Button>
        <Button block type='default' href='https://addons.mozilla.org/firefox/addon/polkadot-js-extension/' target='_blank' >
          <Avatar size={20} src='/firefox.svg' />
          <span className='ml-2'>polkadot.js for Firefox</span>
        </Button>
      </div> */}
  </div>
) : (
  <div className='p-3 text-center'>
    {`You can read ${config.appName} content on any device, however, in order to create new posts, write comments and follow others, you will need to use a desktop.`}
    {'This is because this web app uses the '}
    <a target='_blank' rel='noreferrer' href='https://polkadot.js.org/extension/'>
      Polkadot.js Extension
    </a>
    {
      ' to sign your actions (transactions) as they recorded on-chain. The extension is available for the desktop versions of '
    }
    <a
      target='_blank'
      rel='noreferrer'
      href='https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/'
    >
      Firefox
    </a>
    {', '}
    <a
      target='_blank'
      rel='noreferrer'
      href='https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd'
    >
      Chrome
    </a>
    {', and other '}
    <a
      target='_blank'
      rel='noreferrer'
      href='https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd'
    >
      Chrome-based
    </a>
    {' browsers.'}
  </div>
)

const noExtensionAccounts = (
  <div className='m-3 text-center'>
    No accounts found. Please open your Polkadot extension and create a new account or import
    existing. Then reload this page.
  </div>
)

const unauthExtension = (
  <div className='m-3 text-center'>
    Your Polkadot.js browser extension does not have access to {config.appName}. Please go to your
    Polkadot.js settings and allow access to <b>{config.appBaseUrl}.</b>
  </div>
)

type CurrentAccountProps = {
  currentAddress?: AccountId
}

const CurrentAccount = ({ currentAddress }: CurrentAccountProps) => {
  if (!currentAddress) return null

  return (
    <>
      <div className='p-3 pb-0'>
        <ProfilePreviewByAccountId
          address={currentAddress}
          size={60}
          className='justify-content-center'
          withDetails
        />
      </div>
      <Divider className='my-0' />
      <ActionMenu />
    </>
  )
}

type SelectorProps = {
  withCurrentAccount?: boolean
  overviewCurrentAccount?: boolean
  onItemClick?: (address: string) => void
}

export const AccountSelector = ({
  withCurrentAccount = true,
  overviewCurrentAccount,
  onItemClick,
}: SelectorProps) => {
  const { switchAccountsSet, currentAddress, status } = useAccountSelector({
    includeCurrentAccount: overviewCurrentAccount,
  })
  const { apiState } = useSubstrate()

  const ExtensionAccountPanel = () => {
    const count = switchAccountsSet.size

    // const isInjectCurrentAddress = currentAddress && keyring.getAccount(currentAddress)?.meta.isInjected // FIXME: hack that hides NoAccount msg!!!

    // if (!injectedAccounts && apiState !== 'READY') return <Loading label='Accounts injecting...' />

    if (status === 'UNAUTHORIZED') return unauthExtension

    if (status === 'UNAVAILABLE') return noExtension

    if (!count && currentAddress) return null

    if (status === 'NOACCOUNT') return renderExtensionContent(noExtensionAccounts)

    const extensionAddresses = [...switchAccountsSet]

    return renderExtensionContent(
      <SelectAccountItems
        accounts={extensionAddresses}
        withShortAddress
        onItemClick={onItemClick}
      />,
    )
  }

  if (apiState !== 'READY')
    return (
      <div className={'mb-3'}>
        <Loading />
      </div>
    )

  return (
    <div>
      {status === 'OK' && withCurrentAccount && <CurrentAccount currentAddress={currentAddress} />}
      <div>
        <ExtensionAccountPanel />
      </div>
    </div>
  )
}

type AccountSelectorProps = {
  withProfiles?: boolean
  includeCurrentAccount?: boolean
}

export const useAccountSelector = ({
  withProfiles = true,
  includeCurrentAccount,
}: AccountSelectorProps) => {
  const [switchAccountsSet, setSwitchAccounts] = useState<Set<string>>(new Set())
  const currentAddress = useMyAddress()
  const { accounts, status } = useMyAccounts()
  const dispatch = useAppDispatch()

  useSubsocialEffect(
    ({ subsocial: api }) => {
      if (status !== 'OK' || isEmptyArray(accounts)) return

      let isMounted = true

      let switchAccounts = accounts.map(x => asAccountId(x.address)?.toString()) as string[]

      if (!includeCurrentAccount) {
        switchAccounts = switchAccounts.filter(acc => acc && acc !== currentAddress)
      }

      if (withProfiles) {
        isMounted &&
          dispatch(
            fetchProfileSpaces({ api, ids: switchAccounts, dataSource: DataSourceTypes.SQUID }),
          )
      }

      isMounted && setSwitchAccounts(new Set(switchAccounts))

      return () => {
        isMounted = false
      }
    },
    [currentAddress, dispatch, accounts.length, includeCurrentAccount, status],
  )

  return {
    switchAccountsSet,
    currentAddress,
    status,
  }
}
