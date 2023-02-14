/* eslint-disable no-mixed-operators */
import { LoadingOutlined } from '@ant-design/icons'
import { hexToBn } from '@polkadot/util'
import { isEmptyStr } from '@subsocial/utils'
import BN from 'bn.js'
import clsx from 'clsx'
import dayjs from 'dayjs'
import isbot from 'isbot'
import NextError from 'next/error'
import queryString from 'query-string'
import React, { useEffect } from 'react'
import { IconBaseProps } from 'react-icons'
import config from 'src/config'
import { AnyAccountId, PostStruct, SpaceStruct } from 'src/types'
import { useIsMyAddress } from '../auth/MyAccountsContext'
import { ButtonLink } from './CustomLinks'
import { BareProps } from './types'

export * from './IconWithLabel'

const { appBaseUrl, ipfsNodeUrl } = config

import { Skeleton } from 'antd'
import Avatar from 'antd/lib/avatar/avatar'
import { AvatarSize } from 'antd/lib/avatar/SizeContext'
import { InstallUrl, Urls } from '../wallets/types'
import * as offchain from './OffchainUtils'

export const offchainApi = { ...offchain }

export const ZERO = new BN(0)
export const ONE = new BN(1)

// Substrate/Polkadot API utils
// --------------------------------------

// Parse URLs
// --------------------------------------

export function getUrlParam(
  location: Location,
  paramName: string,
  deflt?: string,
): string | undefined {
  const params = queryString.parse(location.search)
  return params[paramName] ? (params[paramName] as string) : deflt
}

// Next.js utils
// --------------------------------------

export function isServerSide(): boolean {
  return typeof window === 'undefined'
}

export function isClientSide(): boolean {
  return !isServerSide()
}

export const isHomePage = (): boolean => isClientSide() && window.location.pathname === '/'

export const isBot = () => (isClientSide() ? isbot(window.navigator.userAgent) : false)

type LoadingProps = {
  label?: React.ReactNode
  style?: React.CSSProperties
  center?: boolean
}

export const Loading = ({ label, style, center = true }: LoadingProps) => {
  const alignCss = center ? 'justify-content-center align-items-center' : ''
  return (
    <div className={`d-flex w-100 h-100 pt-4 pb-3 ${alignCss}`} style={style}>
      <LoadingOutlined />
      {label && <em className='ml-3 text-muted FontSmall'>{label}</em>}
    </div>
  )
}

export const LoadingSpaces = () => <Loading label='Loading spaces...' />

export const LoadingPosts = () => <Loading label='Loading posts...' />

export const DEFAULT_DATE_FORMAT = 'lll'

export const formatDate = (date: dayjs.ConfigType | BN, format = DEFAULT_DATE_FORMAT) => {
  date = BN.isBN(date) ? date.toNumber() : date
  return dayjs(date).format(format)
}

/**
 * Generate a temporary comment id that will be used on UI until comment is persisted
 * in the blockchain and replaced with the real data and id from blockchain storage.
 */
export const tmpClientId = () => `fake-id-${new Date().getTime()}`

type VisibilityProps = {
  struct?: PostStruct | SpaceStruct
  address?: AnyAccountId
}

type HasHidden = {
  hidden?: boolean
}

export const isVisible = (struct?: HasHidden) => struct && !struct.hidden
export const isHidden = (struct?: HasHidden) => !isVisible(struct)

export const useIsVisible = (props: VisibilityProps) => {
  const { address, struct } = props
  const isMyAddress = useIsMyAddress(address || struct?.ownerId)

  return isMyAddress || isVisible(struct)
}

export const useIsHidden = (props: VisibilityProps) => !useIsVisible(props)

export const toShortAddress = (_address: AnyAccountId) => {
  const address = (_address || '').toString()

  return address.length > 13 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address
}

export const toViewportHeight = (_height: number) => {
  return _height + 'vh'
}

const httpPrefixRegex = /^(https?:\/\/)/
export const toShortUrl = (_url: string) => {
  if (isEmptyStr(_url)) return undefined

  const url = _url.startsWith('http') ? _url.replace(httpPrefixRegex, '') : _url

  return url.length > 53 ? `${url.slice(0, 53)}…${url.slice(-5)}` : url
}

