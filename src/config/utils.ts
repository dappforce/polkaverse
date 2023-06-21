// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

export function getOrDefault<V>(value: V | undefined, defaultValue: V): V {
  return typeof value !== 'undefined' ? value : defaultValue
}

export function getOrTrue(value?: boolean): boolean {
  return getOrDefault(value, true)
}

export function getOrFalse(value?: boolean): boolean {
  return getOrDefault(value, false)
}
