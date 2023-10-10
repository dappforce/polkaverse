import { LoadingOutlined } from '@ant-design/icons'
import { parseDomain } from '@subsocial/utils'
import { Divider } from 'antd'
import BN from 'bignumber.js'
import clsx from 'clsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { FC, HTMLProps, useEffect, useMemo, useState } from 'react'
import {
  CardWithTitle as InnerCardWithTitle,
  CardWithTitleProps,
} from 'src/components/utils/cards/WithTitle'
import config from 'src/config'
import { getOrInitSubsocialRpc } from 'src/rpc/initSubsocialRpc'
import { useCreateRemovePendingOrders } from 'src/rtk/features/domainPendingOrders/pendingOrdersHooks'
import { useCreateUpsertDomains } from 'src/rtk/features/domains/domainHooks'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useMyAddress } from '../auth/MyAccountsContext'
import { slugifyHandle } from '../urls/helpers'
import { useAddClassNameToRootElement } from '../utils'
import { controlledMessage } from '../utils/Message'
import { log } from './BuyDomainButtons'
import styles from './index.module.sass'
import { DomainSellerKind, useManageDomainContext } from './manage/ManageDomainProvider'

dayjs.extend(utc)

const BLOCK_TIME = 12
const SECS_IN_DAY = 60 * 60 * 24
export const BLOCKS_IN_YEAR = new BN((SECS_IN_DAY * 365) / BLOCK_TIME)

const { resolvedDomain } = config

type ResultContainerProps = Omit<HTMLProps<HTMLDivElement>, 'title'> & {
  title: React.ReactNode
  icon: JSX.Element
  rightElement?: React.ReactNode
  withDivider?: boolean
}

export const ResultContainer = ({
  title,
  className,
  icon,
  children,
  rightElement,
  withDivider,
  ...props
}: ResultContainerProps) => {
  return (
    <div className={clsx('d-flex flex-column', className)}>
      <div className='d-flex align-items-center justify-content-between w-100'>
        <h2 {...props} className={clsx('d-flex align-items-center mb-0 ColorCurrentColor')}>
          {icon && <div className='mr-2 d-flex'>{icon}</div>}
          {title}
        </h2>
        {rightElement}
      </div>
      {withDivider && <Divider className='w-100 m-0 mt-3 mb-3' />}
      <div className='d-flex flex-column GapNormal'>{children}</div>
    </div>
  )
}

export const CardWithTitle: FC<CardWithTitleProps> = props => (
  <InnerCardWithTitle {...props} cardClassName={styles.DomainResults} />
)

export const getTime = (miliseconds?: number) => {
  if (!miliseconds) return '-'

  return miliseconds / 60 / 1000
}

export const useAddAstronautBg = () => useAddClassNameToRootElement('astronaut-bg')

export type DomainStruct = {
  owner: string
  outerValue?: string
  expiresAt: string
  soldFor: string
  innerSpace?: string
}

export type DomainDetails = DomainStruct & {
  id: string
}

export const cutResolvedDomain = (maybeHandle?: string) => {
  const tldForResolve = '.' + resolvedDomain

  return maybeHandle?.endsWith(tldForResolve)
    ? maybeHandle?.substr(0, maybeHandle?.length - tldForResolve.length)
    : maybeHandle
}

export const slugifyDomain = (maybeHandle?: string) => {
  const tldForResolve = '.' + resolvedDomain

  return slugifyHandle(
    maybeHandle?.endsWith(tldForResolve)
      ? maybeHandle?.substr(0, maybeHandle?.length - tldForResolve.length)
      : maybeHandle,
  )
}

export const resolveDomain = (maybeHandle: string) => {
  const { domain, tld = config.resolvedDomain } = parseDomain(maybeHandle)

  return `${domain.replace(/[^a-z0-9-]/g, '')}.${tld}`
}

export const UnamesLearnMoreLink = ({ className, ...props }: HTMLProps<HTMLAnchorElement>) => {
  return (
    <a
      {...props}
      className={clsx(className)}
      href='https://docs.subsocial.network/docs/tutorials/usernames'
      target='_blank'
      rel='noreferrer'
    >
      <span style={{ whiteSpace: 'nowrap' }}>Learn More</span>
    </a>
  )
}

const waitMessage = controlledMessage({
  message: 'Waiting for domain registration',
  type: 'info',
  duration: 0,
  icon: <LoadingOutlined />,
})

export const useFetchNewDomains = () => {
  const myAddress = useMyAddress()
  const { setDomainToFetch, domainToFetch, openManageModal, setProcessingDomains } =
    useManageDomainContext()
  const upsertDomains = useCreateUpsertDomains()
  const removePendingOrder = useCreateRemovePendingOrders()

  useSubsocialEffect(
    ({ substrate }) => {
      if (!myAddress || !domainToFetch) return

      let unsub: any

      const subscription = async () => {
        const api = await (await substrate.api).isReady
        waitMessage.open()

        unsub = await api.query.domains.registeredDomains(domainToFetch, data => {
          const domain = data.unwrapOr(undefined)

          if (domain) {
            const domainEntity = {
              id: domainToFetch,
              ...(domain as unknown as DomainStruct),
            }

            setDomainToFetch(undefined)
            removePendingOrder({ domainName: domainToFetch })
            setProcessingDomains({ [domainToFetch]: false })
            upsertDomains({ domain: domainEntity, address: myAddress, domainName: domainToFetch })
            waitMessage.close()
            openManageModal('success', domainToFetch)
          }
        })
      }

      subscription().catch(err => console.error(err))

      return () => unsub && unsub()
    },
    [domainToFetch, myAddress],
  )
}

export const useGetDomainPrice = (domain: string) => {
  const [price, setPrice] = useState()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getPrice = async () => {
      setLoading(true)
      try {
        const subsocialRpc = getOrInitSubsocialRpc()

        const { domain: domainPart } = parseDomain(domain)
        const price = await subsocialRpc.calculatePrice(domainPart)

        if (price) {
          setPrice(price)
        }
        setLoading(false)
      } catch (err) {
        log.error('Failed to get domain price', err)
        setLoading(false)
        setPrice(undefined)
      }
    }

    getPrice().catch(err => log.error('Failed to get domain price', err))
  }, [domain])

  return { loading, price }
}

export const useGetPrice = (domainSellerKind: DomainSellerKind, domainPrice?: string) => {
  const sellerConfig = useSelectSellerConfig()
  const { domainRegistrationPriceFactor } = sellerConfig || {}

  const isSub = domainSellerKind === 'SUB'

  const price = useMemo(() => {
    if (!domainPrice) return '0'

    if (isSub) {
      return domainPrice
    } else {
      if (!domainRegistrationPriceFactor) return '0'
      return new BN(domainPrice).multipliedBy(new BN(domainRegistrationPriceFactor)).toString()
    }
  }, [isSub, domainPrice, domainRegistrationPriceFactor])

  return price
}
