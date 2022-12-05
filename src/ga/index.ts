export * from './category'
export * from './events'
import ReactGA from 'react-ga'
import { isServerSide } from 'src/components/utils'
import { openCookiesNotification } from '../components/cookies'

export type GaProps = {
  id: string
  options?: {
    debug: boolean
    gaOptions?: {
      cookieDomain: string
    }
  }
}

export const initGa = (props?: GaProps) => {
  if (!props || !props.id || isServerSide()) return

  const { id, options } = props
  ReactGA.initialize(id, options)
  openCookiesNotification()
}