export const gtZero = (n?: BN | number | string): boolean => {
  if (typeof n === 'undefined') return false

  if (typeof n === 'number') {
    return n > 0
  } else {
    try {
      const bn = new BN(n)
      return bn.gt(ZERO)
    } catch {
      return false
    }
  }
}

export const calcVotingPercentage = (upvotesCount: BN, downvotesCount: BN) => {
  const totalCount = upvotesCount.add(downvotesCount)
  if (totalCount.eq(ZERO)) return 0

  const per = (upvotesCount.toNumber() / totalCount.toNumber()) * 100
  const ceilPer = Math.ceil(per)

  if (per >= 50) {
    return {
      percantage: ceilPer,
      color: 'green',
    }
  } else {
    return {
      percantage: 100 - ceilPer,
      color: 'red',
    }
  }
}

export const resolveBn = (value: BN | string) => {
  try {
    return new BN(value)
  } catch {
    return hexToBn(value.toString())
  }
}

export const startWithUpperCase = (str: string) =>
  str.replace(/(?:^\s*|\s+)(\S?)/g, b => b.toUpperCase())

// type ViewOnBlockchainProps = {
//   createdAtBlock: number
//   label?: string
// }

// export const ViewOnBlockchainLink = ({ createdAtBlock, label = 'View on blockchain' }: ViewOnBlockchainProps) => {
//   return <a target='_blank' rel='noreferrer' className='item' href={`${polkaStatsUrl}/block?blockNumber=${createdAtBlock}`}>{label}</a>
// }

type ViewOnIpfsProps = {
  contentId?: string
  label?: string
}

export const ViewOnIpfs = ({ contentId, label = 'View on IPFS' }: ViewOnIpfsProps) => {
  return (
    <a
      target='_blank'
      rel='noreferrer'
      className='item'
      href={`${ipfsNodeUrl}/api/v0/dag/get?arg=${contentId}`}
    >
      {label}
    </a>
  )
}

export const PageNotFound = () => <NextError statusCode={404} />

type BackToMainPageButtonProps = {
  msg?: string
}

export const BackToMainPageButton = ({ msg }: BackToMainPageButtonProps) => (
  <ButtonLink size='large' href={appBaseUrl}>
    {msg || 'Back to the main page'}
  </ButtonLink>
)

type SubIconProps = IconBaseProps & {
  Icon: (props: IconBaseProps) => JSX.Element
}

export const SubIcon = ({ Icon, className, ...props }: SubIconProps) => (
  <Icon className={`anticon ${className}`} {...props} />
)

type LocalIconProps = BareProps & {
  path: string
}
export const LocalIcon = ({ path, className, style }: LocalIconProps) => (
  <img src={`/images/${path}`} style={style} className={clsx('anticon', className)} />
)

export const useAddClassNameToRootElement = (className: string) => {
  useEffect(() => {
    const nextRootEl = document.getElementById('__next')

    if (!nextRootEl) return

    nextRootEl.classList.add(className)

    return () => {
      nextRootEl.classList.remove(className)
    }
  })
}

export const getIconUrl = (icon: string) => `/images/${icon}`

type AvatarOrSkeletonProps = BareProps & {
  icon: string
  size?: AvatarSize
  externalIcon?: boolean
}

export const AvatarOrSkeleton = ({
  size,
  icon,
  className,
  externalIcon = false,
}: AvatarOrSkeletonProps) => {
  if (icon) {
    const imgUrl = externalIcon ? icon : getIconUrl(icon)

    return <Avatar src={imgUrl} size={size} className={className} />
  } else {
    return <Skeleton.Avatar size={size as number} shape='circle' className={className} />
  }
}

const browsers = ['Chrome', 'Firefox']

export const detectBrowser = () => {
  let browser = 'Unknown'

  for (let browserName of browsers) {
    if (navigator.userAgent.indexOf(browserName) != -1) {
      browser = browserName
      break
    }
  }

  return browser
}

export const getInstallUrl = (instalUrls: InstallUrl) => {
  const browser = detectBrowser()

  return instalUrls[browser as Urls]
}
