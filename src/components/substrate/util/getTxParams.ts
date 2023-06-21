// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { SubsocialIpfsApi } from '@subsocial/api'
import { newLogger } from '@subsocial/utils'
import { CommonContent, IpfsCid } from 'src/types'

const log = newLogger('BuildTxParams')

type Params<C extends CommonContent> = {
  ipfs: SubsocialIpfsApi
  json: C
  setIpfsCid: (cid: IpfsCid) => void
  buildTxParamsCallback: (cid: IpfsCid) => any[]
}

export const getTxParams = async <C extends CommonContent>({
  ipfs,
  json,
  setIpfsCid,
  buildTxParamsCallback,
}: Params<C>) => {
  try {
    const cid = (await ipfs.saveContentToOffchain(json))?.toString()
    if (cid) {
      setIpfsCid(cid)
      return buildTxParamsCallback(cid)
    } else {
      log.error('Save to IPFS returned an undefined CID')
    }
  } catch (err) {
    log.error(`Failed to build tx params. ${err}`)
  }
  return []
}
