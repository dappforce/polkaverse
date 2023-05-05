import { stringToU8a, u8aToHex } from '@polkadot/util'
import {
  decodeAddress,
  mnemonicToMiniSecret,
  naclBoxPairFromSecret,
  naclSeal,
} from '@polkadot/util-crypto'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextApiRequest, NextApiResponse } from 'next'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import { DELETE_PENDING_ORDER } from 'src/components/domains/dot-seller/seller-queries'

dayjs.extend(utc)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { domain, sellerApiAuthTokenManager } = req.body
  
  if (req.method !== 'POST') return res.status(404).end()
  
  try {
    const nonce = new Uint8Array(24)
    nonce[0] = 111
    
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

    const requestHeaders = {
      Authorization: 'Bearer ' + u8aToHex(signedToken.sealed),
      'Client-Id': clientId,
    }

    const result = await sellerSquidGraphQlClient.request(
      DELETE_PENDING_ORDER,
      { id: domain },
      requestHeaders
    )

    res.status(200).send({ success: true })
    return result

  } catch (e: any) {
    res.status(200).send({
      success: false,
      errors: e.response.errors?.[0].message,
    })
    return undefined
  }
}
