// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { pluralize } from '@subsocial/utils'
import BN from 'bn.js'

type PluralizeProps = {
  count: number | BN | string
  singularText: string
  pluralText?: string
}

export { pluralize }

export function Pluralize(props: PluralizeProps) {
  const { count, singularText, pluralText } = props
  return <>{pluralize({ count, singularText, pluralText })}</>
}
