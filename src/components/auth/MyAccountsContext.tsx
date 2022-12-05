import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'
import { AccountInfo } from '@polkadot/types/interfaces'
import { asAccountId } from '@subsocial/api'
import { newLogger, nonEmptyStr } from '@subsocial/utils'
import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  useCreateReloadAccountIdsByFollower,
  useCreateReloadSpaceIdsRelatedToAccount,
} from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { setMyAddress, signOut } from 'src/rtk/features/accounts/myAccountSlice'
import { fetchChainsInfo } from 'src/rtk/features/chainsInfo/chainsInfoSlice'
import { fetchProfileSpace } from 'src/rtk/features/profiles/profilesSlice'
import { fetchEntityOfSpaceIdsByFollower } from 'src/rtk/features/spaceIds/followedSpaceIdsSlice'
import { AnyAccountId } from 'src/types'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { useAccountSelector } from '../profile-selector/AccountSelector'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { reloadSpaceIdsFollowedByAccount } from '../spaces/helpers/reloadSpaceIdsFollowedByAccount'
import { equalAddresses } from '../substrate'
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
  status: Status
}

const log = newLogger('MyAccountsContext')

function functionStub(): any {
  log.error(`Function needs to be set in ${MyAccountsProvider.name}`)
}

export type MyAccountsContextProps = {
  setAddress: (address: string) => void
  signOut: () => void
  state: StateProps
  setAccounts: (account: InjectedAccountWithMeta[]) => void
}

const contextStub: MyAccountsContextProps = {
  setAddress: functionStub,
  signOut: functionStub,
  setAccounts: functionStub,
  state: {
    accounts: [],
    status: 'LOADING',
  },
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
  const { isMobile } = useResponsiveSize()
  const [recheckId, recheck] = useReducer(x => (x + 1) % 16384, 0)

  const [status, setStatus] = useState<Status>('LOADING')
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])

  useEffect(() => {
    const props = { setAccounts, setStatus }
    isMobile ? mobileWalletConection(props) : desktopWalletConnect(props)
  }, [recheckId])

  useEffect(() => {
    if (!recheckStatuses.includes(status)) return

    const intervalId = setInterval(recheck, 1000)
    return () => clearInterval(intervalId)
  }, [status])

  useSubsocialEffect(
    ({ substrate, subsocial }) => {
      if (!address) return

      let unsubAccountInfo: UnsubscribeFn

      const loadAndSubscribe = async () => {
        const readyApi = await substrate.api

        Promise.all([
          reloadSpaceIdsFollowedByAccount({ substrate, dispatch: dispatch, account: address }),
          reloadAccountIdsByFollower(address),
          reloadSpaceIdsRelatedToAccount(address),
          dispatch(fetchProfileSpace({ id: address, api: subsocial })),
          dispatch(fetchEntityOfSpaceIdsByFollower({ id: address, reload: true, api: subsocial })),
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

  const state = useMemo(() => ({ accounts, status }), [accounts, status])

  const value: MyAccountsContextProps = useMemo(() => {
    return {
      setAddress: (address: string) => dispatch(setMyAddress(address)),
      signOut: () => dispatch(signOut()),
      setAccounts,
      state,
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

export function useMyAddress() {
  return useAppSelector(state => state.myAccount.address)
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

export default MyAccountsProvider
