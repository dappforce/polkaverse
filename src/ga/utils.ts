import { gaId } from 'src/config/env'

const GA_DISABLE_KEY = `ga-disable-${gaId}`

type Cookies = {
  ga: boolean
}

const COOKIES_KEY = 'SUB_ID_COOKIES'

const setCookies = (cookies: Cookies) => localStorage.setItem(COOKIES_KEY, JSON.stringify(cookies))

const disableGaStorage = (value: boolean) => {
  ;(window as any)[GA_DISABLE_KEY] = value
}

const setGaStorage = (ga: boolean) => {
  setCookies({ ga })
  disableGaStorage(!ga)
}

export const disableGa = () => {
  setGaStorage(false)
}

export const enableGa = () => {
  setGaStorage(true)
}

export const readCookies = () => {
  try {
    const cookiesStr = localStorage.getItem(COOKIES_KEY)

    if (!cookiesStr) return undefined

    const cookies = JSON.parse(cookiesStr) as Cookies

    disableGaStorage(!cookies.ga)

    return cookies.ga
  } catch (err) {
    return undefined
  }
}
