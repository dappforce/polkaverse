import { SocialEventDataApiInput } from '@subsocial/data-hub-sdk'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse, handlerWrapper } from 'src/server/common'
import { createSuperLikeServer } from 'src/server/datahub-queue/super-likes'
import { z } from 'zod'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return POST_handler(req, res)
  }

  return res.status(405).send('Method Not Allowed')
}

export type ApiDatahubModerationBody = SocialEventDataApiInput
export type ApiDatahubModerationResponse = ApiResponse
const POST_handler = handlerWrapper({
  inputSchema: z.any(),
  dataGetter: req => req.body,
})({
  allowedMethods: ['POST'],
  errorLabel: 'super-likes',
  handler: async (data: ApiDatahubModerationBody, _req, res) => {
    await createSuperLikeServer(data)

    res.json({
      message: 'OK',
      success: true,
    })
  },
})
