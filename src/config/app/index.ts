// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { appKind, appOverrides } from '../env'
import polkaverse from './polkaverse'
import staging from './staging'

const apps = {
  polkaverse,
  staging,
}

const currentConfig = apps[appKind]
if (!currentConfig) {
  throw Error(`APP KIND: ${appKind} is not supported`)
}
Object.entries(appOverrides).forEach(([key, value]) => {
  if (value) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    currentConfig[key] = value
  }
})

export default currentConfig
