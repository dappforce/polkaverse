import axios from 'axios'
import config from 'src/config'
import { callRefreshToken } from './requests'

const { offchainSignerUrl } = config

const offchainSignerApi = (accessToken?: string, refreshToken?: string) => {
  const instance = axios.create({
    baseURL: offchainSignerUrl,
  })

  // Add a request interceptor to add the Authorization header to each request
  instance.interceptors.request.use(
    config => {
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

      try {
        // If the error is due to an expired access token and a refresh token is available
        if (
          error.response.status === 401 &&
          originalRequest &&
          !originalRequest._retry &&
          refreshToken
        ) {
          originalRequest._retry = true

          const response = await callRefreshToken(refreshToken)

          const { accessToken: newAccessToken } = response.data

          // Update the access token in the Axios instance
          instance.defaults.headers.common['Authorization'] = newAccessToken

          // Retry the original request with the new access token
          return instance(originalRequest)
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
