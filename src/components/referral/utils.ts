import { getUrlQuery } from 'src/utils/url'

export function getReferralIdInUrl() {
  return getUrlQuery('ref')
}
