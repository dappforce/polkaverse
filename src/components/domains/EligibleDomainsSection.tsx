import { isFunction } from '@polkadot/util'
import { isEmptyArray, newLogger, parseDomain } from '@subsocial/utils'
import { Button, Card, Divider, Radio, RadioChangeEvent, Result, Row, Tag } from 'antd'
import BN from 'bn.js'
import clsx from 'clsx'
import React, { useState } from 'react'
import { showErrorMessage } from 'src/components/utils/Message'
import config from 'src/config'
import {
  useBuildDomainsWithTldByDomain,
  useCreateReloadMyDomains,
  useFetchDomain,
  useIsReservedWord,
  useIsSupportedTld,
} from '../../rtk/features/domains/domainHooks'
import { DomainEntity } from '../../rtk/features/domains/domainsSlice'
import { useIsMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance } from '../common/balances'
import { TxCallback } from '../substrate/SubstrateTxButton'
import useSubstrate from '../substrate/useSubstrate'
import { Loading, LocalIcon } from '../utils'
import TxButton from '../utils/TxButton'
import ClaimFreeDomainModal from './ClaimFreeDomainModal'
import BuyByDotButton from './dot-seller/BuyByDotModal'
import styles from './index.module.sass'
import { useManageDomainContext } from './manage/ManageDomainProvider'
import { DomainDetails, ResultContainer } from './utils'
import { MutedDiv } from '../utils/MutedText';

const log = newLogger('DD')

type DomainItemProps = {
  domain: string
  action: React.ReactNode
}

type DomainProps = {
  domain: DomainEntity
}

const BLOCK_TIME = 12
const SECS_IN_DAY = 60 * 60 * 24
const BLOCKS_IN_YEAR = new BN((SECS_IN_DAY * 365) / BLOCK_TIME)

const BuyDomainSection = ({ domain: { id: domain } }: DomainProps) => {
  const reloadMyDomains = useCreateReloadMyDomains()
  const { openManageModal } = useManageDomainContext()
  const { api, isApiReady } = useSubstrate()

  if (!isApiReady) return null

  const price = api?.consts.domains.baseDomainDeposit.toString()

  const getTxParams = () => {
    return [domain, null, BLOCKS_IN_YEAR]
  }

  const onSuccess: TxCallback = async () => {
    await reloadMyDomains()
    openManageModal('success', domain)
  }

  const onFailed = async (errorInfo: any) => {
    const jsonErr = JSON.stringify(errorInfo)
    log.error('Failed:', jsonErr)
    showErrorMessage(jsonErr)
  }

  return (
    <span className='d-flex align-items-center'>
      {price && <FormatBalance className='mr-2' value={price} isShort />}
      <TxButton
        type='primary'
        customNodeApi={api}
        block
        size='middle'
        label={'Register'}
        tx={'domains.registerDomain'}
        onSuccess={onSuccess}
        onFailed={onFailed}
        // onClick={onSuccess} // ! for debug
        isFreeTx
        params={getTxParams}
        className={styles.DomainPrimaryButton}
      />
    </span>
  )
}

