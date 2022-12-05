import { useRouter } from 'next/router'

export default function useIsPostPage() {
  const router = useRouter()
  return router.pathname === '/[spaceId]/[slug]'
}
