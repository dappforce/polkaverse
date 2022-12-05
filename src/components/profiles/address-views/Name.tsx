import { toShortAddress } from 'src/components/utils'
import { MutedSpan } from 'src/components/utils/MutedText'
import { ProfileData } from 'src/types'
import ViewProfileLink from '../ViewProfileLink'
import { useExtensionName } from './utils'
import { AddressProps } from './utils/types'
import { withProfileByAccountId } from './utils/withLoadedOwner'

type Props = AddressProps & {
  isShort?: boolean
  asLink?: boolean
  withShortAddress?: boolean
  className?: string
  containerClassName?: string
  truncate?: number | boolean
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
  style,
}: Props) => {
  const { content } = owner

  const shortAddress = toShortAddress(address)
  const addressString = isShort ? shortAddress : address.toString()
  const extensionName = useExtensionName(address)
  const name = content?.name || extensionName

  const renderName = () => {
    if (!truncate || !name) return name
    const maxLen = typeof truncate === 'boolean' ? DEFAULT_MAX_NAME_LEN : truncate
    return `${name.substring(0, maxLen)}${name.length > maxLen ? '...' : ''}`
  }

  const title = name ? (
    <span className={withShortAddress ? 'd-flex justify-content-between flex-wrap w-100' : ''}>
      <span className='align-items-center'>{renderName()}</span>
      {withShortAddress && (
        <MutedSpan>
          <code>{shortAddress}</code>
        </MutedSpan>
      )}
    </span>
  ) : (
    <span className='align-items-center'>{addressString}</span>
  )

  const nameClass = `ui--AddressComponents-address ${className}`

  return (
    <span className={containerClassName} style={style}>
      {asLink ? (
        <ViewProfileLink account={{ address }} title={title} className={nameClass} />
      ) : (
        <>{title}</>
      )}
    </span>
  )
}

export const NameByAccountId = withProfileByAccountId(Name)

export default Name
