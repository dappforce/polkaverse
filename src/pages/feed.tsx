import dynamic from 'next/dynamic'
import { PageNotFound } from 'src/components/utils'
import config from 'src/config'
const MyFeed = dynamic(() => import('../components/activity/MyFeed'), { ssr: false })

export const page = () => <MyFeed />

export default config.enableFeed ? page : PageNotFound
