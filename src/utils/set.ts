// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

type SetOrArray<T> = Set<T> | Array<T>

export const eqSet = <T>(as: SetOrArray<T>, bs: SetOrArray<T>) => {
  if (Array.isArray(as)) {
    as = new Set(as)
  }

  if (Array.isArray(bs)) {
    bs = new Set(bs)
  }

  if (as.size !== bs.size) return false
  for (const a of as) {
    if (!bs.has(a)) return false
  }
  return true
}
