import { showErrorMessage } from 'src/components/utils/Message'
import { AppDispatch } from 'src/rtk/app/store'
import {
  fetchPendingOrdersByAccount,
  fetchPendingOrdersBySigner,
} from 'src/rtk/features/domainPendingOrders/pendingOrdersSlice'

type PendingActionProps<T> = {
  action: (...args: T[]) => Promise<any>
  args: T[]
  dispatch: AppDispatch
  account: string
  reload?: boolean
}

export const pendingOrderAction = async <T extends any>({
  action,
  args,
  dispatch,
  account,
  reload = true,
}: PendingActionProps<T>) => {
  const result = await action(...args)

  if (result?.success && reload) {
    dispatch(fetchPendingOrdersByAccount({ id: account, reload: true }))
    dispatch(fetchPendingOrdersBySigner({ id: account, reload: true }))
    return false
  } else {
    reload && showErrorMessage(result?.errors)

    return true
  }
}
