import { AccountId } from '@polkadot/types/interfaces'
import { Popover } from 'antd'
import BN from 'bn.js'
import React from 'react'
import { ProfileData } from 'src/types'
import { BalanceByNetwork, NativeBalance } from '../../common/balances/Balance'
import AuthorSpaceAvatar from './AuthorSpaceAvatar'
import Name from './Name'
import { ProfilePreviewPopup } from './ProfilePreview'
import { ExtendedAddressProps } from './utils/types'
import { withProfileByAccountId } from './utils/withLoadedOwner'

export type InfoProps = {
  address?: string | AccountId
  balance?: string | BN | number
  details?: JSX.Element
  network?: string
}

export const InfoDetails: React.FC<InfoProps> = ({ details, balance, address, network }) => {
  const accountBalance =
    (address &&
      (network ? (
        <BalanceByNetwork address={address} network={network} />
      ) : (
        <NativeBalance address={address.toString()} />
      ))) ||
    null

  return (
    <>
      <div className='Df--AddressComponents-details'>
        {balance || accountBalance}
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
    withFollowButton,
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
              content={
                <ProfilePreviewPopup
                  withFollowButton={withFollowButton}
                  address={address}
                  owner={owner}
                  withDetails
                />
              }
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
