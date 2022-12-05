import memoize from 'lodash/memoize'
import { CID } from 'multiformats'
import { fullUrl } from 'src/components/urls/helpers'
import config from 'src/config'

/** Memoized resolver of IPFS CID to a full URL. */
export const resolveIpfsUrl = memoize((maybeCid: string) => {
  try {
    if (CID.isCID(CID.parse(maybeCid))) {
      return `${config.ipfsNodeUrl}/ipfs/${maybeCid}`
    }
  } catch (err) {
    // It's OK
  }

  // Looks like CID is already a resolved URL.
  return fullUrl(maybeCid, config.ipfsNodeUrl)
})
