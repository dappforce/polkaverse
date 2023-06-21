// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import BN from 'bn.js'

/** `def` is a default number that will be returned in case the fuction fails to parse `maybeNum` */
export const tryParseInt = (maybeNum: string | number, def: number): number => {
  if (typeof maybeNum === 'number') {
    return maybeNum
  }
  try {
    return parseInt(maybeNum)
  } catch (err) {
    return def
  }
}

export const descSortBns = (ids: BN[]) => ids.sort((a, b) => b.sub(a).toNumber())
export const descSort = (ids: string[]) => ids.sort((a, b) => new BN(b).sub(new BN(a)).toNumber())
