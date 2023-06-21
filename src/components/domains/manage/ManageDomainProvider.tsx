// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { useRouter } from 'next/router'
import React, { createContext, useContext, useState } from 'react'
import { ManageDomainModal } from './DomainManageModal'

export type MenuSteps = 'subid' | 'inner' | 'outer' | 'menu' | 'success'
type OpenManageModalFn = (step: MenuSteps, domain?: string) => void

type ManageDomainProviderState = {
  currentStep?: MenuSteps
  openManageModal: OpenManageModalFn
  promoCode?: string
  clearPromoCode: () => void
}

const ManageDomainContext = createContext<ManageDomainProviderState>({} as any)

export const ManageDomainProvider: React.FC<{ promoCode?: string }> = ({ children, promoCode }) => {
  const [currentStep, setStep] = useState<MenuSteps>()
  const [domain, setDomain] = useState<string>()
  const [visible, setVisible] = useState(true)

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

  return (
    <ManageDomainContext.Provider
      value={{ currentStep, openManageModal, promoCode: activePromoCode, clearPromoCode }}
    >
      {children}
      {domain && <ManageDomainModal domain={domain} close={close} visible={visible} />}
    </ManageDomainContext.Provider>
  )
}

export const useManageDomainContext = () => useContext(ManageDomainContext)
