// run server locally and use hCaptcha test keys to bypass hCaptcha verification
export const HCAPTCHA_TEST_RESPONSE = '10000000-aaaa-bbbb-cccc-000000000001'

// need to register user first with POST /auth/email-sign-in
export const registeredUser = {
  email: 'tipada5450@kaudat.com',
  password: 'test12345',
}

// generate new email and put it here, e.g. using temp-mail.org
export const newUser = {
  email: 'd70c00d3-edbd-400f-8a6f-3e93f48175fe@mailslurp.com',
  inboxId: 'd70c00d3-edbd-400f-8a6f-3e93f48175fe',
  password: 'test12345',
}

export const getMainSignInBtn = () => cy.contains('Sign in with email')

export function shouldOpenSignInModal() {
  cy.get('.DfTopBar--rightContent > .ant-btn').as('signInBtn')
  cy.get('@signInBtn').should('be.visible')
  cy.get('@signInBtn').should('be.enabled')
  cy.get('@signInBtn').contains('Sign in').click()
  getMainSignInBtn().click()
}

export function shouldSkipOnboarding() {
  it('should skip whole onboarding process', () => {
    cy.contains('button', 'Skip').should('be.visible')
    cy.contains('button', 'Skip').click()
    cy.contains('button', 'Skip').click()
    cy.contains('button', 'Skip').click()
    cy.contains('button', 'Skip').click()
    cy.contains('button', 'Skip').click()
  })
}

export function shouldLogout() {
  it('should open choose account sidebar', () => {
    cy.get('.DfChooseAccount').should('be.visible')
    cy.get('.DfChooseAccount').click()
  })

  it('should log out', () => {
    cy.get('.ant-btn').contains('Sign out').should('be.visible')
    cy.get('.ant-btn').contains('Sign out').click()
  })
}

export function fillUpSignUpForm(email: string, password: string) {
  // check if sign up modal is visible
  cy.contains('h2', 'Create account with email').should('be.visible')

  // reset field first
  cy.get('#email').clear()
  cy.get('#password').clear()

  // fill sign up form
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('#repeatPassword').type(password)

  // confirm
  cy.contains('Sign Up').should('be.enabled')
  cy.contains('Sign Up').click()
}

export function goToSignInModal() {
  cy.contains('button[type="button"]', 'Sign In').should('be.visible')
  cy.contains('button[type="button"]', 'Sign In').should('be.enabled')
  cy.contains('button[type="button"]', 'Sign In').click()
}

export function resetSignInForm() {
  cy.get('#email').clear()
  cy.get('#password').clear()
}
