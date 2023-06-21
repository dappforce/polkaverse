// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import dayjs from 'dayjs'

export type DateIntervalType = 'day' | 'month' | 'year'
export function getDateWithOffset(offset: number, interval: DateIntervalType = 'day') {
  const now = new Date()
  const date = now.getDate()
  const month = now.getMonth()
  const year = now.getFullYear()

  const multipliers: { [key in DateIntervalType]: number } = {
    day: 1,
    month: 30,
    year: 365,
  }
  let multiplier = multipliers[interval]

  const offsetDate = date - offset * multiplier
  return new Date(year, month, offsetDate).toISOString()
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
