// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import app from './app'
import availableFeatures from './availableFeatures'
import common from './common'
import connections from './connections'

export default {
  ...common,
  ...app,
  ...connections,
  ...availableFeatures,
}
