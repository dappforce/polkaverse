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

export const descSortIds = (ids: string[]) => ids.sort((a, b) => parseInt(b) - parseInt(a))
export const ascSortIds = (ids: string[]) => ids.sort((a, b) => parseInt(a) - parseInt(b))
