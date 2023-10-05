import { InfoCircleOutlined } from '@ant-design/icons'
import { isFunction } from '@polkadot/util'
import { parseDomain } from '@subsocial/utils'
import { Button, Card, Radio, RadioChangeEvent, Result, Row, Tag, Tooltip } from 'antd'
import React, { FC, useEffect } from 'react'
import config from 'src/config'
import { useChainInfo } from 'src/rtk/features/chainsInfo/chainsInfoHooks'
import { DomainEntity } from 'src/rtk/features/domains/domainsSlice'
import { useSelectSellerConfig } from 'src/rtk/features/sellerConfig/sellerConfigHooks'
import { useSelectPendingOrderById } from '../../rtk/features/domainPendingOrders/pendingOrdersHooks'
import { useFetchDomains, useIsReservedWord } from '../../rtk/features/domains/domainHooks'
import { useIsMyAddress, useMyAccountsContext, useMyAddress } from '../auth/MyAccountsContext'
import { Loading, LocalIcon } from '../utils'
import { MutedDiv, MutedSpan } from '../utils/MutedText'
import styles from './index.module.sass'
import { useManageDomainContext } from './manage/ManageDomainProvider'
import RegisterDomainButton from './registerDomainModal/RegisterDomainModal'
import { DomainDetails, getTime, ResultContainer, useGetDomainPrice } from './utils'

type DomainItemProps = {
  domain: string
  action: React.ReactNode
}

export type DomainProps = {
  domain: DomainEntity
  label?: string
  withDivider?: boolean
  rightElement?: React.ReactNode
}

export const DomainItem = ({ domain, action }: DomainItemProps) => {
  const actionComponent = isFunction(action) ? action() : action

  return (
    <Row justify='space-between' align='middle' className={styles.DomainResultItem}>
      <span>{domain}</span>
      {actionComponent}
    </Row>
  )
}

const UnavailableBtn = ({ domain: { owner, id } }: DomainProps) => {
  const { openManageModal } = useManageDomainContext()
  const isOwned = useIsMyAddress(owner)

  return isOwned ? (
    <div>
      <Tag color='success' className='mr-2'>
        My domain
      </Tag>
      <Button onClick={() => openManageModal('menu', id)}>Edit</Button>
    </div>
  ) : (
    <Button disabled>Registered</Button>
  )
}

type DomainActionProps = DomainProps & {
  domainPrice?: string
  loadingPrice: boolean
}

const DomainAction = ({ domain, domainPrice, loadingPrice }: DomainActionProps) => {
  const { owner } = domain
  const { domainSellerKind } = useManageDomainContext()
  const sellerConfig = useSelectSellerConfig()
  const myAddress = useMyAddress()
  const pendingOrder = useSelectPendingOrderById(domain.id)
  const { setAddress } = useMyAccountsContext()
  const { dmnRegPendingOrderExpTime } = sellerConfig || {}

  const { createdByAccount: account, signer } = pendingOrder || {}

  if (account && signer && account !== myAddress && signer !== myAddress) {
    return (
      <Tooltip
        title={`Someone else currently has this domain reserved.
    If they do not buy it within ${getTime(dmnRegPendingOrderExpTime)} minutes, it will
    become available again.`}
      >
        <Button disabled={true}>Reserved</Button>
      </Tooltip>
    )
  }

  if (account && signer && account === myAddress && signer !== myAddress) {
    const onClick = () => {
      setAddress(signer)
    }

    return (
      <div>
        <Tooltip title={'You are not a purchaser. Switch to the purchaser account'}>
          <MutedSpan>
            <InfoCircleOutlined />
          </MutedSpan>
        </Tooltip>
        <Button type='primary' onClick={onClick} className='ml-2'>
          Switch account
        </Button>
      </div>
    )
  }

  return owner ? (
    <UnavailableBtn domain={domain} />
  ) : (
    <RegisterDomainButton
      domainName={domain.id}
      domainSellerKind={domainSellerKind}
      domainPrice={domainPrice}
      loadingPrice={loadingPrice}
    />
  )
}

type FoundDomainsProps = {
  structs?: DomainEntity[]
  Action?: FC<DomainActionProps>
  domainPrice?: string
  loadingPrice: boolean
}

const FoundDomains = ({ structs = [], Action, domainPrice, loadingPrice }: FoundDomainsProps) => {
  return (
    <>
      {structs.map(d => {
        const action = Action ? (
          <Action domain={d} domainPrice={domainPrice} loadingPrice={loadingPrice} />
        ) : null

        return <DomainItem key={d.id} domain={d.id} action={action} />
      })}
    </>
  )
}

type FoundDomainCardProps = {
  domain: DomainDetails
  err?: string
}

const ReservedDomainCard = ({ domain }: Omit<DomainItemProps, 'action'>) => {
  const { domain: domainName } = parseDomain(domain)
  return (
    <Card className={styles.DomainResults}>
      <Result
        icon={<LocalIcon path={'/icons/auction.svg'} style={{ width: 72 }} />}
        title={
          <div>
            The word <span className={'font-weight-bold'}>{domainName}</span> is reserved for now.
          </div>
        }
        subTitle='We will be selling this domain via auctions in the future.'
      />
    </Card>
  )
}

