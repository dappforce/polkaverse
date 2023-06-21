// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { GenericAccountId } from '@polkadot/types'
import registry from '@subsocial/api/utils/registry'
import list from 'public/block-list.json'
import { AccountId, PostStruct, SpaceStruct } from 'src/types'

type BlockReason =
  | 'spam'
  | 'violence'
  | 'scam'
  | 'fake'
  | 'nudity'
  | 'child_abuse'
  | 'copyright'
  | 'cheat'

type BlockedAccountsByReason = Record<BlockReason, string[]>

const noWriteAccessReasons = [
  'spam',
  'violence',
  'scam',
  'fake',
  'nudity',
  'child_abuse',
  'copyright',
] as BlockReason[]

export type ModeratedEntities = {
  blockedPosts: string[]
  blockedSpaces: string[]
  blockedAccounts: BlockedAccountsByReason
}

const blockedAccounts = {} as BlockedAccountsByReason

const { blockedPosts, blockedSpaces } = list as any as ModeratedEntities

const blockAccounts = (list as any).blockedAccounts as BlockedAccountsByReason

Object.keys(blockAccounts).forEach(_reason => {
  const reason = _reason as BlockReason
  const accounts = blockAccounts[reason] as string[]
  blockedAccounts[reason] = accounts.map((x: string) =>
    new GenericAccountId(registry, x).toString(),
  )
})

export const moderatedEntities: ModeratedEntities = {
  blockedPosts,
  blockedSpaces,
  blockedAccounts,
}

export const isBlockedAccount = (account?: AccountId) => {
  if (!account) return false

  return !!noWriteAccessReasons.find(reason => blockedAccounts[reason].includes(account))
}

export const isBlockedSpace = ({ id, ownerId }: Pick<SpaceStruct, 'id' | 'ownerId'>) =>
  isBlockedAccount(ownerId) || blockedSpaces.includes(id)

export const isBlockedPost = ({
  id,
  spaceId,
  ownerId,
}: Pick<PostStruct, 'id' | 'spaceId' | 'ownerId'>) =>
  isBlockedAccount(ownerId) ||
  (spaceId && blockedSpaces.includes(spaceId)) ||
  blockedPosts.includes(id)
