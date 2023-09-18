import { stringToU8a, u8aToHex } from '@polkadot/util'
import {
  decodeAddress,
  mnemonicToMiniSecret,
  naclBoxPairFromSecret,
  naclSeal,
} from '@polkadot/util-crypto'
import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { NONCE } from 'src/components/domains/dot-seller/config'

type RequestHeaders = {
  Authorization: string
  'Client-Id': string
}

type PendingOrdersWrapper = {
  req: NextApiRequest
  res: NextApiResponse
  sellerApiAuthTokenManager: string
  request: (requestHeaders: RequestHeaders) => Promise<any>
}

export const pendingOrdersWrapper = async ({
  req,
  res,
  sellerApiAuthTokenManager,
  request,
}: PendingOrdersWrapper) => {
  if (req.method !== 'POST') return res.status(404).end()

  try {
    const nonce = new Uint8Array(24)
    nonce[0] = NONCE

    const tokenMessage = dayjs.utc().valueOf().toString()

    const requesterKeypair = naclBoxPairFromSecret(
      mnemonicToMiniSecret(process.env.SELLER_CLIENT_TOKEN_SIGNER || ''),
    )

    const clientId = process.env.SELLER_CLIENT_ID as string

    const signedToken = naclSeal(
      stringToU8a(tokenMessage),
      requesterKeypair.secretKey,
      decodeAddress(sellerApiAuthTokenManager),
      nonce,
    )

    console.log(clientId, process.env.SELLER_CLIENT_TOKEN_SIGNER)

    const requestHeaders = {
      Authorization: 'Bearer ' + u8aToHex(signedToken.sealed),
      'Client-Id': clientId,
    }

    const result = await request(requestHeaders)

    res.status(200).send({ success: true })
    return result
  } catch (e: any) {
    res.status(200).send({
      success: false,
      errors: e.response?.errors?.[0].message,
    })
    return undefined
  }
}
