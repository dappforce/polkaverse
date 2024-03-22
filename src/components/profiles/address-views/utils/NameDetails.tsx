import { useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { toShortAddress } from 'src/components/utils'
import MyEntityLabel from 'src/components/utils/MyEntityLabel'
import { ProfileData } from 'src/types'
import { CopyAddress } from '.'
import { NativeBalance } from '../../../common/balances/Balance'
import { InfoPanel } from '../InfoSection'
import Name from '../Name'
import { AddressProps } from './types'

type Props = AddressProps & {
  withFollowButton?: boolean
  withLabel?: boolean
  withDetails?: boolean
  network?: string
  emailAddress?: string
  withAddress?: boolean
  showLabel?: (item: string) => boolean
  label?: React.ReactNode
}

export const NameDetails = ({
  owner = {} as ProfileData,
  address,
  withLabel,
  withDetails,
  emailAddress = '',
  withAddress = true,
  showLabel,
  label,
}: Props) => {
  // const { struct } = owner

  const getDetails = () =>
    withDetails
      ? [
          {
            label: 'Balance',
            value: <NativeBalance address={address} />,
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
        {showLabel?.(address.toString()) && label}
      </div>
      {/* {extensionName && <div className='DfPopup-handle'>{extensionName}</div>} */}
      {withAddress && (
        <CopyAddress address={address}>
          <span className='DfGreyLink'>{shortAddress}</span>
        </CopyAddress>
      )}
      <InfoPanel layout='horizontal' column={1} items={[...getDetails()]} />
    </>
  )
}

export default NameDetails