const SuggestedDomains = ({ domain: { id }, rightElement, withDivider }: DomainProps) => {
  const { domain } = parseDomain(id)
  const domains = config.suggestedTlds?.map(tld => `${domain}.${tld}`)
  const { price: domainPrice, loading: loadingPrice } = useGetDomainPrice(id)

  const { loading, domainsStruct = [] } = useFetchDomains(domains || [])

  if (loading) return null

  return (
    // <ResultContainer title='Suggested Domains' icon={<LocalIcon path={'/icons/lamp.svg'} />}>
    <ResultContainer
      title='Result'
      rightElement={rightElement}
      withDivider={withDivider}
      icon={<LocalIcon path={'/icons/reward.svg'} />}
    >
      <FoundDomains
        structs={domainsStruct}
        Action={DomainAction}
        domainPrice={domainPrice}
        loadingPrice={loadingPrice}
      />
    </ResultContainer>
  )
}

// type LoadMoreDomainsProps = {
//   api?: SubsocialApi
//   dispatch: AppDispatch
//   page: number
//   size: number
//   ids: string[]
// }

// const loadMoreDomains = async (props: LoadMoreDomainsProps) => {
//   const { api, dispatch, page, size, ids = [] } = props

//   if (!api) return []

//   const domains = await getPageOfIds(ids, { page, size })

//   await dispatch(fetchDomains({ api, ids: domains }))

//   return domains
// }

// type DomainsListProps = {
//   domains: string[]
// }

// const DomainCardByDomain = ({ domain }: Omit<DomainItemProps, 'action'>) => {
//   const domainStruct = useAppSelector(state => selectDomain(state, domain))

//   if (!domainStruct) return null

//   return <DomainItem key={domain} domain={domain} action={<DomainAction domain={domainStruct} />} />
// }

// const DomainsList = ({ domains }: DomainsListProps) => {
//   const dispatch = useDispatch()
//   const { isApiReady, subsocial } = useSubstrate()

//   const List = useCallback(
//     () => (
//       <InfiniteListByData
//         className={clsx('fontSizeNormal', 'm-0', styles.DomainInfiniteListContainer)}
//         totalCount={domains.length}
//         loadMore={(page, size) =>
//           loadMoreDomains({ page, size, api: subsocial, dispatch, ids: domains })
//         }
//         getKey={key => key}
//         renderItem={(domain: string) => <DomainCardByDomain domain={domain} />}
//       />
//     ),
//     [isApiReady],
//   )

//   return (
//     <ResultContainer title='Available Domains' icon={<LocalIcon path={'/icons/success.svg'} />}>
//       <List />
//     </ResultContainer>
//   )
// }

const variantOpt = [
  { value: 'SUB', label: 'SUB', chain: 'subsocial' },
  { value: 'DOT', label: 'DOT', chain: 'polkadot' },
]

// const ChooseDomain = ({ domain, rightElement }: DomainProps) => {
//   const { domain: domainName, tld = config.resolvedDomain } = parseDomain(domain.id)
//   const { isSupported } = useIsSupportedTld(tld)
//   const id = `${domainName}.${tld}`
//   const { domainStruct } = useFetchDomain(id)

//   let content = null

//   if (!isSupported || !domainStruct) {
//     const text = '❌ Invalid Tld'
//     content = <DomainItem key={text} domain={text} action={null} />
//   } else {
//     content = <DomainItem key={id} domain={id} action={<DomainAction domain={domainStruct} />} />
//   }

//   const title = (
//     <div className='d-flex align-items-center justify-content-between w-100'>
//       <div>Result: </div>
//     </div>
//   )

//   return (
//     <ResultContainer
//       title={title}
//       rightElement={rightElement}
//       icon={<LocalIcon path={'/icons/reward.svg'} />}
//     >
//       <Divider className='w-100 m-0 mt-1' />
//       {content}
//     </ResultContainer>
//   )
// }

export const EligibleDomainsSection = ({ domain }: FoundDomainCardProps) => {
  // const domains = useBuildDomainsWithTldByDomain(domain)
  const { isReserved, loading: checkingWord } = useIsReservedWord(domain.id)
  const { setVariant } = useManageDomainContext()
  const chainsInfo = useChainInfo()

  // if (isEmptyArray(domains)) return null

  useEffect(() => {
    setVariant('SUB')
  }, [domain.id])

  if (checkingWord) return <Loading label='Check domain...' />

  if (isReserved) return <ReservedDomainCard domain={domain.id} />

  const onVariantChange = (e: RadioChangeEvent) => {
    setVariant(e.target.value)
  }

  const rightElement = (
    <>
      <div className='d-flex aling-items-center'>
        <MutedDiv className='mr-2 FontNormal lh-lg font-weight-normal'>Buy with</MutedDiv>
        <Radio.Group
          onChange={onVariantChange}
          defaultValue={'SUB'}
          className={styles.BuyWithRadio}
        >
          {variantOpt.map(({ value, label, chain }, i) => {
            const disable = chain !== 'subsocial' && !chainsInfo[chain]?.tokenSymbols

            return (
              <Radio.Button key={i} value={value} disabled={disable}>
                {label}
              </Radio.Button>
            )
          })}
        </Radio.Group>
      </div>
    </>
  )

  return (
    <div className='GapBig d-flex flex-column mt-4'>
      {/* <ChooseDomain domain={domain} /> */}
      <SuggestedDomains domain={domain} rightElement={rightElement} withDivider />
      {/* <DomainsList domains={domains} /> */}
    </div>
  )
}
