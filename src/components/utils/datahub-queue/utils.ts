import {
  SocialCallDataArgs,
  socialCallName,
  SocialEventDataApiInput,
  SocialEventDataType,
  socialEventProtVersion,
} from '@subsocial/data-hub-sdk'

export type DatahubParams<T> = {
  address: string

  uuid?: string
  timestamp?: number

  args: T
}

export function createSocialDataEventPayload<T extends keyof typeof socialCallName>(
  callName: T,
  { timestamp, address, uuid, args }: DatahubParams<SocialCallDataArgs<T>>,
) {
  const payload: SocialEventDataApiInput = {
    protVersion: socialEventProtVersion['0.1'],
    dataType: SocialEventDataType.offChain,
    callData: {
      name: callName,
      signer: address || '',
      args: JSON.stringify(args),
      timestamp: timestamp || Date.now(),
      uuid: uuid || crypto.randomUUID(),
    },
    providerAddr: address,
    sig: '',
  }
  return payload
}
