import { CODE_DIGIT } from 'src/config/ValidationsConfig'

export type RegexValidations = typeof RegexValidations[keyof typeof RegexValidations]
export const RegexValidations = {
  ValidEmail: new RegExp(/\S+@\S+\.\S+/),
  ValidPassword: new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
  ValidCode: new RegExp(`^[0-9]{${CODE_DIGIT}}$`),
} as const

export const useFormValidation = () => {
  const isValidEmail = (email: string) => RegexValidations.ValidEmail.test(email)
  const isValidPassword = (password: string) => RegexValidations.ValidPassword.test(password)
  const isValidCode = (code: string) => RegexValidations.ValidCode.test(code)

  return { isValidEmail, isValidPassword, isValidCode }
}
