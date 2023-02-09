import { ApiPromise } from '@polkadot/api'
import { SubsocialIpfsApi } from '@subsocial/api'
import { IpfsContent, OptionIpfsContent } from '@subsocial/api/substrate/wrappers'
import { IpfsCid, SpaceContent, SpaceData } from '@subsocial/api/types'
import { balanceWithDecimal, isDefined } from '@subsocial/utils'
import { Form } from 'antd'
import { useCallback, useEffect } from 'react'
import { useMyAddress } from 'src/components/auth/MyAccountsContext'
import { newWritePermission } from 'src/components/spaces/permissions/space-permissions'
import { useSubsocialApi, useSubstrate } from 'src/components/substrate'
import { getProxyAddress } from 'src/components/utils/OffchainSigner/RememberMeButton'
import { useAppDispatch, useAppSelector } from 'src/rtk/app/store'
import { useSelectProfile } from '../profiles/profilesHooks'
import {
  closeOnBoardingModal,
  OnBoardingDataTypes,
  OnBoardingFullData,
  OnBoardingModalOpenStates,
  openOnBoardingModal,
  saveOnBoardingData,
} from './onBoardingSlice'

export function useCurrentOnBoardingStep() {
  return useAppSelector(state => state.onBoarding.currentStep)
}

export function useAllOnBoardingData() {
  return useAppSelector(state => state.onBoarding.data)
}

export function useIsDraftOnBoardingData<T extends keyof OnBoardingDataTypes>(dataType: T) {
  return useAppSelector(state => state.onBoarding.data[dataType]?.isDraft)
}

export function useOnBoardingData<T extends keyof OnBoardingDataTypes>(dataType: T) {
  return useAppSelector(state => state.onBoarding.data[dataType]?.values)
}

export function useOnBoardingModalOpenState() {
  return useAppSelector(state => state.onBoarding.onBoardingModalOpenState)
}

export function useOpenCloseOnBoardingModal() {
  const dispatch = useAppDispatch()
  return useCallback(
    (
      state: 'open' | 'close',
      additionalParamsForOpen?: {
        toStep?: keyof OnBoardingDataTypes
        type: Exclude<OnBoardingModalOpenStates, ''>
      },
    ) => {
      if (state === 'open') {
        const toStep = additionalParamsForOpen?.toStep
        dispatch(
          openOnBoardingModal({
            type: additionalParamsForOpen?.type ?? 'full-on-boarding',
            toStep,
          }),
        )
      } else {
        dispatch(closeOnBoardingModal())
      }
    },
    [],
  )
}

export function useSaveOnBoardingData<T extends keyof OnBoardingDataTypes>(dataType: T) {
  const dispatch = useAppDispatch()
  return useCallback(
    (data: OnBoardingDataTypes[typeof dataType]) => {
      dispatch(saveOnBoardingData({ dataType, data }))
    },
    [dataType],
  )
}

export function useOnBoardingDataForm<
  T extends keyof OnBoardingDataTypes,
  V extends Record<string, any> & OnBoardingDataTypes[T],
>(dataType: T, getInitialValues: () => V) {
  const savedValues = useOnBoardingData(dataType)
  const [form] = Form.useForm<V>()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (typeof savedValues === 'object') {
      form.setFields(Object.entries(savedValues).map(([name, value]) => ({ name, value })))
    }
  }, [])

  const onFieldsChange = useCallback(() => {
    const newValues: V = getInitialValues()
    Object.keys(newValues).forEach(key => {
      newValues[key] = form.getFieldValue(key)
    })
    dispatch(saveOnBoardingData({ dataType, data: newValues }))
  }, [form])

  return { form, onFieldsChange }
}

