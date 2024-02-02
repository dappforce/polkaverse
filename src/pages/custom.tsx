import { NextPageContext } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { PageContent } from 'src/components/main/PageWrapper'

export default function CustomPage({
  desc,
  image,
  title,
  redirectTo,
}: {
  image: string
  title: string
  desc: string
  redirectTo: string
}) {
  const router = useRouter()
  useEffect(() => {
    router.push(redirectTo)
  }, [])

  return <PageContent meta={{ desc, image, title }} />
}

export const getInitialProps = async (context: NextPageContext) => {
  const { image, title, desc, redirectTo } = context.query
  return {
    image,
    title,
    desc,
    redirectTo,
  }
}
