import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextApiRequest, NextApiResponse } from 'next'
import { UPDATE_PENDING_ORDER } from 'src/components/domains/dot-seller/seller-queries'
import { SendMutationRequest } from 'src/components/domains/utils'

dayjs.extend(utc)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sellerApiAuthTokenManager, domain, interrupted } = req.body

  if (req.method !== 'POST') return res.status(404).end()

  return SendMutationRequest({
    sellerApiAuthTokenManager,
    args:   {
      id: domain,
      interrupted,
    },
    sellerClientId: process.env.SELLER_CLIENT_ID as string,
    sellerClientTokenSigner: process.env.SELLER_SOONSOCIAL_FE_CLIENT_TOKEN_SIGNER || '',
    query: UPDATE_PENDING_ORDER,
    res,
  })
}
