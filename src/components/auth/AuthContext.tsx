import { u128 } from '@polkadot/types'
import { CodecMap } from '@polkadot/types/codec'
import BN from 'bn.js'
import { useRouter } from 'next/router'
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  useIsSignedIn,
  useMyAccountsContext,
  useMyAddress,
} from 'src/components/auth/MyAccountsContext'
import useExternalStorage from 'src/hooks/useExternalStorage'
import { useAppDispatch } from 'src/rtk/app/store'
import { useOpenCloseOnBoardingModal } from 'src/rtk/features/onBoarding/onBoardingHooks'
import { resetOnBoardingData } from 'src/rtk/features/onBoarding/onBoardingSlice'
import store from 'store'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { calculateEnergyState, EnergyState, getEnergyCoef } from '../energy/utils'
import OnBoardingModal, {
  ON_BOARDING_MODAL_KEY,
} from '../onboarding/OnBoardingModal/OnBoardingModal'
import { useResponsiveSize } from '../responsive/ResponsiveContext'
import { useSubstrate } from '../substrate'
import SignInModal from './signIn/SignInModal'
import { getCurrentWallet } from './utils'

const ONBOARDED_ACCS = 'df.onboarded'

export type CompletedSteps = {
  isSignedIn: boolean
  hasTokens: boolean
  hasOwnSpaces: boolean
}

export type AuthState = {
  currentStep: number
  completedSteps: CompletedSteps
  canReserveHandle: boolean
  mnemonic: string | null
  password: string | null
  email: string | null
}

function functionStub() {
  throw new Error('Function needs to be set in OnBoardingContext')
}

export type ModalKind = 'OnBoarding' | 'AuthRequired' | 'SwitchAccount'

export type AuthContextProps = {
  state: AuthState
  energy: EnergyState
  balance: BN
  openSignInModal: (withBackButton?: boolean) => void
  withBackButton?: boolean
  hideSignInModal: () => void
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  setMnemonic: React.Dispatch<React.SetStateAction<string | null>>
  setPassword: React.Dispatch<React.SetStateAction<string | null>>
  setEmail: React.Dispatch<React.SetStateAction<string | null>>
}

const energyStub: EnergyState = { status: 'normal', transactionsCount: 0, coefficient: 1 }

const contextStub: AuthContextProps = {
  state: {
    currentStep: 0,
    mnemonic: null,
    password: null,
    email: null,
    completedSteps: {
      isSignedIn: false,
      hasTokens: false,
      hasOwnSpaces: false,
    },
    canReserveHandle: false,
  },
  withBackButton: true,
  energy: energyStub,
  balance: new BN(0),
  openSignInModal: functionStub,
  hideSignInModal: functionStub,
  setCurrentStep: functionStub,
  setMnemonic: functionStub,
  setPassword: functionStub,
  setEmail: functionStub,
}

export enum StepsEnum {
  Disabled = -1,
  SelectWallet,
  SelectAccount,
  SignIn,
  SignUp,
  Confirmation,
  ShowMnemonic,
  SignInDone,
}

const useGetCurrentStep = (isMobile: boolean) => {
  const isSignedIn = useIsSignedIn()
  const [step, setStep] = useState<number>(StepsEnum.SelectWallet)

  useEffect(() => {
    if (!isSignedIn) {
      setStep(getCurrentWallet() || isMobile ? StepsEnum.SelectAccount : StepsEnum.SelectWallet)
    }
  }, [isSignedIn])

  return step
}

export const AuthContext = createContext<AuthContextProps>(contextStub)

