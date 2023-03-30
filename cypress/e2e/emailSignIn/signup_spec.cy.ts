/// <reference types="cypress-mailslurp" />

import { KeyringPair } from '@polkadot/keyring/types'
import {
  fillUpSignUpForm,
  goToSignInModal,
  HCAPTCHA_TEST_RESPONSE,
  newUser,
  resetSignInForm,
  shouldLogout,
  shouldOpenSignInModal,
  shouldSkipOnboarding,
} from './shared'
const { password } = newUser

const apiUrl = `${Cypress.env('offchainSignerApiBaseUrl')}`

type NewUserContext = {
  email?: string
  inboxId?: string
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

    it('should visit home page', function () {
      cy.visit('/')
    })

    it('should open sign up modal', function () {
      shouldOpenSignInModal()
      cy.get('button').contains('Create account').click()
    })

    context('testing forms', () => {
      before(() => {
        // Using the same inbox in mailslurp from before hook
        ctx.inboxId = '9d93062d-8d38-44fc-acc1-65c2aced1e17'
        ctx.email = '9d93062d-8d38-44fc-acc1-65c2aced1e17@mailslurp.com'
      })

      it('should fill up the sign up form', function () {
        fillUpSignUpForm(ctx.email!, password)
      })

      it('should show email confirmation modal', function () {
        // check if email confirmation modal is visible
        cy.contains('h2', 'Email confirmation').should('be.visible')
      })

      it('should show error with invalid code', function () {
        cy.get('[autocomplete="one-time-code"]').should('be.empty')
        cy.get('[autocomplete="one-time-code"]').type('000000')

        cy.get('.ant-btn-primary').should('be.enabled')
        cy.get('.ant-btn-primary').click()

        cy.get('div[role="alert"]').contains('Verification code is incorrect.').should('be.visible')

        for (let i = 1; i <= 6; i++) {
          cy.get(`input[type="tel"][aria-label="Character ${i}."]`).as(`character${i}Input`).clear()
        }
      })

      it('should receive a code and confirm it', function () {
        // app will send user an email containing a code, use mailslurp to wait for the latest email
        cy.mailslurp()
          // use inbox id and a timeout of 30 seconds
          .then(mailslurp => mailslurp.waitForLatestEmail(ctx.inboxId, 30000, true))
          // extract the confirmation code from the email body
          .then(email => /.*confirmation code is: (\d{6}).*/.exec(email.body!!)!![1])
          // fill out the confirmation form and submit
          .then(code => {
            cy.get('[autocomplete="one-time-code"]').should('be.empty')
            cy.get('[autocomplete="one-time-code"]').type(code)

            cy.get('.ant-btn-primary').should('be.enabled')
            cy.get('.ant-btn-primary').click()
          })
      })

      it('should open mnemonic modal and confirm saving mnemonic', function () {
        // check if mnemonic phrase modal is visible
        cy.contains('h2', 'Mnemonic phrase').should('be.visible')

        // confirm saving mnemonic
        cy.contains('span', 'I have saved my mnemonic').prev().click()

        cy.get('.ant-btn-primary').should('be.enabled')
        cy.get('.ant-btn-primary').click()
      })

      shouldSkipOnboarding()
      shouldLogout()

      it('should open sign in modal', function () {
        shouldOpenSignInModal()
      })

      it('should fill up the sign up form with already registered user', function () {
        cy.get('button').contains('Create account').click()

        fillUpSignUpForm(ctx.email!, password)

        cy.get('div[role="alert"]')
          .contains('This email address is already registered.')
          .should('be.visible')
      })

      it('should switch to sign in modal', function () {
        goToSignInModal()

        // check if mnemonic phrase modal is visible
        cy.contains('h2', 'Sign in with email').should('be.visible')
      })

      it('should fill up sign in form with incorrect data', () => {
        resetSignInForm()

        cy.get('#email').type('notarealemail').focus().blur()
        cy.get('.ant-form-item-explain > div').contains('Please enter a valid email address.')

        cy.get('#password').type('notarealpassword').focus().blur()
        cy.get(':nth-child(2) > .ant-col > .ant-form-item-explain > div').contains(
          'Your password should contain at least 8 characters, with at least one letter and one number.',
        )

        cy.contains('Log In').should('be.disabled')

        resetSignInForm()
      })

      it('should return error when unregistered user tries to login', () => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/email-sign-in`,
          body: {
            email: 'random@email.com',
            password: 'randompassword',
            hcaptchaResponse: HCAPTCHA_TEST_RESPONSE,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(401)
          expect(response.body.message).to.be.a('string')
          expect(response.body.message).contains('Email or password is incorrect.')
        })
      })

      it('should fill up sign in form', () => {
        cy.get('#email').type(ctx.email!)
        cy.get('#password').type(password)

        cy.contains('Log In').should('be.enabled')
        cy.contains('Log In').click()
      })

      shouldSkipOnboarding()
      shouldLogout()
    })
  })
})
