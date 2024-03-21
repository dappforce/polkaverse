import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { AccountInfo } from '@polkadot/types/interfaces'
import { asAccountId } from '@subsocial/api'
import { isStr, newLogger, nonEmptyStr } from '@subsocial/utils'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { useDispatch } from 'react-redux'
import useEmailAccount from 'src/hooks/useEmailAccount'
import {
  useCreateReloadAccountIdsByFollower,
  useCreateReloadSpaceIdsRelatedToAccount,
} from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import {
  setMyAddress,
  setMyEmailAddress,
  signOut,
  unsetMyEmailAddress,
} from 'src/rtk/features/accounts/myAccountSlice'
import { fetchAddressLikeCounts } from 'src/rtk/features/activeStaking/addressLikeCountSlice'
import { fetchChainsInfo } from 'src/rtk/features/chainsInfo/chainsInfoSlice'
import { fetchProfileSpace } from 'src/rtk/features/profiles/profilesSlice'
import { fetchEntityOfSpaceIdsByFollower } from 'src/rtk/features/spaceIds/followedSpaceIdsSlice'
import { useMyAccount } from 'src/stores/my-account'
import { AnyAccountId, DataSourceTypes, EmailAccount } from 'src/types'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useAccountSelector } from '../profile-selector/AccountSelector'
import { useIsMobileWidthOrDevice } from '../responsive'
import { reloadSpaceIdsFollowedByAccount } from '../spaces/helpers/reloadSpaceIdsFollowedByAccount'
import { equalAddresses } from '../substrate'
import { getSignerToken, isProxyAdded } from '../utils/OffchainSigner/ExternalStorage'
import { getSubsocialApi } from '../utils/SubsocialConnect'
import { desktopWalletConnect, mobileWalletConection } from './utils'
//
// Types
//

export type Status = 'LOADING' | 'UNAVAILABLE' | 'UNAUTHORIZED' | 'NOACCOUNT' | 'OK'

const recheckStatuses = ['UNAVAILABLE', 'UNAUTHORIZED']

//
// Context
//

type StateProps = {
  accounts: InjectedAccountWithMeta[]
  emailAccounts: EmailAccount[]
  status: Status
}

const log = newLogger('MyAccountsContext')

function functionStub(): any {
  log.error(`Function needs to be set in ${MyAccountsProvider.name}`)
}

export type MyAccountsContextProps = {
  setEmailAddress: (emailAddress: string) => void
  unsetEmailAddress: () => void
  setAddress: (address: string) => void
  signOut: () => void
  state: StateProps
  setAccounts: (account: InjectedAccountWithMeta[]) => void
  setEmailAccounts: (emailAccounts: EmailAccount[]) => void
  resetEmailAccounts: () => void
  connectWallet: () => void
}

const contextStub: MyAccountsContextProps = {
  setEmailAddress: functionStub,
  unsetEmailAddress: functionStub,
  setAddress: functionStub,
  signOut: functionStub,
  setAccounts: functionStub,
  setEmailAccounts: functionStub,
  resetEmailAccounts: functionStub,
  state: {
    accounts: [],
    emailAccounts: [],
    status: 'LOADING',
  },
  connectWallet: functionStub,
}

type UnsubscribeFn = {
  (): void | undefined
  (): void
}

export const MyAccountsContext = createContext<MyAccountsContextProps>(contextStub)

