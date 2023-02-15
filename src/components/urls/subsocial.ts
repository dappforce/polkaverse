import { newLogger, notDef } from '@subsocial/utils'
import { createPostSlug, HasTitleOrBody } from '@subsocial/utils/slugify'
import { EntityId, HasHandle, HasId, PostStruct } from 'src/types'
import { slugifyDomain } from '../domains/utils'
import { AnyAddress, stringifyAddress } from '../substrate'
import { slugifyHandle, stringifySubUrls } from './helpers'

const log = newLogger('URL helpers')

// Space URLs
// --------------------------------------------------

export type HasSpaceIdOrHandle = HasId | HasHandle
/**
 * WARN: It's not recommended to use this hack.
 * You should pass both space's id and handle in order to construct
 * good looking URLs for spaces and posts that support a space handle.
 */
export function newSpaceUrlFixture(id: EntityId): HasSpaceIdOrHandle {
  return { id } as HasSpaceIdOrHandle
}

export function spaceIdForUrl(props: HasSpaceIdOrHandle): string {
  const id = (props as HasId).id
  const handle = (props as HasHandle).handle

  if (notDef(id) && notDef(handle)) {
    log.warn(`${spaceIdForUrl.name}: Both id and handle are undefined`)
    return ''
  }

  return slugifyHandle(slugifyDomain(handle)) || id
}

/** /[spaceId] */
export function spaceUrl(space: HasSpaceIdOrHandle, ...subUrls: string[]): string {
  const idForUrl = spaceIdForUrl(space)
  const ending = stringifySubUrls(...subUrls)
  return '/' + idForUrl + ending
}

/** /[spaceId]/new */
export function newSpaceUrl(asProfile?: boolean): string {
  return '/spaces/new' + (asProfile ? '?as-profile=true' : '')
}

/** /[spaceId]/edit */
export function editSpaceUrl(space: HasSpaceIdOrHandle, asProfile?: boolean): string {
  return spaceUrl(space, 'edit') + (asProfile ? '?as-profile=true' : '')
}

/** /[spaceId]/about */
export function aboutSpaceUrl(space: HasSpaceIdOrHandle): string {
  return spaceUrl(space, 'about')
}

// Post URLs
// --------------------------------------------------

export type HasPostId = Pick<PostStruct, 'id'>

export type HasDataForSlug = {
  struct: HasPostId
  content?: HasTitleOrBody
}

/** /[spaceId]/posts/new */
export function newPostUrl(space?: HasSpaceIdOrHandle): string {
  return space ? spaceUrl(space, 'posts', 'new') : '/posts/new'
}

/** /comments/[slug] */
export function commentUrl(slug: string, ...subUrls: string[]): string {
  const ending = stringifySubUrls(...subUrls)
  return '/comments/' + slug + ending
}

/** /[spaceId]/[slug] */
export function postUrl(
  space: HasSpaceIdOrHandle | undefined,
  { struct, content }: HasDataForSlug,
  ...subUrls: string[]
): string {
  if (notDef(struct.id)) {
    log.warn(`${postUrl.name}: Post id is undefined`)
    return ''
  }

  const slug = createPostSlug(struct.id, content)

  if (!space) return commentUrl(slug, ...subUrls)

  return spaceUrl(space, slug, ...subUrls)
}

/** /[spaceId]/[slug]/edit */
export function editPostUrl(space: HasSpaceIdOrHandle | undefined, post: HasDataForSlug): string {
  return postUrl(space, post, 'edit')
}

// Account URLs
// --------------------------------------------------

export type HasAddress = {
  address: AnyAddress
}

export function accountIdForUrl({ address }: HasAddress): string {
  if (notDef(address)) {
    log.warn(`${accountIdForUrl.name}: Account address is undefined`)
    return ''
  }

  return stringifyAddress(address) as string
}

function urlWithAccount(baseUrl: string, account: HasAddress, ...subUrls: string[]): string {
  return stringifySubUrls(baseUrl, accountIdForUrl(account), ...subUrls)
}

/** /accounts/[address] */
export function accountUrl(account: HasAddress, ...subUrls: string[]): string {
  return urlWithAccount('accounts', account, ...subUrls)
}
