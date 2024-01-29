import { Divider } from 'antd'
import { useState } from 'react'
import { EmailAccount } from 'src/types'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { StepsEnum, useAuth } from '../auth/AuthContext'
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
import { convertToSubsocialAddress } from 'src/utils/address'
import { useSubstrate } from '../substrate/useSubstrate'
import { Loading } from '../utils'
import { ActionMenu } from './ActionMenu'

type SelectAccountItems = {
  accounts: string[]
  withShortAddress?: boolean
  onItemClick?: (address: string) => void
  emailAccounts?: EmailAccount[]
}

type SelectEmailItemsProps = Omit<SelectAccountItems, 'accounts'>

type AccountItemProps = {
  address: string
  onClick?: (address: string, emailAddress?: string) => void
  withShortAddress?: boolean
  emailAddress?: string
  isOnSelectAccount?: boolean
}

const AccountItem = ({
  address,
  onClick,
  withShortAddress,
  emailAddress,
  isOnSelectAccount,
}: AccountItemProps) => {
  const profile = useSelectProfile(address)

  return (
    <div
      className='SelectAccountItem'
      style={{ cursor: 'pointer', height: 'auto' }}
      onClick={() => onClick && onClick(address, emailAddress)}
    >
      <SelectAddressPreview
        address={address}
        owner={profile}
        withShortAddress={withShortAddress}
        emailAddress={emailAddress}
        isOnSelectAccount={isOnSelectAccount}
      />
    </div>
  )
}

const SelectAccountItems = ({
  accounts: addresses,
  withShortAddress,
  onItemClick,
  emailAccounts,
}: SelectAccountItems) => {
  const { setAddress, setEmailAddress, unsetEmailAddress } = useMyAccountsContext()

  const onAccountClick = (address: string, emailAddress?: string) => {
    emailAddress ? setEmailAddress(emailAddress) : unsetEmailAddress()
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
      {emailAccounts &&
        emailAccounts.length > 0 &&
        emailAccounts.map(({ accountAddress, email }) => (
          <AccountItem
            key={accountAddress}
            address={accountAddress}
            emailAddress={email}
            onClick={onAccountClick}
            withShortAddress={withShortAddress}
            // isOnSelectAccount={true}
          />
        ))}
    </div>
  )
}

const SelectEmailItems = ({
  withShortAddress,
  onItemClick,
  emailAccounts,
}: SelectEmailItemsProps) => {
  const { setEmailAddress, setAddress, unsetEmailAddress } = useMyAccountsContext()

  const onAccountClick = (address: string, emailAddress?: string) => {
    emailAddress ? setEmailAddress(emailAddress) : unsetEmailAddress()
    setAddress(address)
    onItemClick?.(address)
  }

  return (
    <div className='SelectAccountSection'>
      {emailAccounts &&
        emailAccounts.map(({ accountAddress, email }) => (
          <AccountItem
            key={accountAddress}
            address={accountAddress}
            emailAddress={email}
            onClick={onAccountClick}
            withShortAddress={withShortAddress}
            isOnSelectAccount={true}
          />
        ))}
    </div>
  )
}

const renderExtensionContent = (content: JSX.Element) => {
  return (
    <>
      <SubTitle title={'Accounts:'} />
      {content}
    </>
  )
}

const noExtension = (onClickSignIn: () => void, onClickRegister: () => void) =>
  !isMobileDevice ? (
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
      You can continue reading {config.appName} content without signing in, however, in order to
      create new posts, write comments, and follow others, you will need to create an account.
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
      <div className='p-3 pt-4 pb-0'>
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
  const { emailAccounts } = useMyAccounts()
  const { apiState } = useSubstrate()

  const { setCurrentStep } = useAuth()

  const excludeCurrentEmailAccounts = emailAccounts.filter(account => {
    const walletAddress =
      convertToSubsocialAddress(account.accountAddress) ?? account.accountAddress
    if (walletAddress !== currentAddress) return account
    return
  })

  const ExtensionAccountPanel = () => {
    const count = switchAccountsSet.size
    // const isInjectCurrentAddress = currentAddress && keyring.getAccount(currentAddress)?.meta.isInjected // FIXME: hack that hides NoAccount msg!!!

    // if (!injectedAccounts && apiState !== 'READY') return <Loading label='Accounts injecting...' />

    if (status === 'UNAUTHORIZED') return unauthExtension

    if (status === 'UNAVAILABLE' && excludeCurrentEmailAccounts.length > 0)
      return renderExtensionContent(
        <SelectEmailItems
          withShortAddress
          onItemClick={onItemClick}
          emailAccounts={excludeCurrentEmailAccounts}
        />,
      )

    if (status === 'UNAVAILABLE' && emailAccounts.length === 0)
      return noExtension(
        () => {
          setCurrentStep(StepsEnum.SignIn)
        },
        () => {
          setCurrentStep(StepsEnum.SignUp)
        },
      )

    if (
      !count &&
      currentAddress &&
      emailAccounts.length > 0 &&
      excludeCurrentEmailAccounts.length === 0
    )
      return null

    if (status === 'NOACCOUNT') return renderExtensionContent(noExtensionAccounts)

    const extensionAddresses = [...switchAccountsSet]

    return renderExtensionContent(
      <SelectAccountItems
        accounts={extensionAddresses}
        withShortAddress
        onItemClick={onItemClick}
        emailAccounts={excludeCurrentEmailAccounts}
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
      {(status === 'OK' || (status === 'UNAVAILABLE' && emailAccounts.length > 0)) &&
        withCurrentAccount && <CurrentAccount currentAddress={currentAddress} />}
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
  const { accounts, emailAccounts, status } = useMyAccounts()
  const dispatch = useAppDispatch()

  useSubsocialEffect(
    ({ subsocial: api }) => {
      if (status !== 'OK' || isEmptyArray(accounts)) return

      let isMounted = true

      let switchAccounts = accounts.map(x => asAccountId(x.address)?.toString()) as string[]
      let switchEmailAddresses = emailAccounts.map(x =>
        asAccountId(x.accountAddress)?.toString(),
      ) as string[]

      if (!includeCurrentAccount) {
        switchAccounts = switchAccounts.filter(acc => acc && acc !== currentAddress)
      }

      if (withProfiles) {
        isMounted &&
          dispatch(
            fetchProfileSpaces({
              api,
              ids: [...switchAccounts, ...switchEmailAddresses],
              dataSource: DataSourceTypes.SQUID,
            }),
          )
      }

      if (isMounted) {
        setSwitchAccounts(new Set(switchAccounts))
      }

      return () => {
        isMounted = false
      }
    },
    [
      currentAddress,
      dispatch,
      accounts.length,
      emailAccounts.length,
      includeCurrentAccount,
      status,
    ],
  )

  return {
    switchAccountsSet,
    currentAddress,
    status,
  }
}
