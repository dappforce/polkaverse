import { EntityData, SpaceContent, SpaceStruct } from '@subsocial/api/types'
import { bnsToIds, bnToId, idsToBns, idToBn } from '@subsocial/utils/bn'
import { ReactionId, ReactionType } from 'src/types'
import { EventName } from './graphql-global-types'

export * from '@subsocial/api/subsocial/flatteners'
export * from '@subsocial/api/subsocial/flatteners/utils'
export * from '@subsocial/api/types'
export * from '@subsocial/elasticsearch/types'
export { idToBn, bnToId, idsToBns, bnsToIds }
export type EventsName = EventName

type SpaceData = EntityData<SpaceStruct, SpaceContent & { chats?: any }>

export type SpaceWithSomeDetails = SpaceData & {
  owner?: SpaceData
}

export type ProfileData = SpaceData

export type ProfileContent = SpaceContent

export type Activity = {
  account: string
  blockNumber: string
  eventIndex: number
  event: EventsName
  reactionKind?: ReactionType
  /** Account id. */
  followingId?: string
  spaceId?: string
  postId?: string
  commentId?: string
  /* Balance */
  amount?: string
  /** Date of this activity. Example: "2020-12-03T19:22:36.000Z" */
  date: string
  aggregated: boolean
  aggCount: number
}

export enum DataSourceTypes {
  CHAIN = 'chain',
  SQUID = 'squid',
}

export type ProfileSpaceIdByAccount = {
  id: string
  spaceId: string
  accountFollowersCount: number
  accountFollowedCount: number
}

export type Reaction = {
  reactionId?: ReactionId
  kind?: ReactionType
}

// A composite entity id: account_id + '-' + post_id
type AccountAndPostId = string

export type ReactionStruct = Reaction & {
  id: AccountAndPostId
}

export type HasStatusCode = {
  statusCode?: number
}

export type EmailAccount = {
  accountAddress: string
  email: string
}
