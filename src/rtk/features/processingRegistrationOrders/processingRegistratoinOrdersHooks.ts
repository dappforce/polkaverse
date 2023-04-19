import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useActions } from 'src/rtk/app/helpers'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { fetchProcessingOrdersByAccount, selectProcessingOrdersByAccount, selectProcessingOrdersById } from './processingRegistratoinOrdersSlice'
import { useEffect } from 'react'


export const useFetchProcessingOrdersByIds = (domains?: string[], recipient?: string) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if(!domains || !recipient) return

    dispatch(fetchProcessingOrdersByAccount({ domains, recipient }))
  }, [ !!domains, recipient ])
}

export const useSelectProcessingOrderById = (id: string) => {
  return useAppSelector(state => selectProcessingOrdersById(state, id))
}

export const useSelectProcessingOrdersByAccount = () => {
  const myAddress = useMyAddress()
  return useAppSelector(state => selectProcessingOrdersByAccount(state, myAddress))
}

type ReloadProcessingOrders = {
  domains: string[]
  recipient: string
}

export const useCreateReloadProcessingOrdersByAccount = () => {
  return useActions<ReloadProcessingOrders | undefined>(({ dispatch, args }) => {
    args && dispatch(fetchProcessingOrdersByAccount({ ...args, reload: true }))
  })
}