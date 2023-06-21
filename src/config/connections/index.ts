// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { connectionKind, connectionsOverrides } from '../env'
import { SubsocialConfig } from '../types'
import dev from './dev'
import local from './local'
import main from './main'
import staging from './staging'

const connectionPresets = {
  local,
  main,
  staging,
  dev,
}

const currentConfig: SubsocialConfig = connectionPresets[connectionKind]

Object.entries(connectionsOverrides).forEach(([key, value]) => {
  if (value) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    currentConfig[key] = value
  }
})

export default currentConfig
