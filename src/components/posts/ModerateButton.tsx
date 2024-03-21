import { useIsAdmin } from 'src/rtk/features/moderation/hooks'

export default function ModerateButton() {
  const isAdmin = useIsAdmin()
  if (!isAdmin) return null

  return <div>Moderate</div>
}
