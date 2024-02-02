import Avatar from 'antd/lib/avatar/avatar'
import React, { useEffect, useRef } from 'react'
import { DEFAULT_AVATAR_SIZE } from 'src/config/Size.config'

import clsx from 'clsx'
import * as jdenticon from 'jdenticon'

type JdenticonProps = {
  value: string
  size: number
  className?: string
  style?: React.CSSProperties
}

const Jdenticon = ({ value, size, ...props }: JdenticonProps) => {
  const icon = useRef<any>(null)
  useEffect(() => {
    jdenticon.update(icon?.current, value)
  }, [value])

  return (
    <div>
      <svg data-jdenticon-value={value} height={size} ref={icon} width={size} {...props} />
    </div>
  )
}

export const IdentityIcon = React.memo((allProps: JdenticonProps) => {
  const { value, size = DEFAULT_AVATAR_SIZE, ...props } = allProps
  const address = value?.toString() || ''

  return (
    <Avatar
      icon={
        <Jdenticon
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
