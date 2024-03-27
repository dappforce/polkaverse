import { useIsAdmin } from 'src/rtk/features/moderation/hooks'
import { useModerationContext } from './ModerationProvider'

export default function ModerateButton({ postId }: { postId: string }) {
  const isAdmin = useIsAdmin()
  const { openModal } = useModerationContext()
  if (!isAdmin) return null

  return <div onClick={() => openModal(postId)}>Moderate</div>
}