const getSavedProfileData = (profile: SpaceContent | undefined) => {
  if (!profile) return {}
  const { about, email, image, links, name, tags } = profile
  return { about, email, image, links, name, tags }
}
const upsertProfile = (api: ApiPromise, cid: IpfsCid, currentProfileId?: string) => {
  const permissions = newWritePermission()
  if (!currentProfileId) {
    return api.tx.spaces.createSpace(IpfsContent(cid?.toString()), permissions)
  } else {
    return api.tx.spaces.updateSpace(currentProfileId, {
      content: OptionIpfsContent(cid?.toString()),
    })
  }
}
const txGenerators: {
  [key in keyof OnBoardingDataTypes]?: (
    apis: { api: ApiPromise; ipfs: SubsocialIpfsApi },
    data: OnBoardingDataTypes[key],
    additionalData: {
      myAddress: string
      decimals: number
      allData: OnBoardingFullData
      profileSpace: SpaceData | undefined
      proxyAddress: string
    },
  ) => Promise<any | any[]>
} = {
  topics: async ({ api, ipfs }, data, { allData, profileSpace }) => {
    const shouldUniteWithProfileCreation = allData.profile?.values && !allData.profile.isDraft
    if (shouldUniteWithProfileCreation) return

    const content = getSavedProfileData(profileSpace?.content)
    const cid = await ipfs.saveContentToOffchain({
      ...content,
      interests: data,
    } as any)
    if (!cid) throw new Error('Unable to save data to IPFS')
    return upsertProfile(api, cid, profileSpace?.id)
  },
  spaces: async ({ api }, data) => {
    return data.map(id => api.tx.spaceFollows.followSpace(id))
  },
  energy: async ({ api }, data, { decimals, myAddress }) => {
    const amount = balanceWithDecimal(data.toString(), decimals)
    return api.tx.energy.generateEnergy(myAddress, amount.toString())
  },
  profile: async ({ api, ipfs }, data, { allData, profileSpace }) => {
    const cid = await ipfs.saveContentToOffchain({
      ...data,
      interests: allData.topics?.values,
    } as any)
    if (!cid) throw new Error('Unable to save data to IPFS')
    return upsertProfile(api, cid, profileSpace?.id)
  },
  signer: async ({ api }, _, { proxyAddress }) => {
    return api.tx.proxy.addProxy(proxyAddress, null, 0)
  },
}
export function useOnBoardingBatchTxs(specificData?: keyof OnBoardingDataTypes) {
  const allData = useAllOnBoardingData()
  const myAddress = useMyAddress()
  const profileSpace = useSelectProfile(myAddress)
  const { api, ipfs } = useSubsocialApi()
  const { tokenDecimal } = useSubstrate()

  return useCallback(async () => {
    if (!myAddress) throw new Error('No address found')

    const proxyAddress = getProxyAddress()

    const generateBatchData = async (dataKey: keyof OnBoardingDataTypes) => {
      const additionalData = {
        decimals: tokenDecimal,
        myAddress,
        allData,
        profileSpace,
        proxyAddress,
      }
      const generator = txGenerators[dataKey]
      if (!generator) throw new Error(`Batch data with key: ${dataKey} does not exists`)

      const values = allData[dataKey]?.values as unknown as never
      const batchData = await generator({ api, ipfs }, values, additionalData)
      const batchDataArr = !Array.isArray(batchData) ? [batchData] : batchData

      return batchDataArr
    }

    if (specificData) {
      const batchData = await generateBatchData(specificData)
      return [[...batchData]]
    }

    const batches: any[] = []
    const promises = Object.entries(allData).map(async ([key, data]) => {
      if (data.isDraft) return

      const values = data.values
      if (values) {
        try {
          const batchData = await generateBatchData(key as keyof OnBoardingDataTypes)
          batches.push(...batchData)
        } catch {}
      }
    })

    await Promise.all(promises)
    const filteredBatch = batches.filter(isDefined)
    if (filteredBatch.length === 0) throw new Error('Batch does not contain anything')
    return [batches.filter(isDefined)]
  }, [allData])
}
