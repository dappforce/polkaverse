import { Keyring } from '@polkadot/api'
import { hexToU8a, stringToU8a, u8aToHex, u8aToString } from '@polkadot/util'
import { keccakAsU8a, naclDecrypt, naclEncrypt } from '@polkadot/util-crypto'

const convertBufferToHex = (buffer: Uint8Array) => u8aToHex(buffer)

const generateSalt = () => {
  // has to be 32 bytes, otherwise naclEncrypt will throw an error
  const SALT_LENGTH = 32
  const arr = new Uint8Array(SALT_LENGTH)
  const arrayResult = crypto.getRandomValues(arr)

  return arrayResult
}

const HEX_CONSTANT = '0x80001f'

const generateNonce = () => Buffer.from(HEX_CONSTANT.padEnd(24, '\0'))

const generateAccount = async (seed: string) => {
  const { sr25519PairFromSeed, mnemonicToMiniSecret } = await import('@polkadot/util-crypto')
  const { toSubsocialAddress } = await import('@subsocial/utils')

  const miniSecret = mnemonicToMiniSecret(seed)
  const { publicKey: publicKeyBuffer } = sr25519PairFromSeed(miniSecret)

  const publicKey = convertBufferToHex(publicKeyBuffer)
  const secretKey = convertBufferToHex(miniSecret)

  return { publicAddress: toSubsocialAddress(publicKey)!, secretKey }
}

const generateSecret = (password: string, inputSaltStr?: string) => {
  const salt = inputSaltStr ? hexToU8a(inputSaltStr) : generateSalt()
  const saltStr = u8aToHex(salt)
  const secret = keccakAsU8a(saltStr + password)

  return {
    saltStr,
    secret,
  }
}

const encryptKey = (key: string, password: string) => {
  const messagePreEncryption = stringToU8a(key)

  const { saltStr, secret } = generateSecret(password)

  // use a static nonce
  const NONCE = generateNonce()

  const { encrypted } = naclEncrypt(messagePreEncryption, secret, NONCE)

  const encryptedMessage = u8aToHex(encrypted)

  return { encryptedMessage, saltStr }
}

const decryptKey = (encryptedMessage: string, saltStr: string, password: string) => {
  const { secret } = generateSecret(password, saltStr)
  const message = hexToU8a(encryptedMessage)
  const NONCE = generateNonce()

  const decrypted = naclDecrypt(message, NONCE, secret)

  return u8aToString(decrypted)
}

// works with mnemonic or raw string seed
const generateKeypairBySecret = (secret: string) => {
  const keyring = new Keyring({ type: 'sr25519' })

  const keypair = keyring.addFromUri(secret, {}, 'sr25519')
  return keypair
}

export { generateSalt, generateAccount, encryptKey, decryptKey, generateKeypairBySecret }
