import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const sliceName = 'onBoarding'
export type OnBoardingModalOpenStates = 'full-on-boarding' | 'partial' | ''

export type ProfileOnBoardingData = {
  image: string
  name: string
  about: string
}
export type OnBoardingDataTypes = {
  topics: string[]
  energy: number
  profile: ProfileOnBoardingData
  spaces: string[]
  signer: undefined
  confirmation: undefined
}

type OnBoardingDataWithDraft<T, key extends keyof T> = { values?: T[key] } & { isDraft?: boolean }
export type OnBoardingDataWrapper<T> = {
  [key in keyof T]: OnBoardingDataWithDraft<T, key>
}
export type OnBoardingFullData = Partial<OnBoardingDataWrapper<OnBoardingDataTypes>>
export interface OnBoardingEntity {
  currentStep: keyof OnBoardingDataTypes | undefined
  onBoardingModalOpenState: OnBoardingModalOpenStates
  data: OnBoardingFullData
}
const initialState: OnBoardingEntity = {
  currentStep: undefined,
  onBoardingModalOpenState: '',
  data: {},
}

const slice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    openModal: (
      state,
      action: PayloadAction<{
        toStep?: keyof OnBoardingDataTypes
        type: Exclude<OnBoardingModalOpenStates, ''>
      }>,
    ) => {
      if (action.payload.toStep) {
        state.currentStep = action.payload.toStep
      }
      state.onBoardingModalOpenState = action.payload.type
    },
    closeModal: state => {
      state.onBoardingModalOpenState = ''
      state.currentStep = undefined
    },
    resetData: (state, action: PayloadAction<keyof OnBoardingDataTypes | undefined>) => {
      if (!action.payload) {
        state.data = {}
        return
      }
      state.data[action.payload] = undefined
    },
    saveData: (
      state,
      action: PayloadAction<{
        dataType: keyof OnBoardingDataTypes
        data: OnBoardingDataTypes[typeof action.payload.dataType]
      }>,
    ) => {
      const { data, dataType } = action.payload
      if (!state.data[dataType]) {
        state.data[dataType] = {}
      }
      state.data[dataType]!.values = data
      state.data[dataType]!.isDraft = false
    },
    markCurrentStepAsDraft: (state, action: PayloadAction<boolean>) => {
      if (!state.currentStep || !state.data[state.currentStep]) return
      state.data[state.currentStep]!.isDraft = action?.payload ?? true
    },
    goToStep: (state, action: PayloadAction<keyof OnBoardingDataTypes>) => {
      state.currentStep = action.payload
    },
  },
})

export const {
  openModal: openOnBoardingModal,
  closeModal: closeOnBoardingModal,
  goToStep: goToStepOnBoardingModal,
  markCurrentStepAsDraft: markStepAsDraftOnBoardingModal,
  saveData: saveOnBoardingData,
  resetData: resetOnBoardingData,
} = slice.actions

export default slice.reducer
