import dynamic from 'next/dynamic'
import { PageNotFound } from 'src/components/utils'
import config from 'src/config'
const MyNotifications = dynamic(() => import('../components/activity/MyNotifications'), {
  ssr: false,
})

export const page = () => <MyNotifications />

export default config.enableNotifications ? page : PageNotFound
