import { useAppSelector } from 'src/rtk/app/store'
import { selectPostSuperLikeCount } from './superLikeCountsSlice'

export function useSuperLikeCount(postId: string) {
  return useAppSelector(state => selectPostSuperLikeCount(state, postId)?.count ?? 0)
}
