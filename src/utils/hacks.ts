import BN from 'bn.js'
import { equalAddresses } from 'src/components/substrate'
import config from 'src/config'
import { AccountId, AnyAccountId, AnySpaceId, SpaceId, SpaceStruct } from 'src/types'
import { ascSortIds } from './num'

const { sudoOne, lastReservedSpaceId, claimedSpaceIds, recommendedSpaceIds } = config

const lastReservedSpaceIdBn = new BN(lastReservedSpaceId)

const firstRangeFirstId = 1001
const firstRangeLastId = 1217

const secondRangeFirstId = 4393
const secondRangeLastId = 4461

function isReservedPolkadotSpace(idStr: AnySpaceId): boolean {
  const id = new BN(idStr)
  return (
    (id.gten(firstRangeFirstId) && id.lten(firstRangeLastId)) ||
    (id.gten(secondRangeFirstId) && id.lten(secondRangeLastId))
  )
}

function isPolkadotOrReservedSpace(idStr: AnySpaceId): boolean {
  const id = new BN(idStr)
  const lastClaimedId = new BN(claimedSpaceIds.pop() || 0)
  return isReservedPolkadotSpace(id) || (id.gt(lastClaimedId) && id.lte(lastReservedSpaceIdBn))
}

const buildReservedPolkadotSpaceIds = () => {
  const firstRange = new Array(firstRangeLastId - firstRangeFirstId)
    .fill(0)
    .map((_, i) => firstRangeFirstId + i)
  const secondRange = new Array(secondRangeLastId - secondRangeFirstId)
    .fill(0)
    .map((_, i) => secondRangeFirstId + i)

  return firstRange.concat(secondRange).map(x => x.toString())
}

export const reservedPolkadotSpaceIds = buildReservedPolkadotSpaceIds()

/**
 * Simple check if this is an id is of a Polkadot ecosystem project.
 */
export function isPolkaProject(idStr: AnySpaceId): boolean {
  const id = new BN(idStr)
  return id.eqn(1) || isReservedPolkadotSpace(id)
}

export function isOfficialSpace(id: SpaceId): boolean {
  return isPolkaProject(new BN(id)) || recommendedSpaceIds.includes(id.toString())
}

export const isClaimedSpace = (space: SpaceStruct) =>
  isReservedPolkadotSpace(new BN(space.id)) ? space.ownerId !== sudoOne : true
export const isUnclaimedSpace = (space: SpaceStruct) => !isClaimedSpace(space)

export function findSpaceIdsThatCanSuggestIfSudo(
  sudoAcc: AnyAccountId,
  myAcc: AnyAccountId,
  spaceIds: string[],
): string[] {
  const isSudo = equalAddresses(sudoAcc, myAcc)
  return !isSudo ? spaceIds : spaceIds.filter(id => !isPolkadotOrReservedSpace(id))
}

type SelectSpaceIdsThatCanSuggestIfSudoProps = {
  spaceIds: SpaceId[]
  myAddress?: AccountId
}

export function selectSpaceIdsThatCanSuggestIfSudo({
  myAddress,
  spaceIds,
}: SelectSpaceIdsThatCanSuggestIfSudoProps) {
  if (!sudoOne) return spaceIds

  if (!myAddress) return []

  return ascSortIds(findSpaceIdsThatCanSuggestIfSudo(sudoOne, myAddress, spaceIds))
}
