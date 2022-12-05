interface LoginConfig {
  withOnBoarding?: boolean
}

declare namespace Cypress {
  interface Chainable {
    /**
     * Partial login by setting localStorage df.myAddress to address in params or address in cypress env as default
     * @example cy.login()
     */
    login(address?: string, config?: LoginConfig): Chainable<Element>
    waitNetwork(): Chainable<Element>
    visitAndWaitStartup(...params: Parameters<typeof cy['visit']>): Chainable<Element>
  }
}
