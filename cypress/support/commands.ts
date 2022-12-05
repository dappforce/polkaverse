/// <reference types="cypress" />

import '@testing-library/cypress/add-commands'
import 'cypress-network-idle'
import 'cypress-wait-until'
import { createStorageKey } from '../../src/utils/storage'

Cypress.Commands.add('login', (address, config) => {
  const usedAddress = address || Cypress.env('my_address')
  localStorage.setItem('CurrentWalletName', 'polkadot-js')
  localStorage.setItem('df.myAddress', usedAddress)
  if (!config?.withOnBoarding) {
    localStorage.setItem(createStorageKey('onBoardingModalFinished', usedAddress), '1')
  }
})

Cypress.Commands.add('waitNetwork', () => {
  cy.waitForNetworkIdle(1000)
})

Cypress.Commands.add('visitAndWaitStartup', (...params) => {
  cy.visit(...params)
  cy.waitNetwork()
})
