export const wording = {
  modalConfirmation: {
    profile: () => 'Creating your profile',
    topics: (amount: number) => `Subscribing to ${amount} topics`,
    spaces: (amount: number) => `Subscribing to ${amount} spaces`,
    burnSub: (amount: number) => `Burning ${amount} SUB`,
  },
}

export const getContinueBtn = () => cy.get('button').contains('Continue').closest('button')
export const validations = {
  topics: () => {
    getContinueBtn().should('be.disabled')
    cy.contains('Blockchain').click()
    getContinueBtn().should('not.be.disabled')
    cy.contains('Blockchain').click()
    getContinueBtn().should('be.disabled')
    cy.contains('Blockchain').click()
  },
  spaces: () => {
    cy.waitForNetworkIdle(3000)
    getContinueBtn().should('be.disabled')
    cy.contains(/^Unfollow$/).should('not.exist')

    const follow = () =>
      cy
        .contains(/^Follow$/)
        .closest('button')
        .click()
    const unfollow = () =>
      cy
        .contains(/^Unfollow$/)
        .closest('button')
        .click()

    follow()
    getContinueBtn().should('not.be.disabled')
    unfollow()
    getContinueBtn().should('be.disabled')
    follow()
  },
  profile: () => {
    getContinueBtn().click()

    const getRequiredError = () => cy.contains('Name is required')
    const getTooShortError = () => cy.contains('Name is too short')
    getRequiredError().should('be.visible')
    cy.get('#name').type('as').blur()
    getTooShortError().should('be.visible')

    cy.get('#name').type('a').blur()
    getRequiredError().should('not.exist')
    getRequiredError().should('not.exist')
  },
  energy: () => {
    const getCreateEnergyTab = () => cy.contains('Create Energy')
    const getFreeEnergyTab = () => cy.contains('Get Free Energy')

    const getCopyEnergyCommandButton = () => cy.contains('!energy ').parent().find('button')
    const getBurnSubInput = () => cy.get('#amount')
    const getBurnSubError = () => cy.contains('You cannot burn more than your available balance')

    getCopyEnergyCommandButton().should('be.visible')

    getCreateEnergyTab().click()
    getBurnSubInput().should('be.visible')
    getBurnSubInput().type('1').blur()
    getBurnSubError().should('be.visible')
    getBurnSubInput().type('{backspace}').blur()
    getBurnSubError().should('not.exist')
    getBurnSubInput().type('1').blur()
    getBurnSubError().should('be.visible')

    getFreeEnergyTab().click()
    getCopyEnergyCommandButton().click()
    cy.contains('Copied')
  },
}
