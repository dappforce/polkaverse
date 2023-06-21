// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import gql from 'graphql-tag'
import { EventName } from 'src/types/graphql-global-types'
import { getDateWithOffset } from 'src/utils/date'

interface ActivityCount {
  totalCount: number
}
export interface GetActivityCountStat {
  total: ActivityCount
  period: ActivityCount
  today: ActivityCount
  [key: string]: ActivityCount
}
export function getActivityCountStatQuery(period: number, events: EventName[]) {
  let perDayQueryString = ''
  Array.from({ length: period + 1 }).forEach(async (_, index) => {
    const offset = period - index
    const query = `
      offset${offset}:activitiesConnection (where: {
        event_in: [${events}],
        date_gte: "${getDateWithOffset(offset)}",
        date_lt: "${getDateWithOffset(offset - 1)}",
      }, orderBy: id_ASC) {
        totalCount
      }
    `
    perDayQueryString += query
  })

  return gql`
    query GetActivityCountStat {
      total:activitiesConnection (where: { event_in: [${events}] }, orderBy: id_ASC) {
        totalCount
      }
      period:activitiesConnection (where: {
        event_in: [${events}],
        date_gte: "${getDateWithOffset(period)}"
      }, orderBy: id_ASC) {
        totalCount
      }
      today:activitiesConnection (where: {
        event_in: [${events}],
        date_gte: "${getDateWithOffset(0)}"
      }, orderBy: id_ASC) {
        totalCount
      }
      ${perDayQueryString}
    }
  `
}
