import { useRouter } from 'next/router'
import React from 'react'
import ClientLayout from './ClientLayout'

const Page: React.FunctionComponent = ({ children }) => <div className='mb-3'>{children}</div>

const SKIP_LAYOUT_PAGES = 'generators-for-promo'

const NextLayout: React.FunctionComponent = props => {
  const router = useRouter()

  if (router.pathname.includes(SKIP_LAYOUT_PAGES)) return <Page {...props} />

  return (
    <ClientLayout>
      <Page {...props} />
    </ClientLayout>
  )
}

export default NextLayout
