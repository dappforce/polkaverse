import { hexToU8a, u8aToHex, u8aToString } from '@polkadot/util'
import { keccakAsU8a, naclDecrypt, naclEncrypt } from '@polkadot/util-crypto'

const generateSalt = () => {
  // has to be 32 bytes, otherwise naclEncrypt will throw an error
  const SALT_LENGTH = 32
  const arr = new Uint8Array(SALT_LENGTH)
  const arrayResult = crypto.getRandomValues(arr)

  return arrayResult
}

const convertBufferToHex = (buffer: Uint8Array) => u8aToHex(buffer)

const generateAccount = async (seed: string) => {
  const { sr25519PairFromSeed, mnemonicToMiniSecret } = await import('@polkadot/util-crypto')
  const { toSubsocialAddress } = await import('@subsocial/utils')

  const miniSecret = mnemonicToMiniSecret(seed)
  const { publicKey: publicKeyBuffer } = sr25519PairFromSeed(miniSecret)

  const publicKey = convertBufferToHex(publicKeyBuffer)
  const secretKey = convertBufferToHex(miniSecret)

  return { publicAddress: toSubsocialAddress(publicKey)!, secretKey }
}

const encryptKey = (key: string, password: string) => {
  const bufferKey = keccakAsU8a(key + password)

  const salt = generateSalt()

  // Encrypt secret key + password with salt
  const { encrypted, nonce } = naclEncrypt(bufferKey, salt)

  const encryptedMessage = u8aToHex(encrypted)
  const nonceStr = u8aToHex(nonce)

  // Encrypt salt with password
  const passwordBuffer = Buffer.from(password.padEnd(32, '\0'))
  const { encrypted: encryptedData, nonce: nonceData } = naclEncrypt(salt, passwordBuffer)

  const encryptedSalt = u8aToHex(encryptedData)
  const saltNonce = u8aToHex(nonceData)

  return { encryptedMessage, nonceStr, encryptedSalt, saltNonce }
}

const decryptKey = (encryptedKey: string, nonceStr: string, secretStr: string) => {
  const encrypted = hexToU8a(encryptedKey)
  const nonce = hexToU8a(nonceStr)
  const secret = hexToU8a(secretStr)

  const keyDecrypted = naclDecrypt(encrypted, nonce, secret)

  return u8aToString(keyDecrypted)
}

export { generateSalt, generateAccount, encryptKey, decryptKey }
