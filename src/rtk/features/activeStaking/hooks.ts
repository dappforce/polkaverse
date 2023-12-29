import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { useFetchWithoutApi } from 'src/rtk/app/hooksCommon'
import { useAppSelector } from 'src/rtk/app/store'
import { fetchRewardReport, selectUserRewardReport } from './rewardReport'
import { selectPostSuperLikeCount } from './superLikeCountsSlice'

export function useSuperLikeCount(postId: string) {
  return useAppSelector(state => selectPostSuperLikeCount(state, postId)?.count ?? 0)
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
