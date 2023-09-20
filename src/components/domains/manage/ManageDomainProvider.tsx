import { useRouter } from 'next/router'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useMyAddress } from '../../auth/MyAccountsContext'
import { ManageDomainModal } from './DomainManageModal'

export type MenuSteps = 'subid' | 'inner' | 'outer' | 'menu' | 'success'
type OpenManageModalFn = (step: MenuSteps, domain?: string) => void

type ManageDomainProviderState = {
  currentStep?: MenuSteps
  openManageModal: OpenManageModalFn
  promoCode?: string
  clearPromoCode: () => void
  domainSellerKind: DomainSellerKind
  setVariant: (domainSellerKind: DomainSellerKind) => void
  recipient: string
  setRecipient: (recipient: string) => void
  purchaser: string
  setPurchaser: (recipient: string) => void
  domainToFetch?: string
  setDomainToFetch: (domainToFetch?: string) => void
  processingDomains: Record<string, boolean>
  setProcessingDomains: (processingDomains: Record<string, boolean>) => void
}

export type DomainSellerKind = 'SUB' | 'DOT'

const ManageDomainContext = createContext<ManageDomainProviderState>({} as any)

export const ManageDomainProvider: React.FC<{ promoCode?: string }> = ({ children, promoCode }) => {
  const myAddress = useMyAddress()

  const [currentStep, setStep] = useState<MenuSteps>()
  const [domain, setDomain] = useState<string>()
  const [visible, setVisible] = useState(true)
  const [domainSellerKind, setVariant] = useState<DomainSellerKind>('SUB')
  const [recipient, setRecipient] = useState<string>(myAddress || '')
  const [purchaser, setPurchaser] = useState<string>(myAddress || '')
  const [domainToFetch, setDomainToFetch] = useState<string>()
  const [processingDomains, setProcessingDomains] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!myAddress) return

    setRecipient(myAddress)
    setPurchaser(myAddress)
  }, [myAddress])

  const router = useRouter()
  const [activePromoCode, setActivePromoCode] = useState(promoCode)
  const clearPromoCode = () => {
    setActivePromoCode('')
    const queries = router.query
    delete queries['promo']
    router.replace({ query: queries })
  }

  const openManageModal: OpenManageModalFn = (step, domain) => {
    setStep(step)
    setVisible(true)
    domain && setDomain(domain)
  }

  const close = () => {
    setVisible(false)
    setStep(undefined)
    setDomain(undefined)
  }

  const value = {
    currentStep,
    openManageModal,
    domainSellerKind,
    setVariant,
    recipient,
    setRecipient,
    promoCode: activePromoCode,
    clearPromoCode,
    purchaser,
    setPurchaser,
    domainToFetch,
    setDomainToFetch,
    processingDomains,
    setProcessingDomains: (newData: Record<string, boolean>) =>
      setProcessingDomains({ ...processingDomains, ...newData }),
  }

  return (
    <ManageDomainContext.Provider value={value}>
      {children}
      {domain && <ManageDomainModal domain={domain} close={close} visible={visible} />}
    </ManageDomainContext.Provider>
  )
}

export const useManageDomainContext = () => useContext(ManageDomainContext)
