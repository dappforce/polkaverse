import { toSubsocialAddress } from '@subsocial/utils'
import jwtDecode from 'jwt-decode'
import { JwtPayload } from 'src/components/utils/OffchainSigner/api/requests'
import { SIGNER_TOKEN_KEY } from 'src/components/utils/OffchainSigner/ExternalStorage'
import { EmailAccount } from 'src/types'
import store from 'store'

const useEmailAddress = () => {
  const getAllEmailAccounts = () => {
    const emailAccounts: EmailAccount[] = []

    store.each((value, key) => {
      if (key.includes(SIGNER_TOKEN_KEY)) {
        const { accountAddress, email, emailVerified } = jwtDecode<JwtPayload>(value)
        if (!emailVerified) return

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

export default useEmailAddress
