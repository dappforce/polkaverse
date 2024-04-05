import { Circle } from '@polkadot/ui-shared/icons/types'
import Avatar from 'antd/lib/avatar/avatar'
import React, { useMemo } from 'react'
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config'

import { polkadotIcon } from '@polkadot/ui-shared'
import clsx from 'clsx'

type PolkadotIdenticonProps = {
  value: string
  size: number
  className?: string
  style?: React.CSSProperties
}

const PolkadotIdenticon = ({ value, size, ...props }: PolkadotIdenticonProps) => {
  return (
    <div>
      <PolkadotIcon
        address={value}
        size={size}
        className={clsx('h-full w-full [&_svg]:h-full [&_svg]:w-full', props.className)}
        style={props.style}
      />
    </div>
  )
}

function renderCircle({ cx, cy, fill, r }: Circle, key: number): React.ReactNode {
  return <circle cx={cx} cy={cy} fill={fill} key={key} r={r} />
}

interface Props {
  address: string
  className?: string
  isAlternative?: boolean
  size: number
  style?: React.CSSProperties
}
/**
 * Code taken from https://github.com/polkadot-js/ui/blob/master/packages/react-identicon/src/icons/Polkadot.tsx
 * @polkadot/ui-shared newest version needs node >=v18 so we can't use it
 * instead, we installed @polkadot/ui-shared v3.1 which is compatible with node v16
 */
function PolkadotIcon({
  address,
  className = '',
  isAlternative = false,
  size,
  style = {},
}: Props): React.ReactElement<Props> {
  const circles = useMemo(() => polkadotIcon(address, { isAlternative }), [address, isAlternative])

  return (
    <svg
      className={className}
      height={size}
      id={address}
      name={address}
      style={style}
      viewBox='0 0 64 64'
      width={size}
    >
      {circles.map(renderCircle)}
    </svg>
  )
}

export const IdentityIcon = React.memo((allProps: PolkadotIdenticonProps) => {
  const { value, size = DEFAULT_AVATAR_SIZE, ...props } = allProps
  const address = value?.toString() || ''

  return (
    <Avatar
      icon={
        <PolkadotIdenticon
          value={address}
          size={size - 2}
          {...props}
          className={clsx('DfIdentityIconContent')}
        />
      }
      size={size}
      className={clsx('DfIdentityIcon', props.className)}
    />
  )
})

export default IdentityIcon
