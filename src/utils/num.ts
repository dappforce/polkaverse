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

export function parseToBigInt(value: string | undefined) {
  if (!value) return BigInt(0)
  return BigInt(value.split('.')[0])
}
