type TokenBalanceProps = {
  value: string
  defaultMaximumFractionDigits?: number
  symbol?: string
  startFromSymbol?: boolean
}

type FormatBalance = {
  value: string
  defaultMaximumFractionDigits?: number
}

export const formatBalance = ({ value, defaultMaximumFractionDigits = 2 }: FormatBalance) => {
  const [intPart, decimalPart] = value.split('.')

  let maximumFractionDigits = defaultMaximumFractionDigits

  if (intPart === '0' && Number(decimalPart) > 0) {
    const firstNonZeroIndex = decimalPart.split('').findIndex(char => char !== '0') + 1

    if (firstNonZeroIndex > 5) {
      maximumFractionDigits = defaultMaximumFractionDigits
    } else {
      maximumFractionDigits = firstNonZeroIndex
    }
  }

  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })
}

const TokenBalance = ({
  value,
  defaultMaximumFractionDigits,
  startFromSymbol: startFromSybmol,
  symbol,
}: TokenBalanceProps) => {
  const formattedValue = formatBalance({
    value: value,
    defaultMaximumFractionDigits,
  })

  const formattedValueWithSymbol = startFromSybmol
    ? `${symbol}${formattedValue}`
    : `${formattedValue} ${symbol}`

  return <>{symbol ? formattedValueWithSymbol : formattedValue}</>
}

export default TokenBalance
