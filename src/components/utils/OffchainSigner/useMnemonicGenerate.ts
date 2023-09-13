import { mnemonicGenerate } from '@polkadot/util-crypto'
import { useEffect, useState } from 'react'

const useMnemonicGenerate = () => {
  const [mnemonic, setMnemonic] = useState<string>('')

  useEffect(() => {
    const mnemonic = mnemonicGenerate()
    setMnemonic(mnemonic)
  }, [])

  return {
    mnemonic,
  }
}

export default useMnemonicGenerate
