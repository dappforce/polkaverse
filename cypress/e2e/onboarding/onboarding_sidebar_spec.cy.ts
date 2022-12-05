import { validations } from './shared'

describe('onboarding sidebar', () => {
  context('using fresh account', () => {
    beforeEach(() => {
      const freshAccountAddress = Cypress.env('fresh_account')
      cy.login(freshAccountAddress)
      cy.visitAndWaitStartup({ url: '/' })
    })

    it('tests quick start', () => {
      const getQuickStartBtn = () => cy.contains('Start a quick tour').closest('button')
      getQuickStartBtn().click()

      cy.contains(/^Create$/)

      const getBackBtn = () => cy.contains(/^Back$/).closest('button')
      const getNextBtn = () => cy.contains(/^Next$/).closest('button')
      getBackBtn().should('be.disabled')

      cy.contains(/^Create$/)

      getNextBtn().click()
      cy.contains(/^Read$/)

      getNextBtn().click()
      cy.contains(/^Discuss$/)

      getNextBtn().click()
      cy.contains(/^Monetize$/)
      cy.contains(/^Done$/)
        .closest('button')
        .click()

      cy.get('.ant-modal-content').should('not.be.visible')

      getQuickStartBtn().click()
      cy.contains(/^Create$/)
      getNextBtn().click()
      cy.contains(/^Read$/)
      getBackBtn().click()
      cy.contains(/^Create$/)

      cy.get('.ant-modal-close-x').closest('button').click()
      cy.get('.ant-modal-content').should('not.be.visible')
    })

    it('tests topics', () => {
      const topicsBtn = cy.contains('Choose your interests').closest('button')
      topicsBtn.click()
      validations.topics()
    })

    it('tests recommended spaces', () => {
      const spacesBtn = cy.contains('Follow recommended spaces').closest('button')
      spacesBtn.click()
      validations.spaces()
    })

    it('tests profile', () => {
      const profileBtn = cy.contains('Create your profile').closest('button')
      profileBtn.click()
      validations.profile()
    })

    it('tests energy', () => {
      const energyBtn = cy.contains('Get energy').closest('button')
      energyBtn.click()
      validations.energy()
    })

    it('tests subsocial username', () => {
      const dotsamaDomainBtn = cy
        .contains('Register a Subsocial Username')
        .closest('button')
        .closest('a')
      dotsamaDomainBtn.should('have.attr', 'href', '/dd')
      dotsamaDomainBtn.should('have.attr', 'target', '_blank')
    })
  })
})
