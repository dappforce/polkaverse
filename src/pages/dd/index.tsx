// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import { PageNotFound } from 'src/components/utils'
import { getIsDomainsPromoValid } from 'src/components/utils/OffchainUtils'
import config from 'src/config'

const DomainRegisterPage = dynamic(import('src/components/domains'), { ssr: false })

const isDomainEnabled = config.enableDomains

export interface DomainServerProps {
  promoCode?: string
}
export const getServerSideProps: GetServerSideProps<DomainServerProps> = async context => {
  let promoCode = context.query?.promo
  if (Array.isArray(promoCode)) {
    promoCode = promoCode[0]
  }
  if (!isDomainEnabled || !promoCode) return { props: {} }

  const isPromoValid = await getIsDomainsPromoValid(promoCode)
  return {
    props: isPromoValid
      ? {
          promoCode,
        }
      : {
          promoCode: 'invalid',
        },
  }
}

export default isDomainEnabled ? DomainRegisterPage : PageNotFound
