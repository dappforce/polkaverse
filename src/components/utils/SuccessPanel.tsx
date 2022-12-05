import React from 'react'
import BasicInfoPanel from './BasicInfoPanel'
import { BareProps } from './types'

export type SuccessPanelProps = BareProps & {
  desc: React.ReactNode
}

export const SuccessPanel = ({ desc, className }: SuccessPanelProps) => (
  <BasicInfoPanel className={className} desc={desc} banner={false} withIcon={true} type='success' />
)

export default SuccessPanel
