// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import axios from 'axios'
import config from 'src/config'
import { readMyAddress } from 'src/rtk/features/accounts/myAccountSlice'
import store from 'store'
import {
  createStorageKeyWithSubAddress,
  getSignerRefreshToken,
  getSignerToken,
  SIGNER_REFRESH_TOKEN_KEY,
  SIGNER_TOKEN_KEY,
} from '../ExternalStorage'
import { signOutFromProxy } from '../utils'
import { callRefreshToken } from './requests'
import { OffchainSignerEndpoint } from './utils'

const { offchainSignerUrl } = config

const offchainSignerApi = () => {
  const instance = axios.create({
    baseURL: offchainSignerUrl,
  })

  // Add a request interceptor to add the Authorization header to each request
  instance.interceptors.request.use(
    config => {
      const address = readMyAddress()
      const accessToken = getSignerToken(address!)
      if (config.headers && accessToken) {
        config.headers['Authorization'] = accessToken
      }
      return config
    },
    error => Promise.reject(error),
  )

  instance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config
      const address = readMyAddress()
      const refreshToken = getSignerRefreshToken(address!)

      const originalRequestUrl = originalRequest.baseURL || originalRequest.url
      const isRefreshTokenRequest = originalRequestUrl?.includes(
        OffchainSignerEndpoint.REFRESH_TOKEN,
      )
      if (isRefreshTokenRequest) {
        const address = readMyAddress()
        if (address) {
          signOutFromProxy(address)
        }
        throw new Error('Your session has expired, please approve your popup removal again.')
      }

      try {
        // If the error is due to an expired access token and a refresh token is available
        if (
          error.response.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          refreshToken &&
          !isRefreshTokenRequest
        ) {
          originalRequest._retry = true

          const response = await callRefreshToken(refreshToken)

          if (!response) console.error('No data returned from callRefreshToken')
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response

          store.set(createStorageKeyWithSubAddress(SIGNER_TOKEN_KEY, address!), newAccessToken)
          store.set(
            createStorageKeyWithSubAddress(SIGNER_REFRESH_TOKEN_KEY, address!),
            newRefreshToken,
          )

          const newRequest = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: newAccessToken,
            },
          }

          return instance(newRequest)
        }

        // If the error is not due to an expired access token or a refresh token is not available, throw the error
        throw error
      } catch (err) {
        // Handle refresh token error
        throw err
      }
    },
  )

  return instance
}

export default offchainSignerApi
