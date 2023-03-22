import { Keyring } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { stringToU8a, u8aToHex } from '@polkadot/util'
import { mnemonicGenerate } from '@polkadot/util-crypto'
import { HCAPTCHA_TEST_RESPONSE, registeredUser } from './shared'
// const { email, password, hCaptchaResponse } = newUser
const { email, password } = registeredUser

const apiUrl = `${Cypress.env('offchainSignerApiBaseUrl')}`

type NewUserContext = {
  email?: string
  password?: string
  proof?: string
  signedProof?: Uint8Array
  hCaptchaResponse?: string
  mnemonic?: string
  newPair?: KeyringPair
  accountAddress?: string
  accessToken?: string
  refreshToken?: string
}

describe('sign up with email', () => {
  context('run before all tests', () => {
    before(() => {
      cy.visitAndWaitStartup({ url: '/' })
      cy.contains('Sign in').click()
    })
  })

  context('before testing forms', () => {
    let ctx: NewUserContext = {}
    const getMainSignInBtn = () => cy.contains('Sign in with email')
    const getBackBtn = () => cy.get('.MutedText > .font-weight-bold').contains('Back')

    it('should open sign up modal', () => {
      cy.visit('/')
      cy.get('button').contains('Sign in').click()
      getMainSignInBtn().click()
      cy.get('button').contains('Create account').click()
    })

    context('testing forms', () => {
      beforeEach(() => {
        ctx.mnemonic = mnemonicGenerate()
        const keyring = new Keyring({ type: 'sr25519' })
        ctx.newPair = keyring.addFromUri(ctx.mnemonic)
        ctx.accountAddress = ctx.newPair.address
      })

      it('should generate proof successfully', () => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/generate-address-verification-proof`,
          body: {
            accountAddress: ctx.accountAddress,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(201)
          expect(response.body.proof).to.be.a('string')
          ctx.proof = response.body.proof
          const keyring = new Keyring({ type: 'sr25519' })
          const newPair = keyring.addFromUri(ctx.mnemonic)
          const message = stringToU8a(ctx.proof)
          ctx.signedProof = newPair.sign(message)
        })
      })

      it('should try to sign up with already registered user', () => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/email-sign-up`,
          body: {
            email,
            password,
            accountAddress: ctx.accountAddress,
            signedProof: u8aToHex(ctx.signedProof),
            proof: ctx.proof,
            hcaptchaResponse: HCAPTCHA_TEST_RESPONSE,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(201)
          expect(response.body.accessToken).to.be.a('string')
          expect(response.body.refreshToken).to.be.a('string')
          ctx.accessToken = response.body.accessToken
          ctx.refreshToken = response.body.refreshToken
        })
      })
    })
  })
})
