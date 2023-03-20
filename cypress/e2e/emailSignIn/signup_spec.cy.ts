import { newUser } from './shared'
const { email, password, hCaptchaResponse } = newUser

const apiUrl = `${Cypress.env('offchainSignerApiBaseUrl')}`

describe('sign up with email', () => {
  context('using new email account', () => {
    beforeEach(() => {
      cy.visitAndWaitStartup({ url: '/' })
      cy.contains('Sign in').click()
    })
  })

  it('should open sign up modal', () => {
    cy.visit('/')
    cy.get('button').contains('Sign in').click()
    cy.contains('Sign in with email').click()
    cy.get('button').contains('Create account').click()
  })

  it('should fill up sign up form', () => {
    cy.get('#email').type(email)
    cy.get('#password').type(password)
    cy.get('#repeatPassword').type(password)
    cy.get('button').contains('Sign Up').click()
  })

  it('should fail finishing hCaptcha', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/email-sign-up`,
      body: {
        email,
        password,
        hCaptchaResponse,
      },
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(400)
      expect(response.body.message).to.eq('Invalid hCaptcha')
    })
  })

  it('should create a POST request to /auth/email-sign-up', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/email-sign-up`,
      body: {
        email,
        password,
        hCaptchaResponse,
      },
      failOnStatusCode: false,
    }).then(response => {
      expect(response.status).to.eq(200)
      expect(response.body.accessToken).to.be.a('string')
      expect(response.body.refreshToken).to.a('string')
    })
  })
})
