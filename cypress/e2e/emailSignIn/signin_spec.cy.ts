import { registeredUser } from './shared'

const { email, password, hCaptchaResponse } = registeredUser

const apiUrl = `${Cypress.env('offchainSignerApiBaseUrl')}`

describe('sign in with email', () => {
  context('using a registered email account', () => {
    beforeEach(() => {
      cy.visitAndWaitStartup({ url: '/' })
      cy.contains('Sign in').click()
    })
  })

  it('should open sign in modal', () => {
    cy.visit('/')
    cy.get('button').contains('Sign in').click()
    cy.contains('Sign in with email').click()
  })

  it('should fill up sign in form', () => {
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.get('button').contains('Log In').click()
  })

  it('should create a POST request to /auth/email-sign-in', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/email-sign-in`,
      body: {
        email,
        password,
        hCaptchaResponse,
      },
      failOnStatusCode: false,
    }).then(response => {
      // expect(response.status).to.eq(200)
      //   expect(response.body.accessToken).to.be.a('string')
      //   expect(response.body.refreshToken).to.a('string')
    })
  })
})
