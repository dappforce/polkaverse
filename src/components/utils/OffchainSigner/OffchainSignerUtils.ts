// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { ApiPromise, SubmittableResult } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types'

import { submitSignedCallData } from './api/requests'

import { truncateAddress } from 'src/utils/storage'

import { newLogger } from '@subsocial/utils'
const log = newLogger('OffchainSignerUtils')

export const isAccountOnboarded = (accountId: string) =>
  localStorage.getItem(`df.onBoardingModalFinished:${truncateAddress(accountId)}`) === '1'

export const sendSignerTx = async (
  api: ApiPromise,
  extrinsic: SubmittableExtrinsic,
  signerToken: string,
  refreshToken: string,
  onSuccessHandler: (result: SubmittableResult) => Promise<void>,
  onFailedHandler: (err: Error) => void,
) => {
  const hexCallData = extrinsic.inner.toHex()
  try {
    const res = await submitSignedCallData({
      data: hexCallData,
      accessToken: signerToken,
      refreshToken,
    })

    if (!res) throw new Error('No response from server')

    const { signedCall } = res

    await api.tx(signedCall).send(onSuccessHandler)
  } catch (err: any) {
    log.error(err)
    onFailedHandler(err instanceof Error ? err.message : err)
  }
}