export function MyAccountsProvider(props: React.PropsWithChildren<{}>) {
  const dispatch = useDispatch()
  const reloadAccountIdsByFollower = useCreateReloadAccountIdsByFollower()
  const reloadSpaceIdsRelatedToAccount = useCreateReloadSpaceIdsRelatedToAccount()
  const address = useMyAddress()
  const isInitialized = useMyAccount(state => state.isInitialized)
  const { getAllEmailAccounts } = useEmailAccount()
  const [, recheck] = useReducer(x => (x + 1) % 16384, 0)
  const isMobile = useIsMobileWidthOrDevice()

  const [status, setStatus] = useState<Status>('LOADING')
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])

  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([])

  const resetEmailAccounts = useCallback(() => {
    const emailAccounts = getAllEmailAccounts()
    setEmailAccounts(emailAccounts)
  }, [setEmailAccounts])

  useEffect(() => {
    resetEmailAccounts()
  }, [])

  const params = { setAccounts, setStatus }
  const connectWallet = useCallback(() => {
    isMobile ? mobileWalletConection(params) : desktopWalletConnect(params)
  }, [])

  useEffect(() => {
    if (!recheckStatuses.includes(status)) return

    const intervalId = setInterval(recheck, 1000)
    return () => clearInterval(intervalId)
  }, [status])

  useSubsocialEffect(
    ({ substrate }) => {
      if (!address) return

      let unsubAccountInfo: UnsubscribeFn

      const loadAndSubscribe = async () => {
        const readyApi = await substrate.api

        Promise.all([
          reloadSpaceIdsFollowedByAccount({ substrate, dispatch, account: address }),
          reloadAccountIdsByFollower(address),
          reloadSpaceIdsRelatedToAccount(address),
          dispatch(fetchChainsInfo({})),
        ])

        unsubAccountInfo = await readyApi.query.system.account(
          address,
          async (accountInfo: AccountInfo) => {
            log.debug('Account info updated on chain:', accountInfo.toJSON())
          },
        )
      }

      loadAndSubscribe()

      return () => {
        unsubAccountInfo && unsubAccountInfo()
      }
    },
    [address],
  )
  useEffect(() => {
    if (!isInitialized || !address) return
    dispatch(
      fetchEntityOfSpaceIdsByFollower({
        id: address,
        dataSource: DataSourceTypes.SQUID,
        api: getSubsocialApi(),
      }),
    )
    dispatch(
      fetchProfileSpace({ id: address, api: getSubsocialApi(), dataSource: DataSourceTypes.SQUID }),
    )
    dispatch(fetchAddressLikeCounts({ address, postIds: null }))
  }, [address, isInitialized])

  const state = useMemo(
    () => ({ accounts, status, emailAccounts }),
    [accounts, status, emailAccounts],
  )

  const value: MyAccountsContextProps = useMemo(() => {
    return {
      setEmailAddress: (emailAddress: string) => dispatch(setMyEmailAddress(emailAddress)),
      unsetEmailAddress: () => dispatch(unsetMyEmailAddress()),
      setAddress: (address: string) => dispatch(setMyAddress(address)),
      signOut: () => dispatch(signOut()),
      setAccounts,
      setEmailAccounts,
      resetEmailAccounts,
      state,
      connectWallet,
    }
  }, [state])

  return <MyAccountsContext.Provider value={value}>{props.children}</MyAccountsContext.Provider>
}

export function useMyAccountsContext() {
  return useContext(MyAccountsContext)
}

export function useMyAccounts() {
  return useContext(MyAccountsContext).state
}

export function useMyEmailAddress() {
  return useAppSelector(state => state.myAccount.emailAddress)
}

export function useIsUsingEmailOrSigner() {
  const myAddress = useMyAddress()
  const isUsingSigner = isStr(getSignerToken(myAddress!))
  return useIsUsingEmail() || isUsingSigner
}

export function useMyAddress() {
  return useMyAccount(state => state.parentProxyAddress || state.address || '')
}

export function useAmIBlocked() {
  return useAppSelector(state => state.myAccount.blocked)
}

export function useIsMyAddress(anotherAddress?: AnyAccountId) {
  return equalAddresses(useMyAddress(), anotherAddress)
}

export function useIsOneOfMyAddresses(anotherAddress?: AnyAccountId) {
  const { switchAccountsSet } = useAccountSelector({})

  if (!anotherAddress) return false

  const anotherSubAddress = asAccountId(anotherAddress)?.toString()

  return anotherSubAddress && switchAccountsSet.has(anotherSubAddress)
}

export function useIsSignedIn() {
  return nonEmptyStr(useMyAddress())
}

export function useIsMainProxyAdded() {
  const myAddress = useMyAddress()
  if (!myAddress) return false
  return isProxyAdded(myAddress)
}

export function useGetSignerToken() {
  const myAddress = useMyAddress()
  if (!myAddress) return false
  return getSignerToken(myAddress)
}

export function useIsUsingSignerAccount() {
  const isMainProxyAdded = useIsMainProxyAdded()
  const signerToken = useGetSignerToken()
  const myEmailAddress = useMyEmailAddress()
  return isStr(signerToken) && !isStr(myEmailAddress) && isMainProxyAdded
}

export function useIsUsingEmail() {
  const signerToken = useGetSignerToken()
  const myEmailAddress = useMyEmailAddress()
  return isStr(signerToken) && isStr(myEmailAddress)
}

export default MyAccountsProvider