const ClaimFreeDomainSection = ({ domain: { id: domain } }: DomainProps) => {
  const [openConfirmation, setOpenConfirmation] = useState(false)
  const { promoCode } = useManageDomainContext()
  return (
    <div className='d-flex align-items-center'>
      <ClaimFreeDomainModal
        onCancel={() => setOpenConfirmation(false)}
        visible={openConfirmation}
        domain={domain}
        promoCode={promoCode}
      />
      <span className='font-weight-bold mr-2'>Free</span>
      <Button
        type='primary'
        size='middle'
        className={clsx(styles.DomainPrimaryButton)}
        onClick={() => setOpenConfirmation(true)}
      >
        <span style={{ position: 'relative', top: '-1px' }} className='mr-1'>
          🎁
        </span>
        Claim
      </Button>
    </div>
  )
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

const DomainAction = ({ domain }: DomainProps) => {
  const { owner } = domain
  const { promoCode, variant } = useManageDomainContext()

  let DefaultDomainAction =
    promoCode && domain.id.endsWith('.sub') ? ClaimFreeDomainSection : BuyDomainSection

  const action =
    variant === 'SUB' ? (
      <DefaultDomainAction domain={domain} />
    ) : (
      <BuyByDotButton domain={domain} className={styles.BuyBtn} />
    )

  return owner ? <UnavailableBtn domain={domain} /> : action
}

// type FoundDomainsProps = {
//   structs?: DomainEntity[]
//   Action?: FC<DomainProps>
// }

// const FoundDomains = ({ structs = [], Action }: FoundDomainsProps) => {
//   return (
//     <>
//       {structs.map(d => {
//         const action = Action ? <Action domain={d} /> : null
//
//         return <DomainItem key={d.id} domain={d.id} action={action} />
//       })}
//     </>
//   )
// }
//
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

// const SuggestedDomains = ({ domain: { id } }: DomainProps) => {
//   const { domain, tld = config.resolvedDomain } = parseDomain(id)
//   const domains = config.suggestedTlds?.filter(_tld => _tld !== tld).map(tld => `${domain}.${tld}`)
//
//   const { loading, domainsStruct = [] } = useFetchDomains(domains || [])
//
//   if (loading) return null
//
//   return (
//     <ResultContainer title='Suggested Domains' icon={<LocalIcon path={'/icons/lamp.svg'} />}>
//       <FoundDomains structs={domainsStruct} Action={DomainAction} />
//     </ResultContainer>
//   )
// }

// type LoadMoreDomainsProps = {
//   api?: SubsocialApi
//   dispatch: AppDispatch
//   page: number
//   size: number
//   ids: string[]
// }

// const loadMoreDomains = async (props: LoadMoreDomainsProps) => {
//   const { api, dispatch, page, size, ids = [] } = props
//
//   if (!api) return []
//
//   const domains = await getPageOfIds(ids, { page, size })
//
//   await dispatch(fetchDomains({ api, ids: domains }))
//
//   return domains
// }

// type DomainsListProps = {
//   domains: string[]
// }

// const DomainCardByDomain = ({ domain }: Omit<DomainItemProps, 'action'>) => {
//   const domainStruct = useAppSelector(state => selectDomain(state, domain))
//
//   if (!domainStruct) return null
//
//   return <DomainItem key={domain} domain={domain} action={<DomainAction domain={domainStruct} />} />
// }

// const DomainsList = ({ domains }: DomainsListProps) => {
//   const dispatch = useDispatch()
//   const { isApiReady, subsocial } = useSubstrate()
//
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
//
//   return (
//     <ResultContainer title='Available Domains' icon={<LocalIcon path={'/icons/success.svg'} />}>
//       <List />
//     </ResultContainer>
//   )
// }

const variantOpt = [
  { value: 'SUB', label: 'SUB' },
  { value: 'DOT', label: 'DOT' },
]

const ChooseDomain = ({ domain }: DomainProps) => {
  const { domain: domainName, tld = config.resolvedDomain } = parseDomain(domain.id)
  const { isSupported } = useIsSupportedTld(tld)
  const id = `${domainName}.${tld}`
  const { domainStruct } = useFetchDomain(id)
  const { setVariant } = useManageDomainContext()

  let content = null

  if (!isSupported || !domainStruct) {
    const text = '❌ Invalid Tld'
    content = <DomainItem key={text} domain={text} action={null} />
  } else {
    content = <DomainItem key={id} domain={id} action={<DomainAction domain={domainStruct} />} />
  }

  const onVariantChange = (e: RadioChangeEvent) => {
    setVariant(e.target.value)
  }

  const title = (
    <div className='d-flex align-items-center justify-content-between w-100'>
      <div>Result: </div>
      <div className='d-flex aling-items-center'>
        <MutedDiv className='mr-2 FontNormal lh-lg font-weight-normal'>Buy with</MutedDiv>
        <Radio.Group onChange={onVariantChange} defaultValue={'SUB'} className={styles.BuyWithRadio}>
          {variantOpt.map(({ value, label }, i) => (
            <Radio.Button key={i} value={value}>
              {label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>
    </div>
  )

  return (
    <ResultContainer title={title} icon={<LocalIcon path={'/icons/reward.svg'} />}>
      <Divider className='w-100 m-0 mt-1' />
      {content}
    </ResultContainer>
  )
}

export const EligibleDomainsSection = ({ domain }: FoundDomainCardProps) => {
  const domains = useBuildDomainsWithTldByDomain(domain)
  const { isReserved, loading: checkingWord } = useIsReservedWord(domain.id)

  if (isEmptyArray(domains)) return null

  if (checkingWord) return <Loading label='Check domain...' />

  if (isReserved) return <ReservedDomainCard domain={domain.id} />

  return (
    <div className='GapBig d-flex flex-column mt-4'>
      <ChooseDomain domain={domain} />
      {/*<SuggestedDomains domain={domain} />*/}
      {/*<DomainsList domains={domains} />*/}
    </div>
  )
}
