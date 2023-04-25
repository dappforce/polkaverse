import { nonEmptyStr } from '@subsocial/utils'
import clsx from 'clsx'
import { toShortAddress } from 'src/components/utils'
import { MutedSpan } from 'src/components/utils/MutedText'
import { ProfileData } from 'src/types'
import ViewProfileLink from '../ViewProfileLink'
import NameChip from './NameChip'
import { useExtensionName } from './utils'
import { AddressProps } from './utils/types'
import { withProfileByAccountId } from './utils/withLoadedOwner'

type Props = AddressProps & {
  isShort?: boolean
  asLink?: boolean
  withShortAddress?: boolean
  className?: string
  containerClassName?: string
  isOnHeader?: boolean
  isOnViewProfile?: boolean
  emailAddress?: string
  truncate?: number | boolean
  isOnSelectAccount?: boolean
}

const DEFAULT_MAX_NAME_LEN = 15
export const Name = ({
  address,
  owner = {} as ProfileData,
  isShort = true,
  asLink = true,
  withShortAddress,
  className,
  containerClassName,
  truncate,
  isOnHeader = false,
  isOnViewProfile = false,
  emailAddress = '',
  isOnSelectAccount = false,
  style,
}: Props) => {
  const { content } = owner

  const shortAddress = toShortAddress(address)
  const addressString = isShort ? shortAddress : address.toString()
  const extensionName = useExtensionName(address)
  const isNameWithEmailAddress = nonEmptyStr(emailAddress) && content === undefined
  let name = isNameWithEmailAddress ? emailAddress : extensionName || ''
  name = content ? content.name : name

  const renderName = () => {
    if (isOnViewProfile) return emailAddress
    if (isNameWithEmailAddress)
      return `${name.substring(0, DEFAULT_MAX_NAME_LEN)}${
        name.length > DEFAULT_MAX_NAME_LEN ? '...' : ''
      }`
    if (!truncate || !name || isOnViewProfile) {
      return name
    }
    const maxLen = typeof truncate === 'boolean' ? DEFAULT_MAX_NAME_LEN : truncate
    return `${name.substring(0, maxLen)}${name.length > maxLen ? '...' : ''}`
  }

  const fullWidth = withShortAddress || (isNameWithEmailAddress && !isOnViewProfile)

  const ModifiedMutedSpan = () =>
    isNameWithEmailAddress || isOnSelectAccount ? (
      <NameChip>Email</NameChip>
    ) : (
      <MutedSpan>
        <code>{shortAddress}</code>
      </MutedSpan>
    )

  const title = name ? (
    <>
      <span className={clsx('', fullWidth && 'd-flex justify-content-between flex-wrap w-100')}>
        <span className='align-items-center'>{renderName()}</span>
        {withShortAddress && <ModifiedMutedSpan />}
      </span>
    </>
  ) : (
    <span className='align-items-center'>{addressString}</span>
  )

  const nameClass = `ui--AddressComponents-address ${className}`

  return (
    <>
      <span className={containerClassName} style={style}>
        {asLink ? (
          <ViewProfileLink account={{ address }} title={title} className={nameClass} />
        ) : (
          <>{title}</>
        )}
      </span>
      {isNameWithEmailAddress && isOnHeader && <NameChip>Email</NameChip>}
    </>
  )
}

export const NameByAccountId = withProfileByAccountId(Name)

export default Name
