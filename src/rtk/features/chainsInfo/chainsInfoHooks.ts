import { useAppSelector } from 'src/rtk/app/store'
import { MultiChainInfo, selectChainInfoList } from './chainsInfoSlice'

export const useChainInfo = () => {
  return useAppSelector<MultiChainInfo>(selectChainInfoList)
}
