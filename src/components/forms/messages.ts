import BN from 'bn.js'
import { pluralize } from '../utils/Plularize'

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
