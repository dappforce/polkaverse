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
export function getActivityCountStatQuery(period: number, events: EventName[], postId?: string) {
  const postQuery = postId ? `post: {isComment_eq: true, rootPost: {id_eq: "${postId}"}}` : ''

  let perDayQueryString = ''
  Array.from({ length: period + 1 }).forEach(async (_, index) => {
    const offset = period - index
    const query = `
      offset${offset}:activitiesConnection (where: {
        event_in: [${events}],
        date_gte: "${getDateWithOffset(offset)}",
        date_lt: "${getDateWithOffset(offset - 1)}",
        ${postQuery}
      }, orderBy: id_ASC) {
        totalCount
      }
    `
    perDayQueryString += query
  })

  return gql`
    query GetActivityCountStat {
      total:activitiesConnection (where: { event_in: [${events}], ${postQuery} }, orderBy: id_ASC) {
        totalCount
      }
      period:activitiesConnection (where: {
        event_in: [${events}],
        date_gte: "${getDateWithOffset(period)}",
        ${postQuery}
      }, orderBy: id_ASC) {
        totalCount
      }
      today:activitiesConnection (where: {
        event_in: [${events}],
        date_gte: "${getDateWithOffset(0)}",
        ${postQuery}
      }, orderBy: id_ASC) {
        totalCount
      }
      ${perDayQueryString}
    }
  `
}
