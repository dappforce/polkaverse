import { parseDomain } from '@subsocial/utils'
import clsx from 'clsx'
import { FC, HTMLProps } from 'react'
import {
  CardWithTitle as InnerCardWithTitle,
  CardWithTitleProps,
} from 'src/components/utils/cards/WithTitle'
import config from 'src/config'
import { AnyAccountId } from 'src/types'
import { slugifyHandle } from '../urls/helpers'
import { useAddClassNameToRootElement } from '../utils'
import styles from './index.module.sass'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useMyAddress } from '../auth/MyAccountsContext'
import { useManageDomainContext } from './manage/ManageDomainProvider'
import { LoadingOutlined } from '@ant-design/icons'
import { controlledMessage } from '../utils/Message'
import { u8aToString } from '@polkadot/util';
import { useCreateReloadDomain, useCreateReloadMyDomains } from 'src/rtk/features/domains/domainHooks'

const { resolvedDomain } = config

type ResultContainerProps = Omit<HTMLProps<HTMLDivElement>, 'title'> & {
  title: React.ReactNode
  icon: JSX.Element
}

export const ResultContainer = ({
  title,
  className,
  icon,
  children,
  ...props
}: ResultContainerProps) => {
  return (
    <div className={clsx('d-flex flex-column', className)}>
      <h2 {...props} className={clsx('d-flex align-items-center ColorCurrentColor')}>
        {icon && <div className='mr-2 d-flex'>{icon}</div>}
        {title}
      </h2>
      <div className='d-flex flex-column GapNormal'>{children}</div>
    </div>
  )
}

export const CardWithTitle: FC<CardWithTitleProps> = props => (
  <InnerCardWithTitle {...props} cardClassName={styles.DomainResults} />
)

export const useAddAstronautBg = () => useAddClassNameToRootElement('astronaut-bg')

export type DomainStruct = {
  owner: AnyAccountId
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
      href='https://docs.subsocial.network/docs/tutorials/dotsama-domains'
      target='_blank'
      rel='noreferrer'
    >
      <span>Learn More</span>
    </a>
  )
}

const waitMessage = controlledMessage({
  message: 'Waiting for domain registration',
  type: 'info',
  duration: 0,
  icon: <LoadingOutlined />,
})

export const useFetchNewDomains = (domainName: string) => {
  const myAddress = useMyAddress()
  const { setIsFetchNewDomains, isFetchNewDomains, openManageModal } = useManageDomainContext()
  const reloadMyDomains = useCreateReloadMyDomains()
  const reloadDomain = useCreateReloadDomain()

  useSubsocialEffect(
    ({ substrate }) => {
      setIsFetchNewDomains(false)
      if (!myAddress || !isFetchNewDomains) return

      let unsub: any


      const subscription = async () => {
        const api = await (await substrate.api).isReady
        waitMessage.open()

        unsub = await api.query.domains.domainsByOwner(myAddress, (data: any[]) => {
          const dataHuman = data.map((x) => u8aToString(x))
          
          if (dataHuman.includes(domainName)) {
            reloadMyDomains()
            reloadDomain(domainName)
            waitMessage.close()
            openManageModal('success', domainName)
          }
        })
      }

      subscription().catch(err => console.error(err))

      return () => unsub && unsub()
    },
    [isFetchNewDomains, myAddress],
  )
}