import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export type DateIntervalType = 'day' | 'month' | 'year'
export function getDateWithOffset(offset: number, interval: DateIntervalType = 'day') {
  const now = dayjs.utc().startOf('day')
  const offsetted = now.subtract(offset, interval)
  return offsetted.toISOString()
}

const DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' },
]
export function getTimeRelativeToNow(
  date: Date | string | number,
  config: { locale?: string } = { locale: 'en-US' },
) {
  const formatter = new Intl.RelativeTimeFormat(config.locale)
  let duration = (new Date(date).getTime() - new Date().getTime()) / 1000

  for (let i = 0; i <= DIVISIONS.length; i++) {
    const division = DIVISIONS[i]
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name)
    }
    duration /= division.amount
  }

  return dayjs(date).format('lll')
}

export function getShortTimeRelativeToNow(date: Date | string | number) {
  const dateObj = new Date(date)
  const now = new Date()

  if (
    now.getDate() === dateObj.getDate() &&
    now.getMonth() === dateObj.getMonth() &&
    now.getFullYear() === dateObj.getFullYear()
  ) {
    return dayjs(date).format('HH:mm')
  }

  if (now.getFullYear() === dateObj.getFullYear()) {
    return dayjs(date).format('MMM D')
  }

  return dayjs(date).format('MMM D, YYYY')
}
