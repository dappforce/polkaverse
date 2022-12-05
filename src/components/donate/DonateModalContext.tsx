import { createContext, useContext, useState } from 'react'
import { useChainInfo } from 'src/rtk/features/chainsInfo/chainsInfoHooks'
import { ChainInfo } from 'src/rtk/features/chainsInfo/chainsInfoSlice'
import { networkByCurrency } from './SupportedTokens'
import { convertAddressToChainFormat } from './utils'

type TipContextState = {
  sender?: string
  setSender: (s: string) => void
  currency?: string
  setCurrency: (s: string) => void
  success: boolean
  setSuccess: (a: boolean) => void
  infoByNetwork?: ChainInfo
  network?: string
  amount?: string
  setAmount: (s: string) => void
}

const TipContext = createContext<TipContextState>({} as any)

export const TipContextWrapper: React.FC = ({ children }) => {
  const [sender, setSender] = useState<string>()
  const [currency, setCurrency] = useState<string>()
  const [success, setSuccess] = useState(false)
  const [amount, setAmount] = useState<string>()

  const chainInfo = useChainInfo()
  const network = currency ? networkByCurrency[currency] : undefined
  const infoByNetwork = network ? chainInfo[network] : undefined

  const setSenderWithCorrectFormat = (account: string) => {
    setSender(convertAddressToChainFormat(account, infoByNetwork?.ss58Format) || account)
  }

  const value = {
    sender,
    setSender: setSenderWithCorrectFormat,
    currency,
    setCurrency,
    success,
    setSuccess,
    infoByNetwork,
    network,
    amount,
    setAmount,
  }

  return <TipContext.Provider value={value}>{children}</TipContext.Provider>
}

export const useTipContext = () => useContext(TipContext)
