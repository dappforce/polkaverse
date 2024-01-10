import dayjs from 'dayjs'

export const ESTIMATED_ENERGY_FOR_ONE_TX = 100_000_000

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
