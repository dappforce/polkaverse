import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { nonEmptyStr, toSubsocialAddress } from '@subsocial/utils'
import { equalAddresses } from 'src/components/substrate'
import { isBlockedAccount } from 'src/moderation'
import { AccountId } from 'src/types'
import store from 'store'

const MY_ADDRESS = 'df.myAddress'
const DID_SIGN_IN = 'df.didSignIn'

function storeDidSignIn() {
  store.set(DID_SIGN_IN, true)
}

export function readMyAddress(): string | undefined {
  const myAddress: string | undefined = store.get(MY_ADDRESS)
  if (nonEmptyStr(myAddress)) {
    storeDidSignIn()
  }
  return myAddress
}

function storeMyAddress(myAddress: string) {
  store.set(MY_ADDRESS, myAddress)
  storeDidSignIn()
}

export const didSignIn = (): boolean => store.get(DID_SIGN_IN)

type MyAddressState = {
  address?: string
  blocked?: boolean
}

type MyAccountState = MyAddressState

const initialState: MyAccountState = {}

const myAccountSlice = createSlice({
  name: 'myAccount',
  initialState,
  reducers: {
    setMyAddress(state, action: PayloadAction<AccountId>) {
      const address = toSubsocialAddress(action.payload)

      if (address && !equalAddresses(state.address, address)) {
        storeMyAddress(address)
        state.address = address
        state.blocked = isBlockedAccount(address)
      }
    },
    loadMyAddress(state) {
      const address = readMyAddress()

      if (address) {
        state.address = address
        state.blocked = isBlockedAccount(address)
      }
    },
    signOut(state) {
      store.remove(MY_ADDRESS)

      delete state.address
      delete state.blocked
    },
  },
})

export const { setMyAddress, loadMyAddress, signOut } = myAccountSlice.actions

export default myAccountSlice.reducer
