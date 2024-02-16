import { SocialEventDataApiInput } from '@subsocial/data-hub-sdk'
import { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse, handlerWrapper } from 'src/server/common'
import {
  createSuperLikeServer,
  getSuperLikeConfirmationMsg,
} from 'src/server/datahub-queue/super-likes'
import { z } from 'zod'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return GET_handler(req, res)
  }
  if (req.method === 'POST') {
    return POST_handler(req, res)
  }

  return res.status(405).send('Method Not Allowed')
}

const GET_handler = handlerWrapper({
  inputSchema: z.any(),
  dataGetter: req => req.query,
})<{ data: { message: string } }>({
  allowedMethods: ['GET'],
  errorLabel: 'super-likes',
  handler: async (data: ApiDatahubModerationBody, _req, res) => {
    const response = await getSuperLikeConfirmationMsg()

    res.json({
      data: {
        message: response.message,
      },
      message: 'OK',
      success: true,
    })
  },
})

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
