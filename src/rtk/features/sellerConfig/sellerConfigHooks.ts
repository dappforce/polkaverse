import { useFetch } from 'src/rtk/app/hooksCommon'
import { fetchSellerConfig, selectSellerConfig } from './sellerConfigSlice'
import { useAppSelector } from 'src/rtk/app/store'

export const useFetchSellerConfig = () => {
  useFetch(fetchSellerConfig, { reload: false })
}

export const useSelectSellerConfig = () => {
  return useAppSelector((state) => selectSellerConfig(state))
}
