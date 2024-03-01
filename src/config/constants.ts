import dayjs from 'dayjs'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'

export const ESTIMATED_ENERGY_FOR_ONE_TX = 100_000_000
export const MINIMUM_LOCK = BigInt(2_000_00000_00000) // 2k SUB
export function getNeededLock(currentLock: string | undefined) {
  try {
    const neededLock = MINIMUM_LOCK - BigInt(currentLock ?? '0')
    return neededLock > 0 ? neededLock : BigInt(0)
  } catch {
    return MINIMUM_LOCK
  }
}

// distribution is at the start of monday, dayjs week starts from sunday: 0, monday: 1, ...
const DISTRIBUTION_DAY = 0
export const CREATORS_CONSTANTS = {
  SUPER_LIKES_FOR_MAX_REWARD: 10,
  DISTRIBUTION_DAY,
  getDistributionDaysLeft() {
    // monday: 7 days, tuesday: 6 days, ..., sunday: 1 day
    return ((DISTRIBUTION_DAY + 7 - dayjs.utc().get('day')) % 7) + 1
  },
}

const WHITELISTED_FOR_NEW_FEATURES = [
  '3tJYxJN55FtVeZgX4WdwieZXDp4HF62TRVj11tY2aXHdrYus',
  '3rzZpUCan9uAA9VSH12zX552Y6rfemGR3hWeeLmhNT1EGosL',
  '3omeLMCdtrojRPf7KyvTg78EvLxyJMo7mb2bqM28EEvxmXFM',
  '3osmnRNnrcScHsgkTJH1xyBF5kGjpbWHsGrqM31BJpy4vwn8',
  '3sUtZyGuVyGhXGRmx9D3VKw3hpYM5hC6sbertTmE6aAF9ATq',
  '3oGjkULuNKRqi513BbohWiSgA2oKMrbSnPrcddpXYC4mtW1G',
  '3pMj2r2t8q9qPtZUsEBg19eiy621Go9tKowy3ktBsRGNsCGg',
  '3q8uTV4HTCd4M8tP4fTKrGdopfKxAfLGfNdsmLbLP7hYj7JM',
  '3tPAVaHYAFRfUVpNP1DAq4E3BxTPanzkGN4uukn3b4ZAefkj',
  '3pjRboNv5rSDoy3thDse1KgaWtfVh3x2rrHqrabxjT7dJQdJ',
  // filippo
  '3sVFfCTpfWE5aqodJT5tpcK13uY9HMJNMDKDQYNpzPKmqVwA',
  // jay TheKus
  '3pYyydiZfeTL7iVxcYqw9bVyPbFXdVHSomUNzg4SpdycD5tg',
]
export function useIsMyAddressWhitelisted() {
  const myAddress = useMyAddress()
  return WHITELISTED_FOR_NEW_FEATURES.includes(myAddress ?? '')
}
