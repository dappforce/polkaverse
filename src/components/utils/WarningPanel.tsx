import React from 'react'
import BasicInfoPanel from './BasicInfoPanel'
import { BareProps } from './types'

export type WarningPanelProps = BareProps & {
  desc: React.ReactNode
  actions?: React.ReactNode[]
}

export const WarningPanel = ({ desc, actions, className }: WarningPanelProps) => (
  <BasicInfoPanel
    className={className}
    desc={desc}
    banner={false}
    actions={actions}
    withIcon={true}
    type='warning'
  />
)

export default WarningPanel
