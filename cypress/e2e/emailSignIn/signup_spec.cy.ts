import { Keyring } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { stringToU8a, u8aToHex } from '@polkadot/util'
import { mnemonicGenerate } from '@polkadot/util-crypto'
import { HCAPTCHA_TEST_RESPONSE, newUser } from './shared'
const { email, password } = newUser

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
    // Useful for creating new inbox everytime before test runs
    // Note: free mailslurp account is limited to 50 inboxes/month,
    // so it's better to use the same inbox for all tests
    // before(async function () {
    //   const mailslurp = await cy.mailslurp()
    //   const inbox = await mailslurp.createInbox()
    //   cy.log(`Inbox created with id ${inbox.id} and email address ${inbox.emailAddress}`)
    //   cy.wrap(inbox.id).as('inboxId')
    //   cy.wrap(inbox.emailAddress).as('emailAddress')
    // })

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

        // Using the same inbox in mailslurp from before hook
        ctx.inboxId = '9d93062d-8d38-44fc-acc1-65c2aced1e17'
        ctx.email = '9d93062d-8d38-44fc-acc1-65c2aced1e17@mailslurp.com'
      })

      it('should fill up the sign up form', () => {
        cy.get('#email').type(email)
        cy.get('#password').type(password)
        cy.get('#repeatPassword').type(password)
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

      it('should ask for sending email confirmation code', () => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/resend-email-confirmation`,
          headers: {
            Authorization: ctx.accessToken,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(201)
          expect(response.body.message).to.be.a('string')
          expect(response.body.message).to.be.equal('sent')
        })
      })
    })
  })
})
