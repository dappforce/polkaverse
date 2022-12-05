import React from 'react'
import TxButton from 'src/components/utils/TxButton'
import { TxButtonProps } from './SubstrateTxButton'

const Div: React.FunctionComponent = props => <div {...props}>{props.children}</div>

export const TxDiv = (props: TxButtonProps) => <TxButton component={Div} {...props} />

export default React.memo(TxDiv)
