import { useContext } from 'react'
import { State, SubstrateContext } from './SubstrateContext'

export const useSubstrate = (): State => {
  const state = useContext(SubstrateContext)
  return state
}

export default useSubstrate
