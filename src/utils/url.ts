import { isServerSide } from 'src/components/utils'

export function getCurrentSearchParams() {
  if (isServerSide()) return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

export function createQueryFromSearchParams(searchParams: URLSearchParams) {
  return Object.fromEntries(searchParams)
}

export function getCurrentUrlWithoutQuery(queryNameToRemove?: string) {
  if (queryNameToRemove) {
    const query = window.location.search
    const searchParams = new URLSearchParams(query)
    searchParams.delete(queryNameToRemove)

    const url = window.location.origin + window.location.pathname
    const search = searchParams.toString()

    if (!search) return url
    return url + '?' + search
  }
  return window.location.origin + window.location.pathname
}

export function getCurrentUrlOrigin() {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

export function getUrlQuery(queryName: string) {
  if (isServerSide()) return ''
  const query = window.location.search
  const searchParams = new URLSearchParams(query)
  return searchParams.get(queryName) ?? ''
}

export function redirectToLogin() {
  if (isServerSide()) return
  window.location.href = '/c/widget/login'
}
