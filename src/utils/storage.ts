// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

const storagePrefix = 'df.'

export function truncateAddress(address: string) {
  const suffix = address.substring(address.length - 4, address.length)
  const prefix = address.substring(0, 4)
  return `${prefix}...${suffix}`
}

export function createStorageKey(name: string, address?: string) {
  return storagePrefix + name + (address ? `:${truncateAddress(address)}` : '')
}
