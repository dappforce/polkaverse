import { stringToU8a } from '@polkadot/util'
import { newLogger } from '@subsocial/utils'
import axios from 'axios'
import { PalletName } from 'src/types'

type SubstrateApiProps = {
  rpcUrl: string
}

type RpcParams = any[]

type StorageItem = {
  moduleName: PalletName
  method: string
}

type RpcResult = {
  result: any
}

const createRpcJson = ({ moduleName, method }: StorageItem, params: RpcParams) => ({
  jsonrpc: '2.0',
  id: 1,
  method: `${moduleName}_${method}`,
  params,
})

const log = newLogger('SubsocialSubstrateRpc')

export class SubsocialSubstrateRpc {
  private rpcUrl: string

  constructor({ rpcUrl }: SubstrateApiProps) {
    this.rpcUrl = rpcUrl
    log.info('Initialized')
  }

  // ---------------------------------------------------------------------
  // Private utils

  private async rpcQuery<Params, Result = any>(
    method: StorageItem,
    value?: Params,
  ): Promise<Result | undefined> {
    try {
      const params = Array.isArray(value) ? value : [value]
      const { data, status, statusText } = await axios.post<RpcResult>(
        this.rpcUrl,
        createRpcJson(method, [...params]),
        { headers: { 'Content-Type': 'application/json' } },
      )

      if (status !== 200) {
        throw statusText
      }

      return data.result
    } catch (err) {
      log.error('Failed rpc method:', err)
      return undefined
    }
  }

  private async queryDomains(method: string, value?: any): Promise<any> {
    return this.rpcQuery({ moduleName: 'domains', method }, value)
  }

  async calculatePrice(domain: string): Promise<any> {
    const domainU8a = stringToU8a(domain)

    return this.queryDomains('calculatePrice', [Array.from(domainU8a)])
  }
}
