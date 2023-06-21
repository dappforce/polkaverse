// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

// Copyright 2017-2020 @polkadot/react-api authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { newLogger } from '@subsocial/utils'

function flatten(key: string | null, value: any): any {
  if (!value) {
    return value
  }

  if (value.$$typeof) {
    return ''
  }

  if (Array.isArray(value)) {
    return value.map((item): any => flatten(null, item))
  }

  return value
}

const log = newLogger('isEqual')

export function isEqual<T>(a?: T, b?: T, debug = false): boolean {
  const jsonA = JSON.stringify({ test: a }, flatten)
  const jsonB = JSON.stringify({ test: b }, flatten)

  if (debug) {
    log.debug('jsonA', jsonA, 'jsonB', jsonB)
  }

  return jsonA === jsonB
}
