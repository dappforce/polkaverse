import { isEmptyObj } from '@subsocial/utils'
import { isClientSide } from 'src/components/utils'

export function disablePageScroll() {
  document.body.style.overflow = 'hidden'
}
export function enablePageScroll() {
  document.body.style.overflow = 'auto'
}

export function hasInjectedWallet() {
  return isClientSide() && !isEmptyObj((window as any).injectedWeb3)
}
