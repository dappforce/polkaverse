import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useFetchWithoutApi } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import {
  fetchAddressLikeCountSlice,
  getAddressLikeCountId,
  selectAddressLikeCount,
} from './addressLikeCountSlice'
import { fetchRewardReport, selectUserRewardReport } from './rewardReport'
import { selectPostSuperLikeCount } from './superLikeCountsSlice'

export function useSuperLikeCount(postId: string) {
  return useAppSelector(state => selectPostSuperLikeCount(state, postId)?.count ?? 0)
}

export const useFetchMySuperLikesByPostIds = (postIds: string[]) => {
  const myAddress = useMyAddress()
  return useFetchWithoutApi(
    fetchAddressLikeCountSlice,
    { postIds, address: myAddress ?? '' },
    { enabled: !!myAddress && postIds.length > 0 },
  )
}

export function useHasISuperLikedPost(postId: string) {
  const myAddress = useMyAddress() ?? ''
  return useAppSelector(state => {
    const entity = selectAddressLikeCount(
      state,
      getAddressLikeCountId({ address: myAddress, postId }),
    )
    return (entity?.count ?? 0) > 0
  })
}

export function useFetchUserRewardReport(address?: string) {
  const myAddress = useMyAddress()
  const usedAddress = address || myAddress || ''

  const data = useAppSelector(state => selectUserRewardReport(state, usedAddress))
  const fetchData = useFetchWithoutApi(
    fetchRewardReport,
    { address: usedAddress },
    { enabled: !!usedAddress },
  )

  return {
    ...fetchData,
    data,
  }
}
