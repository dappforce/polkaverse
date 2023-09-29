import Link from 'next/link'
import { useIsMyAddress, useMyAccounts } from 'src/components/auth/MyAccountsContext'
import { equalAddresses } from 'src/components/substrate'
import { Copy } from 'src/components/urls/helpers'
import TxButton from 'src/components/utils/TxButton'
import { BareProps } from 'src/components/utils/types'
import { AnyAccountId } from 'src/types'
import { useAppDispatch } from '../../../../rtk/app/store'
import { useSelectProfile } from '../../../../rtk/features/profiles/profilesHooks'
import { fetchProfileSpaces } from '../../../../rtk/features/profiles/profilesSlice'
import { useSubsocialApi } from '../../../substrate/SubstrateContext'
import { BaseTxButtonProps } from '../../../substrate/SubstrateTxButton'
import { TxDiv } from '../../../substrate/TxDiv'
import { editSpaceUrl, newSpaceUrl } from '../../../urls/subsocial'

export const useExtensionName = (address: AnyAccountId) => {
  const { accounts } = useMyAccounts()

  return accounts.find(x => equalAddresses(x.address, address))?.meta.name?.toUpperCase()
}

type ProfileLink = BareProps & {
  address: AnyAccountId
  title?: string
  onClick?: () => void
}

type ProfileSpaceProps = BareProps & {
  address: AnyAccountId
  onClick?: () => void
}

export const CreateOrEditProfileSpace = ({ address, onClick, ...props }: ProfileSpaceProps) => {
  const profileSpace = useSelectProfile(address.toString())

  const actionButton = profileSpace ? (
    <Link href={editSpaceUrl(profileSpace.struct, true)} legacyBehavior>
      <a className='item' onClick={onClick} {...props}>
        Edit profile
      </a>
    </Link>
  ) : (
    <Link href={newSpaceUrl(true)} legacyBehavior>
      <a className='item' onClick={onClick} {...props}>
        Create profile
      </a>
    </Link>
  )

  return useIsMyAddress(address) ? actionButton : null
}

type MakeAprofileSpaceProps = BaseTxButtonProps & {
  label?: string
  spaceId: string
  address?: string
  asLink?: boolean
  className?: string
  reset?: boolean
  successAction?: () => void
}

export const ProfileSpaceAction = ({
  spaceId,
  address,
  asLink = false,
  reset = false,
  label = 'Use as profile',
  className,
  successAction,
  ...props
}: MakeAprofileSpaceProps) => {
  const dispatch = useAppDispatch()
  const { subsocial } = useSubsocialApi()

  const params = reset ? [] : [spaceId]

  const onSuccess = () => {
    address &&
      dispatch(fetchProfileSpaces({ api: subsocial, ids: [address.toString()], reload: true }))
    successAction?.()
  }

  const TxAction = asLink ? TxDiv : TxButton

  return (
    <TxAction
      tx={reset ? 'profiles.resetProfile' : 'profiles.setProfile'}
      size='middle'
      accountId={address}
      className={className}
      params={params}
      label={label}
      successMessage={reset ? 'Profile space reset' : 'Profile space set'}
      onSuccess={onSuccess}
      {...props}
    />
  )
}

export const ResetProfileButton = () => {
  return
}

export const SettingsLink = ({ address, title = 'Settings', onClick, ...props }: ProfileLink) =>
  useIsMyAddress(address) ? (
    <Link href='/settings/email' as='/settings/email' legacyBehavior>
      <a onClick={onClick} {...props}>
        {title}
      </a>
    </Link>
  ) : null

type CopyAddressProps = {
  address: AnyAccountId
  message?: string
  children?: React.ReactNode
}

export const CopyAddress = ({
  address = '',
  message = 'Address copied',
  children = address,
}: CopyAddressProps) => (
  <Copy text={address.toString()} message={message}>
    {children}
  </Copy>
)
