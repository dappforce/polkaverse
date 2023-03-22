import { useRouter } from 'next/router'
import React, { createContext, useContext, useState } from 'react'
import { ManageDomainModal } from './DomainManageModal'
import { useMyAddress } from '../../auth/MyAccountsContext';

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
}

type Variant = 'SUB' | 'DOT'

const ManageDomainContext = createContext<ManageDomainProviderState>({} as any)

export const ManageDomainProvider: React.FC<{ promoCode?: string }> = ({ children, promoCode }) => {
  const myAddress = useMyAddress()
  const [currentStep, setStep] = useState<MenuSteps>()
  const [domain, setDomain] = useState<string>()
  const [visible, setVisible] = useState(true)
  const [ variant, setVariant ] = useState<Variant>('SUB')
  const [ recipient, setRecipient ] = useState<string>(myAddress || '')


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
    clearPromoCode
  }

  return (
    <ManageDomainContext.Provider value={value}>
      {children}
      {domain && <ManageDomainModal domain={domain} close={close} visible={visible} />}
    </ManageDomainContext.Provider>
  )
}

export const useManageDomainContext = () => useContext(ManageDomainContext)
