import { useRouter } from 'next/router'
import React, { createContext, useContext, useState } from 'react'
import { useMyAddress } from '../../auth/MyAccountsContext'
import { ManageDomainModal } from './DomainManageModal'

export type MenuSteps = 'subid' | 'inner' | 'outer' | 'menu' | 'success'
type OpenManageModalFn = (step: MenuSteps, domain?: string) => void

type ManageDomainProviderState = {
  currentStep?: MenuSteps
  openManageModal: OpenManageModalFn
  promoCode?: string
  clearPromoCode: () => void
  variant: Variant
  setVariant: (variant: Variant) => void
  recipient: string
  setRecipient: (recipient: string) => void
  purchaser: string
  setPurchaser: (recipient: string) => void
  isFetchNewDomains: boolean
  setIsFetchNewDomains: (isFetchNewDomains: boolean) => void
  processingDomains: Record<string, boolean>
  setProcessingDomains: (processingDomains: Record<string, boolean>) => void
}

export type Variant = 'SUB' | 'DOT'

const ManageDomainContext = createContext<ManageDomainProviderState>({} as any)

export const ManageDomainProvider: React.FC<{ promoCode?: string }> = ({ children, promoCode }) => {
  const myAddress = useMyAddress()
  const [currentStep, setStep] = useState<MenuSteps>()
  const [domain, setDomain] = useState<string>()
  const [visible, setVisible] = useState(true)
  const [variant, setVariant] = useState<Variant>('SUB')
  const [recipient, setRecipient] = useState<string>(myAddress || '')
  const [purchaser, setPurchaser] = useState<string>(myAddress || '')
  const [isFetchNewDomains, setIsFetchNewDomains] = useState(false)
  const [processingDomains, setProcessingDomains] = useState<Record<string, boolean>>({})

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
    variant,
    setVariant,
    recipient,
    setRecipient,
    promoCode: activePromoCode,
    clearPromoCode,
    purchaser,
    setPurchaser,
    isFetchNewDomains,
    setIsFetchNewDomains,
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
