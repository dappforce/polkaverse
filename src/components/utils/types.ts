import { CSSProperties } from 'react'

export type FVoid = () => void

export interface BareProps {
  className?: string
  style?: CSSProperties
}

export type ModalProps = {
  open: boolean
  hide: () => void
}
