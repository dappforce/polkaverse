import { useChainInfo } from '../../../rtk/features/chainsInfo/chainsInfoHooks'

export const useGetDecimalAndSymbol = (network?: string) => {
  const chainsInfo = useChainInfo()

  if(!network) return {}

  const { tokenDecimals, tokenSymbols, nativeToken } = chainsInfo[network] || {}

  const decimal = tokenDecimals?.[0] || 0
  const symbol = tokenSymbols?.[0] || nativeToken

  return { decimal, symbol }
}