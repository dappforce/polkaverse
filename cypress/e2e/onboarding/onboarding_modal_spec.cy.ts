import { getContinueBtn, validations, wording } from './shared'

const getSkipBtn = () => cy.get('button').contains('Skip').closest('button')
const getBackBtn = () => cy.contains('Step ').parent().children().first()
const getModal = () => cy.get('.ant-modal-content')

describe('onboarding modal', () => {
  context('using fresh account', () => {
    beforeEach(() => {
      const freshAccountAddress = '5HbAUnWjfS6xix33S5RMi1R99oG2TDMraQSRY4bP3fvycbSa'
      cy.login(freshAccountAddress, {
        withOnBoarding: true,
      })
      cy.visitAndWaitStartup({ url: '/' })
    })

    it('renders onboarding modal', () => {
      cy.contains('Step 1/')
      getContinueBtn().should('be.visible')
      getSkipBtn().should('be.visible')
    })

    it('should have correct continue validation and correct skip and back behavior', () => {
      // step 1: topics
      cy.contains('Step 1/')
      validations.topics()
      getContinueBtn().click()

      // step 2: spaces
      cy.contains('Step 2/')
      validations.spaces()
      getContinueBtn().click()

      // Step 3: Profile
      cy.contains('Step 3/')
      validations.profile()
      getContinueBtn().click()

      // Step 4: Energy
      cy.contains('Step 4/')
      validations.energy()

      // skip energy
      getSkipBtn().click()
      cy.contains('Not enough energy')
      cy.contains(wording.modalConfirmation.topics(1))
      cy.contains(wording.modalConfirmation.spaces(1))
      cy.contains(wording.modalConfirmation.profile())

      cy.contains('get energy here').click()
      cy.contains('Step 4/')

      // back and skip profile
      getBackBtn().click()
      getSkipBtn().click()
      getSkipBtn().click()
      cy.contains(wording.modalConfirmation.topics(1))
      cy.contains(wording.modalConfirmation.spaces(1))
      cy.contains(wording.modalConfirmation.profile()).should('not.exist')

      // back and skip all
      getBackBtn().click()
      getBackBtn().click()
      getBackBtn().click()
      getBackBtn().click()

      getSkipBtn().click()
      getSkipBtn().click()
      getSkipBtn().click()
      getSkipBtn().click()

      cy.contains('Onboarding skipped').should('be.visible')

      // finish onboarding
      cy.contains('Finish').click()
      getModal().should('not.exist')

      cy.reload()
      cy.waitNetwork()
      getModal().should('not.exist')
    })
  })

  context('using account with energy', () => {
    beforeEach(() => {
      const freshAccountAddress = Cypress.env('account_with_energy')
      cy.login(freshAccountAddress, {
        withOnBoarding: true,
      })
      cy.visitAndWaitStartup({ url: '/' })
    })

    it('can continue in energy step', () => {
      // step 1: topics
      cy.contains('Step 1/')
      cy.contains('Blockchain').click()
      getContinueBtn().click()
      getSkipBtn().click()
      getSkipBtn().click()

      // step 4: energy
      getContinueBtn().should('not.be.disabled')
      getContinueBtn().click()

      // confirmation step
      cy.contains('One more step...')
    })
  })
})
