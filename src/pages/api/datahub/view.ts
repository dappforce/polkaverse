import { SocialEventDataApiInput } from '@subsocial/data-hub-sdk'
import { NextApiRequest, NextApiResponse } from 'next'
import { handlerWrapper } from 'src/server/common'
import { addPostView } from 'src/server/datahub-queue/view'
import { z } from 'zod'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return POST_handler(req, res)
  }

  return res.status(405).send('Method Not Allowed')
}

export type ApiDatahubViewBody = SocialEventDataApiInput
const POST_handler = handlerWrapper({
  inputSchema: z.any(),
  dataGetter: req => req.body,
})({
  allowedMethods: ['POST'],
  errorLabel: 'post-view',
  handler: async (data, _, res) => {
    await addPostView(data)
    res.json({
      message: 'OK',
      success: true,
    })
  },
})
