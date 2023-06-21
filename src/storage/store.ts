// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import localForage from 'localforage'

export const newStore = (storeName: string) =>
  localForage.createInstance({
    name: 'SubsocialDB',
    storeName,
  })
