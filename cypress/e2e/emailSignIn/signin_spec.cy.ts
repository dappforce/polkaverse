import { registeredUser } from './shared'

const { email, password, hCaptchaResponse } = registeredUser

const apiUrl = `${Cypress.env('offchainSignerApiBaseUrl')}`

describe('sign in with email', () => {
  context('run before all tests', () => {
    before(() => {
      cy.visitAndWaitStartup({ url: '/' })
      cy.contains('Sign in').click()
    })
  })

  context('before testing forms', () => {
    const getMainSignInBtn = () => cy.contains('Sign in with email')
    const getBackBtn = () => cy.get('.MutedText > .font-weight-bold').contains('Back')

    it('should open sign in modal', () => {
      cy.visit('/')
      cy.get('button').contains('Sign in').click()
      getMainSignInBtn().click()
    })

    context('testing forms', () => {
      beforeEach(() => {
        getBackBtn().click()
        getMainSignInBtn().click()
        cy.get('#email').clear()
        cy.get('#password').clear()
      })

      it('should fill up sign in form with incorrect data', () => {
        cy.get('#email').type('notarealemail').focus().blur()
        cy.get('.ant-form-item-explain > div').contains('Please enter a valid email address.')

        cy.get('#password').type('notarealpassword').focus().blur()
        cy.get(':nth-child(2) > .ant-col > .ant-form-item-explain > div').contains(
          'Your password should contain at least 8 characters, with at least one letter and one number.',
        )

        cy.contains('Log In').should('be.disabled')
      })

      it('should fill up with wrong email/password', () => {
        cy.get('#email').type(email)
        cy.get('#password').type(`wrong${password}`)
        cy.contains('Log In').should('not.be.disabled')

        cy.contains('Log In').click()

        cy.get('.ant-form-item-explain > div').contains('email or password is incorrect')
      })

      it('should fill up sign in form', () => {
        cy.get('#email').type(email)

        cy.get('#password').type(password)

        cy.contains('Log In').should('not.be.disabled')
        cy.contains('Log In').click()
      })

      it('should create a POST request to /auth/email-sign-in', () => {
        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/email-sign-in`,
          body: {
            email,
            password,
            hcaptchaResponse: hCaptchaResponse,
          },
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.eq(201)
          expect(response.body.accessToken).to.be.a('string')
          expect(response.body.refreshToken).to.a('string')
        })
      })
    })
  })
})
