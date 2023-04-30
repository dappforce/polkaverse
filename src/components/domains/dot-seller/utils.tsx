import { AppDispatch } from 'src/rtk/app/store'
import { useChainInfo } from '../../../rtk/features/chainsInfo/chainsInfoHooks'
import { fetchPendingOrdersByAccount, fetchPendingOrdersBySigner } from 'src/rtk/features/domainPendingOrders/pendingOrdersSlice'
import { showErrorMessage } from 'src/components/utils/Message'

export const useGetDecimalAndSymbol = (network?: string) => {
  const chainsInfo = useChainInfo()

  if (!network) return {}

  const { tokenDecimals, tokenSymbols, nativeToken } = chainsInfo[network] || {}

  const decimal = tokenDecimals?.[0] || 0
  const symbol = tokenSymbols?.[0] || nativeToken

  return { decimal, symbol }
}

type PendingActionProps<T> = {
  action: (...args: T[]) => Promise<any>
  args: T[]
  dispatch: AppDispatch
  account: string
}

export const pendingOrderAction = async <T extends any>({ action, args, dispatch, account }: PendingActionProps<T>) => {
  const result = await action(...args)

  if (result?.success) {
    dispatch(fetchPendingOrdersByAccount({ id: account, reload: true }))
    dispatch(fetchPendingOrdersBySigner({ id: account, reload: true }))
    return false
  } else {
    showErrorMessage(result?.errors)

    return true
  }
}
