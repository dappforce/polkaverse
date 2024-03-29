export * from './category'
import ReactGA from 'react-ga'
import { isServerSide } from 'src/components/utils'

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
}
