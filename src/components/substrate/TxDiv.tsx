// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import React from 'react'
import TxButton from 'src/components/utils/TxButton'
import { TxButtonProps } from './SubstrateTxButton'

const Div: React.FunctionComponent = props => <div {...props}>{props.children}</div>

export const TxDiv = (props: TxButtonProps) => <TxButton component={Div} {...props} />

export default React.memo(TxDiv)
