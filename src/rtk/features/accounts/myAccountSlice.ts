import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { nonEmptyStr, toSubsocialAddress } from '@subsocial/utils'
import { equalAddresses } from 'src/components/substrate'
import { CURRENT_EMAIL_ADDRESS } from 'src/components/utils/OffchainSigner/ExternalStorage'
import { isBlockedAccount } from 'src/moderation'
import { AccountId } from 'src/types'
import store from 'store'

const MY_EMAIL_ADDRESS = 'df.myEmailAddress'
const MY_ADDRESS = 'df.myAddress'
const DID_SIGN_IN = 'df.didSignIn'

function storeDidSignIn() {
  store.set(DID_SIGN_IN, true)
}

export function readMyEmailAddress(): string | undefined {
  const myEmailAddress: string | undefined = store.get(MY_EMAIL_ADDRESS)
  if (nonEmptyStr(myEmailAddress)) {
    storeDidSignIn()
  }
  return myEmailAddress
}

function storeMyEmailAddress(myEmailAddress: string) {
  store.set(MY_EMAIL_ADDRESS, myEmailAddress)
  storeDidSignIn()
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
  emailAddress?: string
  address?: string
  blocked?: boolean
}

type MyAccountState = MyAddressState

const initialState: MyAccountState = {}

const myAccountSlice = createSlice({
  name: 'myAccount',
  initialState,
  reducers: {
    setMyEmailAddress(state, action: PayloadAction<string>) {
      const emailAddress = action.payload

      if (emailAddress && state.emailAddress !== emailAddress) {
        storeMyEmailAddress(emailAddress)
        state.emailAddress = emailAddress
      }
    },
    unsetMyEmailAddress(state) {
      store.remove(MY_EMAIL_ADDRESS)
      delete state.emailAddress
    },
    loadMyEmailAddress(state) {
      const emailAddress = readMyEmailAddress()

      if (emailAddress) {
        state.emailAddress = emailAddress
      }
    },
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
      store.remove(MY_EMAIL_ADDRESS)
      store.remove(CURRENT_EMAIL_ADDRESS)

      delete state.address
      delete state.blocked
      delete state.emailAddress
    },
  },
})

export const {
  setMyEmailAddress,
  loadMyEmailAddress,
  setMyAddress,
  unsetMyEmailAddress,
  loadMyAddress,
  signOut,
} = myAccountSlice.actions

export default myAccountSlice.reducer
