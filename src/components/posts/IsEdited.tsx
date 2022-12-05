import { Tooltip } from 'antd'
import React from 'react'

type IsEditedType = {
  edited?: boolean
  updatedAtTime?: React.ReactNode
}

const IsEdited: React.FC<IsEditedType> = ({ edited, updatedAtTime }) => {
  return <Tooltip title={updatedAtTime}>{edited && <div className='mx-1'>• Edited</div>}</Tooltip>
}

export default IsEdited
