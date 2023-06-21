// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { toSubsocialAddress } from '@subsocial/utils'
import jwtDecode from 'jwt-decode'
import { JwtPayload } from 'src/components/utils/OffchainSigner/api/requests'
import { SIGNER_TOKEN_KEY } from 'src/components/utils/OffchainSigner/ExternalStorage'
import { EmailAccount } from 'src/types'
import { isExpExpired } from 'src/utils/token'
import store from 'store'

const useEmailAccount = () => {
  const getAllEmailAccounts = () => {
    const emailAccounts: EmailAccount[] = []

    store.each((value, key) => {
      if (key.includes(SIGNER_TOKEN_KEY)) {
        const { accountAddress, email, emailVerified, exp } = jwtDecode<JwtPayload>(value)
        const isExpired = isExpExpired(exp)
        if (!emailVerified || isExpired) return

        const result = {
          accountAddress: toSubsocialAddress(accountAddress) ?? accountAddress,
          email,
        }

        emailAccounts.push(result)
      }
    })

    return emailAccounts
  }

  return {
    getAllEmailAccounts,
  }
}

export default useEmailAccount
