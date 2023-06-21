// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import BN from 'bn.js'
import * as Yup from 'yup'
import { pluralize } from '../Plularize'

export function minLenError(fieldName: string, minLen: number | BN): string {
  return `${fieldName} is too short. Minimum length is ${pluralize({
    count: minLen,
    singularText: 'char',
  })}.`
}

export function maxLenError(fieldName: string, maxLen: number | BN): string {
  return `${fieldName} is too long. Maximum length is ${pluralize({
    count: maxLen,
    singularText: 'char',
  })}.`
}

const URL_MAX_LEN = 2000

export function urlValidation(urlName: string) {
  return Yup.string()
    .url(`${urlName} must be a valid URL.`)
    .max(URL_MAX_LEN, `${urlName} URL is too long. Maximum length is ${URL_MAX_LEN} chars.`)
}
