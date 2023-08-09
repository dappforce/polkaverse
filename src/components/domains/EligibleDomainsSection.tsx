import { isFunction } from '@polkadot/util'
import { newLogger, parseDomain } from '@subsocial/utils'
import { Button, Card, Result, Row, Tag } from 'antd'
import BN from 'bn.js'
import clsx from 'clsx'
import React, { FC, useEffect, useState } from 'react'
import { showErrorMessage } from 'src/components/utils/Message'
import config from 'src/config'
import { SubsocialSubstrateRpc } from 'src/rpc'
import {
  useCreateReloadMyDomains,
  useFetchDomains,
  useIsReservedWord,
} from '../../rtk/features/domains/domainHooks'
import { DomainEntity } from '../../rtk/features/domains/domainsSlice'
import { useIsMyAddress } from '../auth/MyAccountsContext'
import { FormatBalance } from '../common/balances'
import { TxCallback } from '../substrate/SubstrateTxButton'
import useSubstrate from '../substrate/useSubstrate'
import { Loading, LocalIcon } from '../utils'
import TxButton from '../utils/TxButton'
import ClaimFreeDomainModal from './ClaimFreeDomainModal'
import styles from './index.module.sass'
import { useManageDomainContext } from './manage/ManageDomainProvider'
import { DomainDetails, ResultContainer } from './utils'

const { substrateRpcUrl } = config

const log = newLogger('DD')

type DomainItemProps = {
  domain: string
  action: React.ReactNode
}

type DomainProps = {
  domain: DomainEntity
}

const subsocialRpc = new SubsocialSubstrateRpc({ rpcUrl: substrateRpcUrl })

const useGetDomainPrice = (domain: string) => {
  const [price, setPrice] = useState()

  useEffect(() => {
    const getPrice = async () => {
      const price = await subsocialRpc.calculatePrice(domain.split('.')[0])

      setPrice(price)
    }

    getPrice().catch(err => log.error('Failed to get domain price', err))
  }, [domain])

  return price
}

const BLOCK_TIME = 12
const SECS_IN_DAY = 60 * 60 * 24
const BLOCKS_IN_YEAR = new BN((SECS_IN_DAY * 365) / BLOCK_TIME)

const BuyDomainSection = ({ domain: { id: domain } }: DomainProps) => {
  const reloadMyDomains = useCreateReloadMyDomains()
  const { openManageModal } = useManageDomainContext()
  const { api, isApiReady } = useSubstrate()
  const price = useGetDomainPrice(domain)

  if (!isApiReady) return null

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
  const { promoCode } = useManageDomainContext()

  let Action = BuyDomainSection
  if (promoCode && (domain.id.endsWith('.sub') || domain.id.endsWith('.polka'))) {
    Action = ClaimFreeDomainSection
  }
  if (owner) {
    Action = UnavailableBtn
  }

  return <Action domain={domain} />
}

type FoundDomainsProps = {
  structs?: DomainEntity[]
  Action?: FC<DomainProps>
}

const FoundDomains = ({ structs = [], Action }: FoundDomainsProps) => {
  return (
    <>
      {structs.map(d => {
        const action = Action ? <Action domain={d} /> : null

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

const SuggestedDomains = ({ domain: { id } }: DomainProps) => {
  const { domain } = parseDomain(id)
  const domains = config.suggestedTlds?.map(tld => `${domain}.${tld}`)

  const { loading, domainsStruct = [] } = useFetchDomains(domains || [])

  if (loading) return null

  return (
    // <ResultContainer title='Suggested Domains' icon={<LocalIcon path={'/icons/lamp.svg'} />}>
    <ResultContainer title='Result' icon={<LocalIcon path={'/icons/reward.svg'} />}>
      <FoundDomains structs={domainsStruct} Action={DomainAction} />
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

// const ChooseDomain = ({ domain }: DomainProps) => {
//   const { domain: domainName, tld = config.resolvedDomain } = parseDomain(domain.id)
//   const { isSupported } = useIsSupportedTld(tld)
//   const id = `${domainName}.${tld}`
//   const { domainStruct } = useFetchDomain(id)
//
//   let content = null
//
//   if (!isSupported || !domainStruct) {
//     const text = '❌ Invalid Tld'
//     content = <DomainItem key={text} domain={text} action={null} />
//   } else {
//     content = <DomainItem key={id} domain={id} action={<DomainAction domain={domainStruct} />} />
//   }
//
//   return (
//     <ResultContainer title='Result' icon={<LocalIcon path={'/icons/reward.svg'} />}>
//       {content}
//     </ResultContainer>
//   )
// }

export const EligibleDomainsSection = ({ domain }: FoundDomainCardProps) => {
  // const domains = useBuildDomainsWithTldByDomain(domain)
  const { isReserved, loading: checkingWord } = useIsReservedWord(domain.id)

  // if (isEmptyArray(domains)) return null

  if (checkingWord) return <Loading label='Check domain...' />

  if (isReserved) return <ReservedDomainCard domain={domain.id} />

  return (
    <div className='GapBig d-flex flex-column mt-4'>
      {/*<ChooseDomain domain={domain} />*/}
      <SuggestedDomains domain={domain} />
      {/*<DomainsList domains={domains} />*/}
    </div>
  )
}
