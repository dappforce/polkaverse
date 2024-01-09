import BigNumber from 'bignumber.js'

const TEN_BN = new BigNumber(10)

const convertToBalanceWithDecimal = (balance: string | number, decimal: number) =>
  new BigNumber(balance).dividedBy(TEN_BN.pow(new BigNumber(decimal)))

export function getAmountRange(amount: string | undefined, decimals = 10) {
  if (!amount || amount === '0') return '0'

  const amountWithDecimals = convertToBalanceWithDecimal(amount, decimals)

  if (amountWithDecimals.lte(2000)) {
    return 'up to 2000'
  } else if (amountWithDecimals.lte(10000)) {
    return 'up to 10000'
  } else if (amountWithDecimals.lte(50000)) {
    return 'up to 50000'
  } else if (amountWithDecimals.lte(100000)) {
    return 'up to 100000'
  } else if (amountWithDecimals.lte(500000)) {
    return 'up to 500000'
  } else if (amountWithDecimals.lte(1000000)) {
    return 'up to 1000000'
  } else {
    return 'more than 1000000'
  }
}
