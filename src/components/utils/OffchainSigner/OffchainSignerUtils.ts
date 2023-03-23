import { ApiPromise, SubmittableResult } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/promise/types'

import { submitSignedCallData } from './api/requests'

import { truncateAddress } from 'src/utils/storage'

import { newLogger } from '@subsocial/utils'
const log = newLogger('OffchainSignerRequests')

export const isAccountOnboarded = (accountId: string) =>
  localStorage.getItem(`df.onBoardingModalFinished:${truncateAddress(accountId)}`) === '1'

export const sendSignerTx = async (
  api: ApiPromise,
  extrinsic: SubmittableExtrinsic,
  signerToken: string,
  onSuccessHandler: (result: SubmittableResult) => Promise<void>,
  onFailedHandler: (err: Error) => void,
) => {
  try {
    const hexCallData = extrinsic.inner.toHex()

    const res = await submitSignedCallData({
      data: hexCallData,
      jwt: signerToken,
    })

    const { signedCall } = res?.data

    await api.tx(signedCall).send(onSuccessHandler)
  } catch (err: any) {
    log.error(err)
    onFailedHandler(err instanceof Error ? err.message : err)
  }
}
