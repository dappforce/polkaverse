import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { NextApiRequest, NextApiResponse } from 'next'
import { sellerSquidGraphQlClient } from 'src/components/domains/dot-seller/config'
import { CREATE_PENDING_ORDER } from 'src/components/domains/dot-seller/seller-queries'
import { pendingOrdersWrapper } from 'src/server/pendingOrders'

dayjs.extend(utc)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sellerApiAuthTokenManager, createdByAccount, destination, domain, signer, target } =
    req.body

  await pendingOrdersWrapper({
    req,
    res,
    sellerApiAuthTokenManager,
    request: (requestHeaders: any) =>
      sellerSquidGraphQlClient.request(
        CREATE_PENDING_ORDER,
        {
          createdByAccount,
          destination,
          domain,
          signer,
          target,
        },
        requestHeaders,
      ),
  })
}