export function AuthProvider(props: React.PropsWithChildren<any>) {
  const { getDataForAddress: getIsFinishedOnBoarding } = useExternalStorage(ON_BOARDING_MODAL_KEY, {
    parseStorageToState: data => data === '1',
  })
  const dispatch = useAppDispatch()

  const { signOut } = useMyAccountsContext()

  const address = useMyAddress()
  const isSignedIn = useIsSignedIn()
  const { tokenDecimal } = useSubstrate()

  const { asPath } = useRouter()
  const { isMobile } = useResponsiveSize()

  const [hasTokens, setTokens] = useState(false)
  const step = useGetCurrentStep(isMobile)

  const [mnemonic, setMnemonic] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState(step)

  const accountsFromStorage = store.get(ONBOARDED_ACCS)

  const [onBoardedAccounts] = useState<string[]>(accountsFromStorage?.split(',') || [])

  const noOnBoarded = !address || !onBoardedAccounts.includes(address)

  const [canReserveHandle /* setCanReserveHandle */] = useState(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [energy, setEnergy] = useState<EnergyState>()
  const [balance, setBalance] = useState(new BN(0))
  const [hasOwnSpaces, setSpaces] = useState(false)
  const [withBackButton, setWithBackButton] = useState<boolean | undefined>()

  const openCloseOnBoardingModal = useOpenCloseOnBoardingModal()

  useEffect(() => {
    setCurrentStep(step)
  }, [step])

  useSubsocialEffect(
    ({ substrate }) => {
      let unsubBalance: (() => void) | undefined
      let unsubSpace: any
      let unsubEnergy: any

      setEnergy(energyStub)

      unsubSpace && unsubSpace()
      unsubBalance && unsubBalance()

      const subSpace = async () => {
        if (!address) return

        const api = await substrate.api
        unsubSpace = await api.query.spaces.spaceIdsByOwner(address, (data: CodecMap) => {
          unsubBalance && unsubBalance()

          if (data.isEmpty) {
            setSpaces(false)
          } else {
            setSpaces(true)
            if (noOnBoarded) {
              onBoardedAccounts.push(address)
              store.set(ONBOARDED_ACCS, onBoardedAccounts.join(','))
            }
          }
          subBalance()
        })
      }

      const subBalance = async () => {
        if (!address) return

        const api = await substrate.api

        unsubBalance = await api.derive.balances.all(address, async ({ freeBalance }) => {
          unsubEnergy && unsubEnergy()
          setBalance(freeBalance)

          unsubEnergy = await api.query.energy.energyBalance(
            address,
            async (energyBalance: u128) => {
              const isEmptyBalanseAndEnergy = energyBalance.eqn(0) && freeBalance.eqn(0)

              setTokens(!isEmptyBalanseAndEnergy)

              const energyCoef = energy?.coefficient || (await getEnergyCoef(api))
              setEnergy(calculateEnergyState(energyBalance.toString(), energyCoef, tokenDecimal))
            },
          )
        })
      }

      subSpace()

      return () => {
        unsubSpace && unsubSpace()
        unsubBalance && unsubBalance()
      }
    },
    [address, isSignedIn],
  )

  useEffect(() => setShowModal(false), [asPath])

  const contextValue: AuthContextProps = {
    state: {
      mnemonic,
      password,
      email,
      currentStep,
      completedSteps: {
        isSignedIn,
        hasTokens,
        hasOwnSpaces,
      },
      canReserveHandle,
    },
    energy: energy || energyStub,
    balance,
    withBackButton,
    openSignInModal: (withBackButton?: boolean) => {
      setWithBackButton(withBackButton !== undefined ? withBackButton : true)
      setShowModal(true)
    },
    hideSignInModal: () => {
      setShowModal(false)
    },
    setCurrentStep,
    setMnemonic,
    setPassword,
    setEmail,
  }

  const onAccountChosen = (address: string) => {
    if (getIsFinishedOnBoarding(address)) return

    openCloseOnBoardingModal('open')
  }
  const onBackClickInFirstOnBoardingStep = () => {
    setCurrentStep(StepsEnum.SelectAccount)
    setShowModal(true)
    dispatch(resetOnBoardingData())
    openCloseOnBoardingModal('close')
    signOut()
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
      <SignInModal
        onAccountChosen={onAccountChosen}
        open={showModal}
        hide={() => setShowModal(false)}
      />
      <OnBoardingModal onBackClickInFirstStep={onBackClickInFirstOnBoardingStep} />
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function MockAuthProvider(props: React.PropsWithChildren<AuthState>) {
  return (
    <AuthContext.Provider value={{ ...contextStub, state: props }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export function withAuthContext(Component: React.ComponentType<any>) {
  return (
    <AuthProvider>
      <Component />
    </AuthProvider>
  )
}
